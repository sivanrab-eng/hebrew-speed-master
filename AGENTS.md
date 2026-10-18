<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Select the standalone GitHub game with the build-time VITE_WORDFALL_ONLY flag; keep the default Lovable entry unchanged so deployments can share source without replacing the arcade.
- Keep home-screen installation manifest-only and scoped to the GitHub base path; offline caching is not requested and must not affect previews.
- Wordfall analytics are browser-only, optional when no measurement ID is configured, and contain aggregate gameplay events without player identifiers.
- Keep word-rain progression and timing in a pure shared helper and apply speed changes at round boundaries so timers and falling animations stay synchronized.
- Keep source vocabulary in a shared data module consumed by every game; merge duplicate visible Hebrew labels and render only available details so questions stay unambiguous without fabricated enrichment.
- Export the separate Wordfall repository from the falling-word game's dependency subset with its own root route and hosting base path, excluding other games and backend clients so the original arcade remains independent.
- Isolate standalone vocabulary tiers, confidence-word mixing and success progression in a pure Wordfall helper; keep progress in the mounted game rather than device storage so fresh visits start from the initial tier without changing arcade vocabulary or mid-game difficulty.
- Store standalone English meanings and Hebrew difficulty tags as a complete overlay keyed by source labels, preserving source vocabulary in other games; exclude distractors sharing a target meaning to keep matching unambiguous.
- Keep standalone repetition batches and introduced-word history in the mounted game; gate falling timers behind introductions and apply eligible tier advancement only on explicit choice so confidence support never alters arcade play.
- Speak the Wordfall introduction through a cancellable English-then-Hebrew pair with end/error sequencing, fallback and repeat control; invalidate stale timers so earlier readings cannot collide.
- Keep standalone sentence examples in a complete label-keyed overlay and catch/score visuals in focused modules; freeze standalone sentence catches until speech completion with an audio-failure watchdog, preserving independent arcade timing and audio.
- Refresh standalone replay targets within everyday/base/later-tier categories in the pure difficulty helper, then interleave them; this preserves difficulty counts and introduction history while providing variety.
- Keep Wordfall vocalized word and sentence speech in a static label-keyed overlay consumed only by standalone call sites; visible vocabulary and shared arcade speech must remain independent, with no runtime vocalization service.
