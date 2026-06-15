"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValue,
  animate,
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
   10 REAL CONSTRUCTION PHOTOS — Unsplash free CDN
   No repo storage needed — loaded directly from Unsplash CDN.
   ═══════════════════════════════════════════════════════════ */
const IMAGES = [
  { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",  label: "Tower Crane" },
  { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",  label: "Villa House" },
  { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80",  label: "Apartment Block" },
  { url: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=900&q=80",  label: "Asphalt Road" },
  { url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",  label: "Tall Buildings" },
  { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80",  label: "Safety Gear" },
  { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=900&q=80",  label: "Bulldozer" },
  { url: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=900&q=80",  label: "Excavator" },
  { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",     label: "Construction Truck" },
  { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",  label: "Civil Engineers" },
];

/* ═══════════════════════════════════════════════════════════
   TILE GRID  —  4 cols × 3 rows = 12 tiles
   Each tile clips to its portion of the full image.
   Scatter vectors push tiles wide across the hero viewport.
   ═══════════════════════════════════════════════════════════ */
const COLS = 4;
const ROWS = 3;
const N    = COLS * ROWS; // 12

// Scatter destinations — spread across full hero (large values = cross-section travel)
const SCATTER = Array.from({ length: N }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const dx  = (col - (COLS - 1) / 2) / ((COLS - 1) / 2); // -1 … +1
  const dy  = (row - (ROWS - 1) / 2) / ((ROWS - 1) / 2); // -1 … +1
  return {
    x:   dx * (340 + i * 28),           // wide horizontal scatter
    y:   dy * (260 + i * 18) - i * 6,   // tall vertical scatter
    rot: (i % 2 === 0 ? 1 : -1) * (18 + i * 6),
  };
});

/* ═══════════════════════════════════════════════════════════
   SINGLE TILE
   ═══════════════════════════════════════════════════════════ */
interface TileProps {
  url:    string;
  label:  string;
  col:    number;
  row:    number;
  idx:    number;
  accent: string;
  phase:  "enter" | "exit";
  tileW:  number;
  tileH:  number;
}

function Tile({ url, label, col, row, idx, accent, phase, tileW, tileH }: TileProps) {
  const s = SCATTER[idx];
  const floatAmp = 4 + (idx % 4);
  const floatDur = 3.0 + (idx % 5) * 0.4;

  if (phase === "exit") {
    return (
      <motion.div
        className="htile"
        style={{ width: tileW, height: tileH, position: "absolute",
          left: col * (tileW + 4), top: row * (tileH + 4) }}
        initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
        animate={{
          x: s.x, y: s.y, rotate: s.rot,
          scale: 0.35, opacity: 0, filter: "blur(6px)",
        }}
        transition={{
          duration: 0.5,
          delay:    idx * 0.028,
          ease:     [0.4, 0, 0.9, 0.1] as [number,number,number,number],
        }}
      >
        <TileInner url={url} label={label} col={col} row={row} accent={accent} />
      </motion.div>
    );
  }

  // Enter — fly in from scatter, spring-bounce on landing
  return (
    <motion.div
      className="htile"
      style={{ width: tileW, height: tileH, position: "absolute",
        left: col * (tileW + 4), top: row * (tileH + 4) }}
      initial={{ x: s.x * 1.3, y: s.y * 1.3, rotate: s.rot * 1.4,
        scale: 0.25, opacity: 0, filter: "blur(10px)" }}
      animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.0, // overridden per-property below
        x:       { type: "spring", stiffness: 220, damping: 22, delay: idx * 0.042 },
        y:       { type: "spring", stiffness: 220, damping: 22, delay: idx * 0.042 },
        rotate:  { type: "spring", stiffness: 180, damping: 14, delay: idx * 0.042 },
        scale:   { type: "spring", stiffness: 300, damping: 12, delay: idx * 0.042 },
        opacity: { duration: 0.35, delay: idx * 0.042 },
        filter:  { duration: 0.5,  delay: idx * 0.042 },
      }}
    >
      {/* Continuous float after assembly */}
      <motion.div
        style={{ width: "100%", height: "100%" }}
        animate={{ y: [0, -floatAmp, 0] }}
        transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut", delay: idx * 0.12 }}
      >
        <TileInner url={url} label={label} col={col} row={row} accent={accent} />
      </motion.div>
    </motion.div>
  );
}

function TileInner({ url, label, col, row, accent }:
  { url: string; label: string; col: number; row: number; accent: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%",
      overflow: "hidden", borderRadius: 5 }}>
      <img
        src={url}
        alt={label}
        style={{
          position:  "absolute",
          top:       0,
          left:      0,
          width:     `${COLS * 100}%`,
          height:    `${ROWS * 100}%`,
          transform: `translate(-${col * 100}%, -${row * 100}%)`,
          objectFit: "cover",
          userSelect: "none",
          pointerEvents: "none",
        }}
        loading="eager"
        draggable={false}
        crossOrigin="anonymous"
      />
      {/* Accent border */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 5,
        border: `1px solid ${accent}50`, pointerEvents: "none",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOSAIC — state machine: idle → exit → enter → idle
   ═══════════════════════════════════════════════════════════ */
interface MosaicProps { accent: string; shouldReduce: boolean | null }

// Mosaic assembled size
const MOSAIC_W = 480;
const MOSAIC_H = 380;
const TILE_W   = Math.floor((MOSAIC_W - (COLS - 1) * 4) / COLS);
const TILE_H   = Math.floor((MOSAIC_H - (ROWS - 1) * 4) / ROWS);

function Mosaic({ accent, shouldReduce }: MosaicProps) {
  const [current, setCurrent] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [phase,   setPhase]   = useState<"idle" | "exit" | "enter">("enter");

  const EXIT_MS  = (N - 1) * 28 + 500 + 80;   // ~900ms
  const ENTER_MS = (N - 1) * 42 + 900 + 200;  // ~1600ms
  const HOLD_MS  = 4000;

  const goTo = useCallback((idx: number) => {
    if (phase !== "idle") return;
    setNextIdx(idx);
    setPhase("exit");
  }, [phase]);

  // exit → swap → enter
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => { setCurrent(nextIdx); setPhase("enter"); }, EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, nextIdx, EXIT_MS]);

  // enter → idle
  useEffect(() => {
    if (phase !== "enter") return;
    const t = setTimeout(() => setPhase("idle"), ENTER_MS);
    return () => clearTimeout(t);
  }, [phase, ENTER_MS]);

  // auto-advance
  useEffect(() => {
    if (shouldReduce || phase !== "idle") return;
    const t = setTimeout(() => goTo((current + 1) % IMAGES.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [shouldReduce, phase, current, goTo]);

  const img   = IMAGES[current];
  const tiles = Array.from({ length: N }, (_, i) => ({
    col: i % COLS, row: Math.floor(i / COLS), idx: i,
  }));

  return (
    <div className="htile-stage">
      {/* Assembled mosaic container — tiles use absolute positioning within */}
      <div
        className="htile-grid"
        style={{ width: MOSAIC_W, height: MOSAIC_H, position: "relative" }}
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
            tileW={TILE_W}
            tileH={TILE_H}
          />
        ))}
      </div>

      {/* Dot nav */}
      <div className="htile-dots">
        {IMAGES.map((im, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${im.label}`}
            className={`htile-dot${i === current ? " active" : ""}`}
            style={i === current ? { background: accent, transform: "scale(1.7)" } : {}}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!shouldReduce && phase === "idle" && (
        <motion.div
          key={`bar-${current}`}
          className="htile-bar"
          style={{ background: accent }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: HOLD_MS / 1000, ease: "linear" }}
        />
      )}

      {/* Label */}
      <div className="htile-label">
        <span style={{ color: accent }}>◆</span> {img.label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv  = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ctrl  = animate(mv, value, { duration: 2.4, ease: "easeOut", delay: 0.9 });
    const unsub = mv.on("change", v => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; });
    return () => { ctrl.stop(); unsub(); };
  }, [value, suffix, mv]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   BACKGROUND PARTICLES
   ═══════════════════════════════════════════════════════════ */
function Particles({ accent }: { accent: string }) {
  const pts = [
    { x:"8%",  y:"14%", s:3,   d:3.2 }, { x:"90%", y:"10%", s:2,   d:4.1 },
    { x:"18%", y:"76%", s:4,   d:2.8 }, { x:"82%", y:"68%", s:2.5, d:5.0 },
    { x:"50%", y:"5%",  s:2,   d:3.5 }, { x:"3%",  y:"48%", s:3,   d:4.5 },
    { x:"96%", y:"54%", s:2,   d:3.8 }, { x:"66%", y:"88%", s:3,   d:2.6 },
    { x:"34%", y:"91%", s:2,   d:4.8 }, { x:"20%", y:"36%", s:1.5, d:6.0 },
  ];
  return (
    <div className="hero-particles" aria-hidden="true">
      {pts.map((p, i) => (
        <motion.div key={i} className="hero-particle"
          style={{ left:p.x, top:p.y, width:p.s, height:p.s, background:accent }}
          animate={{ y:[0,-20,0], opacity:[0.3,0.85,0.3] }}
          transition={{ duration:p.d, repeat:Infinity, ease:"easeInOut", delay:i*0.28 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */
export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Mouse tilt on mosaic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX  = useSpring(useTransform(mouseY, [-0.5,0.5], [ 5,-5]), { stiffness:90, damping:25 });
  const tiltY  = useSpring(useTransform(mouseX, [-0.5,0.5], [-7, 7]), { stiffness:90, damping:25 });

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target:sectionRef, offset:["start start","end start"] });
  const bgY      = useTransform(scrollYProgress, [0,1], ["0%","-18%"]);
  const contentY = useTransform(scrollYProgress, [0,1], ["0%","-10%"]);
  const contentOp= useTransform(scrollYProgress, [0,0.55],[1,0]);

  const onMouseMove  = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width  - 0.5);
    mouseY.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const contact   = tenant.contacts?.[0];
  const words     = tenant.name.split(" ");
  const lastName  = words.at(-1) ?? "";
  const firstName = words.slice(0,-1).join(" ");

  const rr = parseInt(accent.slice(1,3), 16);
  const gg = parseInt(accent.slice(3,5), 16);
  const bb = parseInt(accent.slice(5,7), 16);

  return (
    <section
      id="home"
      className="hero hero-v3"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Gradient mesh background — fills full section ── */}
      <motion.div className="hero-mesh" style={{ y: shouldReduce ? 0 : bgY,
        background: `
          radial-gradient(ellipse 70% 55% at 65% 42%, rgba(${rr},${gg},${bb},0.22) 0%, transparent 62%),
          radial-gradient(ellipse 50% 45% at 20% 65%, rgba(111,139,171,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 40% 60% at 90% 80%, rgba(${rr},${gg},${bb},0.10) 0%, transparent 52%),
          linear-gradient(168deg,#09090c 0%,#0d0f16 55%,#09090c 100%)
        `
      }} />
      <div className="hero-grain" />
      <div className="hero-grid" />
      <Particles accent={accent} />

      {/* ── MOSAIC — full-section backdrop, tiles scatter across entire hero ── */}
      {/*
          The mosaic stage is position:absolute inset:0 with overflow:visible.
          Tiles are absolutely positioned in the CENTER of the section,
          then animate to scatter positions that reach the edges.
      */}
      <div className="hero-mosaic-stage">
        <motion.div
          className="hero-mosaic-center"
          style={{
            rotateX:        shouldReduce ? 0 : tiltX,
            rotateY:        shouldReduce ? 0 : tiltY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Glow behind assembled mosaic */}
          <div className="hero-mosaic-glow"
            style={{ background:`radial-gradient(ellipse 80% 70% at 50% 50%, ${accent}1a, transparent 68%)` }} />
          <Mosaic accent={accent} shouldReduce={shouldReduce} />
        </motion.div>
      </div>

      {/* ── LEFT TEXT CONTENT — sits above mosaic ── */}
      <motion.div
        className="hero-text-panel"
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

        {/* Company name — no logo/icon above it */}
        <motion.h1 className="hero-title display" variants={heroChild}>
          {firstName && <span className="hero-title-first">{firstName}</span>}
          <em className="hero-title-last" style={{ color: accent }}>{lastName}</em>
        </motion.h1>

        {/* Tagline */}
        <motion.p className="hero-tagline" variants={heroChild}>
          {tenant.tagline || "Building the future of Ethiopia, one structure at a time."}
        </motion.p>

        {/* CTAs */}
        <motion.div className="hero-actions" variants={heroChild}>
          <button type="button" className="btn-primary"
            onClick={() => onScrollTo("projects")} style={{ background: accent }}>
            View Our Work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button type="button" className="btn-outline" onClick={() => onScrollTo("contact")}>
            Get a Quote
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line"
          style={{ background:`linear-gradient(to bottom,${accent},transparent)` }} />
      </div>
    </section>
  );
}
