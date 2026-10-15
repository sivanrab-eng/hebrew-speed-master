CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_client uuid NOT NULL,
  status text NOT NULL DEFAULT 'lobby',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_q int NOT NULL DEFAULT 0,
  q_started_at timestamptz,
  last_winner text,
  last_q int NOT NULL DEFAULT -1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  nickname text NOT NULL,
  score int NOT NULL DEFAULT 0,
  locked_q int NOT NULL DEFAULT -1,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, client_id)
);
GRANT SELECT ON public.rooms, public.room_players TO anon, authenticated;
GRANT ALL ON public.rooms, public.room_players TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read rooms" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "read players" ON public.room_players FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.mp_create_room(p_client uuid, p_nick text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text; v_id uuid;
BEGIN
  IF length(trim(p_nick)) < 1 OR length(p_nick) > 20 THEN RAISE EXCEPTION 'bad nickname'; END IF;
  LOOP
    v_code := lpad((floor(random()*10000))::int::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE code = v_code AND status <> 'finished');
  END LOOP;
  DELETE FROM rooms WHERE code = v_code;
  INSERT INTO rooms(code, host_client) VALUES (v_code, p_client) RETURNING id INTO v_id;
  INSERT INTO room_players(room_id, client_id, nickname) VALUES (v_id, p_client, trim(p_nick));
  RETURN v_code;
END $$;

CREATE OR REPLACE FUNCTION public.mp_join_room(p_code text, p_client uuid, p_nick text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r rooms;
BEGIN
  IF length(trim(p_nick)) < 1 OR length(p_nick) > 20 THEN RAISE EXCEPTION 'bad nickname'; END IF;
  SELECT * INTO r FROM rooms WHERE code = p_code FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'room not found'; END IF;
  IF EXISTS (SELECT 1 FROM room_players WHERE room_id = r.id AND client_id = p_client) THEN RETURN r.id; END IF;
  IF r.status <> 'lobby' THEN RAISE EXCEPTION 'game already started'; END IF;
  IF (SELECT count(*) FROM room_players WHERE room_id = r.id) >= 4 THEN RAISE EXCEPTION 'room full'; END IF;
  INSERT INTO room_players(room_id, client_id, nickname) VALUES (r.id, p_client, trim(p_nick));
  RETURN r.id;
END $$;

CREATE OR REPLACE FUNCTION public.mp_leave_room(p_room uuid, p_client uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM room_players WHERE room_id = p_room AND client_id = p_client
    AND (SELECT status FROM rooms WHERE id = p_room) = 'lobby';
END $$;

CREATE OR REPLACE FUNCTION public.mp_start_game(p_room uuid, p_client uuid, p_questions jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE rooms SET status = 'playing', questions = p_questions, current_q = 0,
    q_started_at = now() + interval '3 seconds', last_winner = NULL, last_q = -1
  WHERE id = p_room AND host_client = p_client AND status IN ('lobby','finished');
  UPDATE room_players SET score = 0, locked_q = -1 WHERE room_id = p_room;
END $$;

CREATE OR REPLACE FUNCTION public.mp_answer(p_room uuid, p_client uuid, p_q int, p_choice int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r rooms; p room_players; v_correct int; v_total int; v_locked int; v_players int;
BEGIN
  SELECT * INTO r FROM rooms WHERE id = p_room FOR UPDATE;
  IF r.status <> 'playing' OR r.current_q <> p_q OR now() < r.q_started_at THEN RETURN false; END IF;
  SELECT * INTO p FROM room_players WHERE room_id = p_room AND client_id = p_client;
  IF p.id IS NULL OR p.locked_q = p_q THEN RETURN false; END IF;
  v_correct := (r.questions -> p_q ->> 'w')::int;
  v_total := jsonb_array_length(r.questions);
  IF p_choice = v_correct THEN
    UPDATE room_players SET score = score + 1 WHERE id = p.id;
    UPDATE rooms SET last_winner = p.nickname, last_q = p_q, current_q = p_q + 1,
      q_started_at = now() + interval '2 seconds',
      status = CASE WHEN p_q + 1 >= v_total THEN 'finished' ELSE 'playing' END
    WHERE id = p_room;
    RETURN true;
  END IF;
  UPDATE room_players SET locked_q = p_q WHERE id = p.id;
  SELECT count(*) FILTER (WHERE locked_q = p_q), count(*) INTO v_locked, v_players FROM room_players WHERE room_id = p_room;
  IF v_locked >= v_players THEN
    UPDATE rooms SET last_winner = NULL, last_q = p_q, current_q = p_q + 1,
      q_started_at = now() + interval '2 seconds',
      status = CASE WHEN p_q + 1 >= v_total THEN 'finished' ELSE 'playing' END
    WHERE id = p_room;
  END IF;
  RETURN false;
END $$;

CREATE OR REPLACE FUNCTION public.mp_timeout(p_room uuid, p_q int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int;
BEGIN
  SELECT jsonb_array_length(questions) INTO v_total FROM rooms WHERE id = p_room;
  UPDATE rooms SET last_winner = NULL, last_q = p_q, current_q = p_q + 1,
    q_started_at = now() + interval '2 seconds',
    status = CASE WHEN p_q + 1 >= v_total THEN 'finished' ELSE 'playing' END
  WHERE id = p_room AND status = 'playing' AND current_q = p_q
    AND now() >= q_started_at + interval '10 seconds';
END $$;

GRANT EXECUTE ON FUNCTION public.mp_create_room, public.mp_join_room, public.mp_leave_room, public.mp_start_game, public.mp_answer, public.mp_timeout TO anon, authenticated;