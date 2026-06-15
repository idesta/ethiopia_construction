"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { Tenant } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";

interface HeroSectionProps {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}

/* ═══════════════════════════════════════════════════════════
   CONSTRUCTION IMAGES
   Real Unsplash photos, free license.
   Subjects: crane, villa, apartment, road, tall buildings,
   safety gear, dozer, excavator, truck, civil engineer.
   ═══════════════════════════════════════════════════════════ */
const IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",
    label: "Tower Crane",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
    label: "Villa House",
  },
  {
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80",
    label: "Apartment Block",
  },
  {
    url: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=900&q=80",
    label: "Asphalt Road",
  },
  {
    url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
    label: "Tall Buildings",
  },
  {
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80",
    label: "Safety Gear",
  },
  {
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=900&q=80",
    label: "Bulldozer",
  },
  {
    url: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=900&q=80",
    label: "Excavator",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    label: "Construction Truck",
  },
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    label: "Civil Engineers",
  },
];

/* ═══════════════════════════════════════════════════════════
   TILE GRID CONFIG  —  4 cols × 3 rows = 12 pieces
   ═══════════════════════════════════════════════════════════ */
const COLS = 4;
const ROWS = 3;

/* Pre-computed per-tile scatter destinations (unique directions) */
const SCATTER: { x: number; y: number; rot: number }[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    // Vector from centre (1.5, 1) in grid-units → scale up for dramatic scatter
    const dx = (c - 1.5) / 1.5;
    const dy = (r - 1.0) / 1.0;
    SCATTER.push({
      x:   dx * (160 + i * 14),
      y:   dy * (140 + i * 10) + (i % 3) * 20,
      rot: (i % 2 === 0 ? 1 : -1) * (15 + i * 5),
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   SINGLE TILE — clip-path trick to show its portion of image
   ═══════════════════════════════════════════════════════════ */
interface TileProps {
  url: string;
  label: string;
  col: number;
  row: number;
  idx: number;
  accent: string;
  phase: "enter" | "idle" | "exit";
}

function Tile({ url, label, col, row, idx, accent, phase }: TileProps) {
  const s = SCATTER[idx];

  /* ── Exit: tiles explode outward ── */
  const exitAnim = {
    x:       s.x,
    y:       s.y,
    rotate:  s.rot,
    scale:   0.45,
    opacity: 0,
    filter:  "blur(5px)",
    transition: {
      duration: 0.45,
      delay:    idx * 0.03,
      ease:     [0.4, 0, 0.8, 0] as [number, number, number, number],
    },
  };

  /* ── Enter: tiles fly in from scatter, bounce on landing ── */
  const enterInitial = {
    x:       s.x * 1.4,
    y:       s.y * 1.4,
    rotate:  s.rot * 1.5,
    scale:   0.3,
    opacity: 0,
    filter:  "blur(8px)",
  };

  const enterAnim = {
    x:       0,
    y:       0,
    rotate:  0,
    scale:   1,
    opacity: 1,
    filter:  "blur(0px)",
  };

  const enterTransition = {
    duration:   0.9,
    delay:      idx * 0.045,
    ease:       "easeOut" as const,
    scale: {
      type:      "spring" as const,
      stiffness: 280,
      damping:   14,
      delay:     idx * 0.045,
    },
    rotate: {
      type:      "spring" as const,
      stiffness: 200,
      damping:   12,
      delay:     idx * 0.045,
    },
  };

  /* ── Idle float: assembled tiles gently bob ── */
  const floatAmp = 3 + (idx % 4);
  const floatDur = 2.8 + (idx % 5) * 0.5;

  if (phase === "exit") {
    return (
      <motion.div
        className="hero-tile"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
        animate={exitAnim}
        style={{ gridColumn: col + 1, gridRow: row + 1 }}
      >
        <TileImage url={url} label={label} col={col} row={row} accent={accent} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="hero-tile"
      initial={enterInitial}
      animate={enterAnim}
      transition={enterTransition}
      style={{ gridColumn: col + 1, gridRow: row + 1 }}
    >
      {/* Bob after assembling */}
      <motion.div
        style={{ width: "100%", height: "100%" }}
        animate={{ y: [0, -floatAmp, 0] }}
        transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut", delay: idx * 0.15 }}
      >
        <TileImage url={url} label={label} col={col} row={row} accent={accent} />
      </motion.div>
    </motion.div>
  );
}

/* ── Inner image — clipped to show this tile's slice ── */
function TileImage({
  url, label, col, row, accent,
}: { url: string; label: string; col: number; row: number; accent: string }) {
  return (
    <div className="hero-tile-clip">
      <img
        src={url}
        alt={label}
        className="hero-tile-img"
        style={{
          transform: `translate(-${col * 100}%, -${row * 100}%)`,
          width:  `${COLS * 100}%`,
          height: `${ROWS * 100}%`,
        }}
        loading="eager"
        draggable={false}
      />
      {/* Accent border per tile */}
      <div className="hero-tile-border" style={{ borderColor: `${accent}40` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOSAIC — manages phase state machine:
   idle → (timer fires) → exit → enter → idle → …
   ═══════════════════════════════════════════════════════════ */
interface MosaicProps {
  accent: string;
  shouldReduce: boolean | null;
}

function Mosaic({ accent, shouldReduce }: MosaicProps) {
  const [current, setCurrent]   = useState(0);
  const [next,    setNext]      = useState(1);
  const [phase,   setPhase]     = useState<"idle" | "exit" | "enter">("idle");

  // Total exit duration: last tile delay + its duration
  const EXIT_DURATION  = (COLS * ROWS - 1) * 0.03  + 0.45 + 0.05; // ~0.87s
  const ENTER_DURATION = (COLS * ROWS - 1) * 0.045 + 0.9  + 0.15; // ~1.6s
  const HOLD_DURATION  = 4000; // ms to show each image

  const advance = useCallback((nextIdx: number) => {
    setNext(nextIdx);
    setPhase("exit");
  }, []);

  // After exit completes → swap image → start enter
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => {
      setCurrent(next);
      setPhase("enter");
    }, EXIT_DURATION * 1000);
    return () => clearTimeout(t);
  }, [phase, next, EXIT_DURATION]);

  // After enter completes → go idle
  useEffect(() => {
    if (phase !== "enter") return;
    const t = setTimeout(() => setPhase("idle"), ENTER_DURATION * 1000);
    return () => clearTimeout(t);
  }, [phase, ENTER_DURATION]);

  // Auto-advance timer — only fires during idle
  useEffect(() => {
    if (shouldReduce || phase !== "idle") return;
    const t = setTimeout(() => {
      advance((current + 1) % IMAGES.length);
    }, HOLD_DURATION);
    return () => clearTimeout(t);
  }, [shouldReduce, phase, current, advance]);

  const img   = IMAGES[current];
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => ({
    col: i % COLS,
    row: Math.floor(i / COLS),
    idx: i,
  }));

  return (
    <div className="hero-mosaic">
      {/* The grid — always rendered, tiles handle their own phase */}
      <div
        className="hero-mosaic-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows:    `repeat(${ROWS}, 1fr)`,
          gap: "4px",
          width:  "100%",
          height: "100%",
        }}
      >
        {tiles.map(({ col, row, idx }) => (
          <Tile
            key={`${current}-${idx}`}
            url={img.url}
            label={img.label}
            col={col}
            row={row}
            idx={idx}
            accent={accent}
            phase={phase === "exit" ? "exit" : "enter"}
          />
        ))}
      </div>

      {/* Dot nav */}
      <div className="hero-mosaic-dots" role="tablist" aria-label="Image navigation">
        {IMAGES.map((im, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`Show ${im.label}`}
            className={`hero-mosaic-dot${i === current ? " active" : ""}`}
            style={i === current ? { background: accent, transform: "scale(1.6)" } : {}}
            onClick={() => phase === "idle" && advance(i)}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!shouldReduce && phase === "idle" && (
        <motion.div
          key={`bar-${current}`}
          className="hero-mosaic-bar"
          style={{ background: accent }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: HOLD_DURATION / 1000, ease: "linear" }}
        />
      )}

      {/* Current image label */}
      <div className="hero-mosaic-label">
        <span style={{ color: accent }}>◆</span> {img.label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING BACKGROUND PARTICLES
   ═══════════════════════════════════════════════════════════ */
function Particles({ accent }: { accent: string }) {
  const pts = [
    { x: "8%",  y: "14%", s: 3,   d: 3.2 },
    { x: "90%", y: "10%", s: 2,   d: 4.1 },
    { x: "18%", y: "75%", s: 4,   d: 2.8 },
    { x: "82%", y: "70%", s: 2.5, d: 5.0 },
    { x: "50%", y: "6%",  s: 2,   d: 3.5 },
    { x: "3%",  y: "48%", s: 3,   d: 4.5 },
    { x: "96%", y: "52%", s: 2,   d: 3.8 },
    { x: "66%", y: "90%", s: 3,   d: 2.6 },
    { x: "34%", y: "92%", s: 2,   d: 4.8 },
    { x: "20%", y: "35%", s: 1.5, d: 6.0 },
  ];
  return (
    <div className="hero-particles" aria-hidden="true">
      {pts.map((p, i) => (
        <motion.div
          key={i}
          className="hero-particle"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, background: accent }}
          animate={{ y: [0, -20, 0], opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.28 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED NUMBER COUNTER
   ═══════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv  = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2.4, ease: "easeOut", delay: 0.9 });
    const unsub = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return () => { ctrl.stop(); unsub(); };
  }, [value, suffix, mv]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN HERO SECTION
   ═══════════════════════════════════════════════════════════ */
export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  /* Mouse tilt on right panel */
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const tiltX   = useSpring(useTransform(mouseY, [-0.5, 0.5], [ 6, -6]), { stiffness: 100, damping: 28 });
  const tiltY   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8,  8]), { stiffness: 100, damping: 28 });

  /* Scroll parallax */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const sceneY   = useTransform(scrollYProgress, [0, 1],    ["0%", "-20%"]);
  const sceneOp  = useTransform(scrollYProgress, [0, 0.6],  [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1],    ["0%", "-12%"]);
  const contentOp= useTransform(scrollYProgress, [0, 0.5],  [1, 0]);
  const springY  = useSpring(sceneY, { stiffness: 55, damping: 18 });

  const onMouseMove  = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width  - 0.5);
    mouseY.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const contact     = tenant.contacts?.[0];
  const words       = tenant.name.split(" ");
  const lastName    = words.at(-1) ?? "";
  const firstName   = words.slice(0, -1).join(" ");
  const yearsActive = tenant.founded_year ? new Date().getFullYear() - tenant.founded_year : null;

  /* Dynamic gradient from accent */
  const rr = parseInt(accent.slice(1, 3), 16);
  const gg = parseInt(accent.slice(3, 5), 16);
  const bb = parseInt(accent.slice(5, 7), 16);

  return (
    <section
      id="home"
      className="hero hero-split"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Background ── */}
      <div className="hero-mesh" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 68% 38%, rgba(${rr},${gg},${bb},0.20) 0%, transparent 65%),
          radial-gradient(ellipse 55% 50% at 18% 62%, rgba(111,139,171,0.13) 0%, transparent 58%),
          radial-gradient(ellipse 45% 65% at 88% 82%, rgba(${rr},${gg},${bb},0.09) 0%, transparent 55%),
          linear-gradient(168deg, #0a0b0d 0%, #0f1118 55%, #0a0b0d 100%)
        `
      }} />
      <div className="hero-grain" />
      <div className="hero-grid" />
      <Particles accent={accent} />

      {/* ── Split container ── */}
      <div className="hero-split-inner">

        {/* LEFT — text content */}
        <motion.div
          className="hero-content hero-content--left"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          style={{ y: shouldReduce ? 0 : contentY, opacity: shouldReduce ? 1 : contentOp }}
        >
          {/* Location badge */}
          <motion.div className="hero-badge" variants={heroChild}>
            <span className="hero-badge-dot" style={{ background: accent }} />
            <span style={{ color: accent }}>{contact?.city || "Addis Ababa"} · Ethiopia</span>
            {tenant.founded_year && (
              <span className="hero-badge-year">Est. {tenant.founded_year}</span>
            )}
          </motion.div>

          {/* Logo */}
          {tenant.logo_url && (
            <motion.div className="hero-brand" variants={heroChild}>
              <img src={tenant.logo_url} alt={`${tenant.name} logo`} className="hero-logo" />
            </motion.div>
          )}

          {/* Company name */}
          <motion.h1 className="hero-title display" variants={heroChild}>
            {firstName && <span className="hero-title-first">{firstName}</span>}
            <em className="hero-title-last" style={{ color: accent }}>{lastName}</em>
          </motion.h1>

          {/* Tagline */}
          <motion.p className="hero-tagline" variants={heroChild}>
            {tenant.tagline || "Building the future of Ethiopia, one structure at a time."}
          </motion.p>

          {/* Stats */}
          {yearsActive && (
            <motion.div className="hero-stats-row" variants={heroChild}>
              <div className="hero-stat">
                <span className="hero-stat-num" style={{ color: accent }}>
                  <AnimatedNumber value={yearsActive} suffix="+" />
                </span>
                <span className="hero-stat-label">Years</span>
              </div>
              <div className="hero-stat-divider" style={{ background: accent }} />
              <div className="hero-stat">
                <span className="hero-stat-num" style={{ color: accent }}>
                  <AnimatedNumber value={tenant.projects?.length ?? 0} suffix="+" />
                </span>
                <span className="hero-stat-label">Projects</span>
              </div>
              <div className="hero-stat-divider" style={{ background: accent }} />
              <div className="hero-stat">
                <span className="hero-stat-num" style={{ color: accent }}>
                  <AnimatedNumber value={tenant.team?.length ?? 0} suffix="+" />
                </span>
                <span className="hero-stat-label">Experts</span>
              </div>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div className="hero-actions" variants={heroChild}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onScrollTo("projects")}
              style={{ background: accent }}
            >
              View Our Work
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" className="btn-outline" onClick={() => onScrollTo("contact")}>
              Get a Quote
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT — photo mosaic with scatter/bounce/assemble */}
        <motion.div
          className="hero-scene-wrap"
          style={{
            y:       shouldReduce ? 0 : springY,
            opacity: shouldReduce ? 1 : sceneOp,
          }}
        >
          {/* Depth rings */}
          <div className="hero-depth-ring hero-depth-ring--1" style={{ borderColor: `${accent}16` }} />
          <div className="hero-depth-ring hero-depth-ring--2" style={{ borderColor: `${accent}0c` }} />

          {/* Mouse-tilt wrapper */}
          <motion.div
            className="hero-tilt"
            style={{
              rotateX:        shouldReduce ? 0 : tiltX,
              rotateY:        shouldReduce ? 0 : tiltY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Glow halo behind mosaic */}
            <div
              className="hero-iso-glow"
              style={{ background: `radial-gradient(ellipse 65% 55% at 50% 52%, ${accent}22, transparent 68%)` }}
            />

            {/* THE MOSAIC */}
            <Mosaic accent={accent} shouldReduce={shouldReduce} />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
      </div>
    </section>
  );
}
