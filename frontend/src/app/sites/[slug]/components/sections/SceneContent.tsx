"use client";

import React, { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

type BuiltinScene =
  | { type: "builtin"; label: string; Component: React.FC<{ a: string }> }
  | { type: "uploaded"; label: string; url: string };

function isLottieUrl(url: string) {
  return url.toLowerCase().endsWith(".json");
}

/* ═══════════════════════════════════════════════════════════════════
   LOTTIE SCENE
   ───────────────────────────────────────────────────────────────────
   Plays a Lottie file straight through lottie-web's own SVG renderer.
   We load it by `path` so the browser fetches + caches the json file
   itself (as a normal static asset), instead of us pulling it into
   the JS bundle. lottie-web is dynamically imported inside the
   effect so nothing here ever touches the DOM during SSR.
   ═══════════════════════════════════════════════════════════════════ */

// Multiple stops (rather than one hard edge) make the falloff read as a
// smooth gradient instead of a circle suddenly appearing — opaque core,
// then a long, gradual fade out to fully transparent at the very edge.
const VIGNETTE_MASK =
  "radial-gradient(ellipse at center, black 25%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 85%, transparent 100%)";

function LottieScene({ url, accent }: { url: string; accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: url,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
    });

    return () => {
      cancelled = true;
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [url]);

  // isolation:"isolate" scopes the blend mode to just these two layers,
  // so the tint doesn't also blend with whatever sits behind the scene.
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        isolation: "isolate",
        WebkitMaskImage: VIGNETTE_MASK,
        maskImage: VIGNETTE_MASK,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          filter: "grayscale(1) contrast(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: accent,
          mixBlendMode: "color",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function SceneContent({
  scene,
  accent,
}: {
  scene: BuiltinScene;
  accent: string;
}) {
  if (scene.type === "builtin") {
    const Component = scene.Component;
    return <Component a={accent} />;
  }

  // Uploaded image OR lottie json — ".json" also covers the 6 built-in
  // cinematic scenes from BuiltinLottieScenes.tsx, same shape, same path.
  if (isLottieUrl(scene.url)) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <LottieScene url={scene.url} accent={accent} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={scene.url}
        alt={scene.label}
        style={{
          maxWidth: "80%",
          maxHeight: "80%",
          objectFit: "contain",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}
