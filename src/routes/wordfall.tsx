import { createFileRoute } from "@tanstack/react-router";
import { Wordfall } from "@/components/Wordfall";
import { wordfallMeta } from "@/lib/wordfall-config";

export const Route = createFileRoute("/wordfall")({
  head: () => ({ meta: wordfallMeta }),
  component: Wordfall,
});