"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValue,
  MotionValue,
} from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { Tenant, HeroSlide } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";
import { getBuiltinScene, BUILTIN_SCENES } from "./BuiltinScenes";
import { Particles } from "./HeroSection";

const HOLD_MS = 6000; // how long a non-video slide stays up before advancing
const TRANSITION = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

function isVideoRef(url: string | null | undefined) {
  return !!url && /\.(mp4|webm|mov)$/i.test(url);
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE VISUAL — resolves a slide's media_type/media_ref into the
   actual thing to render: one of the 10 built-in 3D construction
   scenes, an uploaded video, or an uploaded image.
   ═══════════════════════════════════════════════════════════════════ */
function SlideVisual({
  slide,
  accent,
  shouldReduce,
  onVideoEnded,
}: {
  slide: HeroSlide;
  accent: string;
  shouldReduce: boolean | null;
  onVideoEnded: () => void;
}) {
  if (slide.media_type === "builtin_scene") {
    const scene = getBuiltinScene(slide.media_ref) || BUILTIN_SCENES[0];
    const Component = scene.Component;
    return <Component a={accent} />;
  }

  if (slide.media_type === "uploaded" && slide.media_ref) {
    if (isVideoRef(slide.media_ref)) {
      if (shouldReduce) {
        return (
          <img
            src={slide.poster_url || slide.media_ref}
            alt={slide.headline}
            className="hslide-media"
          />
        );
      }
      return (
        <video
          className="hslide-media"
          src={slide.media_ref}
          poster={slide.poster_url || undefined}
          aria-label={slide.headline}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onVideoEnded}
          onError={onVideoEnded}
        />
      );
    }
    return (
      <img
        src={slide.media_ref}
        alt={slide.headline}
        className="hslide-media"
      />
    );
  }

  // media_ref missing/invalid — fall back to the first built-in scene
  // rather than rendering nothing.
  const fallback = BUILTIN_SCENES[0];
  const FallbackComponent = fallback.Component;
  return <FallbackComponent a={accent} />;
}

/* ═══════════════════════════════════════════════════════════════════
   HERO SLIDESHOW
   ═══════════════════════════════════════════════════════════════════ */
export function HeroSlideshow({
  tenant,
  accent,
  onScrollTo,
}: {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}) {
  const slides = tenant.hero_slides;
  const N = slides.length;
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const [current, setCurrent] = useState(0);
  const advance = useCallback(() => setCurrent((c) => (c + 1) % N), [N]);

  // Non-video slides advance on a fixed hold; video slides advance via
  // `onEnded` instead (passed to SlideVisual as onVideoEnded), so
  // pacing always matches what's actually playing on screen.
  useEffect(() => {
    if (shouldReduce || N <= 1) return;
    const slide = slides[current];
    const isVideo =
      slide.media_type === "uploaded" && isVideoRef(slide.media_ref);
    if (isVideo) return;
    const t = setTimeout(advance, HOLD_MS);
    return () => clearTimeout(t);
  }, [current, shouldReduce, slides, advance, N]);

  // Mouse tilt — same feel as the single hero's scene panel. Only
  // applied to the "split" layout (see render below); a full-bleed
  // background tilting with the cursor reads as the whole page
  // wobbling, not a deliberate effect.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 80,
    damping: 22,
  });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 80,
    damping: 22,
  });
  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll parallax — identical shape to the single hero, so scrolling
  // away from the hero behaves the same regardless of which is active.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const contentOp = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const sceneOp = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const springSceneY = useSpring(sceneY, { stiffness: 50, damping: 18 });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  const slide = slides[current];
  const slideAccent = slide.accent_override || accent;

  const rr = parseInt(slideAccent.slice(1, 3), 16);
  const gg = parseInt(slideAccent.slice(3, 5), 16);
  const bb = parseInt(slideAccent.slice(5, 7), 16);

  return (
    <section
      id="home"
      className="hero hero-v3"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="hero-mesh"
        style={{
          background: `
          radial-gradient(ellipse 75% 60% at 68% 40%,rgba(${rr},${gg},${bb},0.20) 0%,transparent 62%),
          radial-gradient(ellipse 50% 45% at 18% 65%,rgba(111,139,171,0.12) 0%,transparent 55%),
          radial-gradient(ellipse 40% 55% at 92% 82%,rgba(${rr},${gg},${bb},0.10) 0%,transparent 52%),
          linear-gradient(168deg,#09090c 0%,#0c0e15 55%,#09090c 100%)
        `,
        }}
      />
      <div className="hero-grain" />
      <div className="hero-grid" />
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-150px 0",
          backgroundImage: `radial-gradient(${slideAccent}26 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          y: parallaxY,
        }}
      />
      <Particles accent={slideAccent} />

      <AnimatePresence mode="wait">
        {slide.layout === "full-bleed" ? (
          <FullBleedSlide
            key={slide.id}
            slide={slide}
            accent={slideAccent}
            shouldReduce={shouldReduce}
            onVideoEnded={advance}
            onScrollTo={onScrollTo}
          />
        ) : (
          <SplitSlide
            key={slide.id}
            slide={slide}
            accent={slideAccent}
            shouldReduce={shouldReduce}
            onVideoEnded={advance}
            onScrollTo={onScrollTo}
            contentY={contentY}
            contentOp={contentOp}
            sceneY={springSceneY}
            sceneOp={sceneOp}
            tiltX={tiltX}
            tiltY={tiltY}
          />
        )}
      </AnimatePresence>

      {N > 1 && (
        <div className="hslide-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show slide ${i + 1}: ${s.headline}`}
              className={`hslide-dot${i === current ? " active" : ""}`}
              style={i === current ? { background: slideAccent } : {}}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      <div className="hero-scroll">
        <span>Scroll</span>
        <div
          className="scroll-line"
          style={{
            background: `linear-gradient(to bottom,${slideAccent},transparent)`,
          }}
        />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SPLIT LAYOUT — matches the original single-hero composition:
   text left, scene right, scroll parallax + mouse tilt on the scene.
   ═══════════════════════════════════════════════════════════════════ */
