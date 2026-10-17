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
