"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { AnimationItem } from "lottie-web";

type BuiltinScene =
  | { type: "builtin"; label: string; Component: React.FC<{ a: string }> }
  | { type: "uploaded"; label: string; url: string };

const LottiePlayer = dynamic(
  async () => {
    const mod = await import("lottie-react");
    return mod;
  },
  { ssr: false },
);

function isLottieUrl(url: string) {
  return url.toLowerCase().endsWith(".json");
}

export function SceneContent({
  scene,
  accent,
}: {
  scene: BuiltinScene;
  accent: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (scene.type === "builtin") {
    const Component = scene.Component;
    return <Component a={accent} />;
  }

  // Uploaded image OR lottie json
  if (isLottieUrl(scene.url)) {
    // For lottie-react: use animationData OR animationUrl.
    // Using animationData would require fetching+parsing; lottie-react supports animationUrl.
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
        {/* lottie-react typings vary by version; use any to avoid TS friction */}
        {isMounted && LottiePlayer && (
          <LottiePlayer
            style={{ maxWidth: "80%", maxHeight: "80%" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ src: scene.url } as any)}

            loop
            autoplay
          />
        )}
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