function SplitSlide({
  slide,
  accent,
  shouldReduce,
  onVideoEnded,
  onScrollTo,
  contentY,
  contentOp,
  sceneY,
  sceneOp,
  tiltX,
  tiltY,
}: {
  slide: HeroSlide;
  accent: string;
  shouldReduce: boolean | null;
  onVideoEnded: () => void;
  onScrollTo: (id: string) => void;
  contentY: MotionValue<string>;
  contentOp: MotionValue<number>;
  sceneY: MotionValue<string>;
  sceneOp: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  return (
    <motion.div
      className="hero-split"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION}
    >
      <motion.div
        className="hero-left"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        style={{
          y: shouldReduce ? 0 : contentY,
          opacity: shouldReduce ? 1 : contentOp,
        }}
      >
        <motion.h1 className="hero-title display" variants={heroChild}>
          {slide.headline}
        </motion.h1>
        {slide.tagline && (
          <motion.p className="hero-tagline" variants={heroChild}>
            {slide.tagline}
          </motion.p>
        )}
        <motion.div className="hero-actions" variants={heroChild}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onScrollTo(slide.cta_target || "projects")}
            style={{ background: accent }}
          >
            {slide.cta_label || "View Our Work"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-right"
        style={{
          y: shouldReduce ? 0 : sceneY,
          opacity: shouldReduce ? 1 : sceneOp,
        }}
      >
        <motion.div
          className="hero-right-tilt"
          style={{
            rotateX: shouldReduce ? 0 : tiltX,
            rotateY: shouldReduce ? 0 : tiltY,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="hscene-stage">
            <div
              className="hscene-glow"
              style={{
                background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent}20, transparent 68%)`,
              }}
            />
            <div className="hscene-main">
              <SlideVisual
                slide={slide}
                accent={accent}
                shouldReduce={shouldReduce}
                onVideoEnded={onVideoEnded}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FULL-BLEED LAYOUT — the scene fills the whole hero; text sits on
   top of it over a dark scrim. No mouse tilt (see note above); a
   slow scale drift gives it some life instead.
   ═══════════════════════════════════════════════════════════════════ */
function FullBleedSlide({
  slide,
  accent,
  shouldReduce,
  onVideoEnded,
  onScrollTo,
}: {
  slide: HeroSlide;
  accent: string;
  shouldReduce: boolean | null;
  onVideoEnded: () => void;
  onScrollTo: (id: string) => void;
}) {
  return (
    <motion.div
      className="hslide-fullbleed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION}
    >
      <motion.div
        className="hslide-fullbleed-media"
        initial={{ scale: shouldReduce ? 1 : 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: HOLD_MS / 1000 + 0.45, ease: "linear" }}
      >
        <SlideVisual
          slide={slide}
          accent={accent}
          shouldReduce={shouldReduce}
          onVideoEnded={onVideoEnded}
        />
      </motion.div>
      <div className="hslide-fullbleed-scrim" />
      <motion.div
        className="hslide-fullbleed-content"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-title display" variants={heroChild}>
          {slide.headline}
        </motion.h1>
        {slide.tagline && (
          <motion.p className="hero-tagline" variants={heroChild}>
            {slide.tagline}
          </motion.p>
        )}
        <motion.div className="hero-actions" variants={heroChild}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onScrollTo(slide.cta_target || "projects")}
            style={{ background: accent }}
          >
            {slide.cta_label || "View Our Work"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
