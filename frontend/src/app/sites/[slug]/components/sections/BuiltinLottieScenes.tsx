/* ═══════════════════════════════════════════════════════════════════
   BUILT-IN CINEMATIC SCENES
   ───────────────────────────────────────────────────────────────────
   Companion to BuiltinScenes.tsx, but for the 6 cinematic clips
   instead of hand-drawn line art.

   These six .json files are valid Lottie documents, but unlike a
   normal Lottie export they don't contain vector shapes — every
   layer is a captured video frame (73-75 embedded WebP images per
   file, ~1.2-2.3MB each). There's no path data to hand-code into SVG
   the way SceneCrane/SceneVilla/etc. were drawn, so this file holds
   only metadata (label + url). The actual playback is handled by
   SceneContent.tsx, which feeds the url straight into lottie-web's
   own SVG renderer — so it still ends up as real <svg>/<image>
   elements in the DOM, just driven from a fetched file instead of
   inline JSX.

   SETUP: copy the 6 .json files into your Next.js `public/scenes/`
   folder (or wherever you serve static files from) so these urls
   resolve. If you serve them from somewhere else (your Express
   backend, a CDN, etc.) just change the urls below to match.
   ═══════════════════════════════════════════════════════════════════ */

export interface BuiltinLottieScene {
  label: string;
  url: string;
}

export const BUILTIN_LOTTIE_SCENES: BuiltinLottieScene[] = [
  { label: "Bridge Build", url: "/scenes/bridge-motion-video.json" },
  { label: "Tower Rising", url: "/scenes/building-motion-video.json" },
  { label: "Safety First", url: "/scenes/cape-motion-video.json" },
  { label: "Dozer Reveal", url: "/scenes/dozer-motion-video.json" },
  { label: "Excavator Reveal", url: "/scenes/excavator-motion-video.json" },
  { label: "Steel & Iron", url: "/scenes/iron-steel-motion.json" },
];
