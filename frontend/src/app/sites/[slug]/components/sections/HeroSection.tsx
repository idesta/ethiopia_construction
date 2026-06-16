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
import { Tenant, HeroScene } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";
import { BUILTIN_SCENES } from "./BuiltinScenes";

interface HeroSectionProps {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE ITEM — either a built-in SVG component or an uploaded image
   ═══════════════════════════════════════════════════════════════════ */
type SceneItem =
  | { type: "builtin"; label: string; Component: React.FC<{ a: string }> }
  | { type: "uploaded"; label: string; url: string };

function buildScenes(heroScenes: HeroScene[] | undefined): SceneItem[] {
  if (heroScenes && heroScenes.length > 0) {
    return heroScenes.map((s) => ({
      type: "uploaded" as const,
      label: s.label || `Scene ${s.sort_order + 1}`,
      url: s.url,
    }));
  }
  // Fall back to built-in SVGs
  return BUILTIN_SCENES.map((s) => ({
    type: "builtin" as const,
    label: s.label,
    Component: s.Component,
  }));
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE RENDERER — renders either an <img> or an SVG component
   ═══════════════════════════════════════════════════════════════════ */
function SceneContent({ scene, accent }: { scene: SceneItem; accent: string }) {
  if (scene.type === "builtin") {
    const Component = scene.Component;
    return <Component a={accent} />;
  }
  // Uploaded image — render as <img> inside a wrapper that matches
  // the SVG viewBox proportions
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
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

/* ═══════════════════════════════════════════════════════════════════
   SCATTER DESTINATIONS — spread wide across the entire hero
   ═══════════════════════════════════════════════════════════════════ */
const SCATTER_COUNT = 10;

const SCATTER = Array.from({ length: SCATTER_COUNT }, (_, i) => {
  const angle = (i / SCATTER_COUNT) * 2 * Math.PI - Math.PI / 2;
  const radius = 520 + i * 35;
  return {
    x:   Math.cos(angle) * radius,
    y:   Math.sin(angle) * radius * 0.55,
    rot: (i % 2 === 0 ? 1 : -1) * (28 + i * 9),
  };
});

/* ═══════════════════════════════════════════════════════════════════
   SCATTER PIECE — renders in a full-viewport absolute overlay
   so pieces can fly across the entire hero, not just the right column
   ═══════════════════════════════════════════════════════════════════ */
interface PieceProps {
  scene:    SceneItem;
  pieceIdx: number;
  accent:   string;
  phase:    "enter" | "exit";
  originX:  number;
  originY:  number;
}

function ScatterPiece({ scene, pieceIdx, accent, phase, originX, originY }: PieceProps) {
  const s = SCATTER[pieceIdx];
  const size = 80 + (pieceIdx % 4) * 18;
  const delay = pieceIdx * 0.06;

  const offsetX = (((pieceIdx * 137) % 360) / 360 - 0.5) * 320;
  const offsetY = (((pieceIdx * 97)  % 360) / 360 - 0.5) * 240;

  const assembled = {
    x: originX + offsetX - size / 2,
    y: originY + offsetY - size / 2,
    rotate: (pieceIdx % 2 === 0 ? 1 : -1) * (pieceIdx % 3) * 4,
    scale:   0.5 + (pieceIdx % 4) * 0.1,
    opacity: 0.5 + (pieceIdx % 3) * 0.15,
    filter:  "blur(0px)",
  };

  const scatteredX = originX + s.x - size / 2;
  const scatteredY = originY + s.y - size / 2;

  const content = (
    <div style={{ width: "100%", height: "100%" }}>
      <SceneContent scene={scene} accent={accent} />
    </div>
  );

  if (phase === "exit") {
    return (
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0,
          width: size, height: size,
          pointerEvents: "none", zIndex: 8,
        }}
        initial={assembled}
        animate={{ x: scatteredX, y: scatteredY,
          rotate: s.rot, scale: 0.18, opacity: 0, filter: "blur(8px)" }}
        transition={{
          duration: 0.55, delay,
          ease: [0.4, 0, 0.9, 0.05] as [number,number,number,number],
        }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0,
        width: size, height: size,
        pointerEvents: "none", zIndex: 8,
      }}
      initial={{ x: scatteredX * 1.35, y: scatteredY * 1.35,
        rotate: s.rot * 1.5, scale: 0.12, opacity: 0, filter: "blur(12px)" }}
      animate={assembled}
      transition={{
        x:       { type: "spring", stiffness: 180, damping: 20, delay },
        y:       { type: "spring", stiffness: 180, damping: 20, delay },
        rotate:  { type: "spring", stiffness: 150, damping: 12, delay },
        scale:   { type: "spring", stiffness: 260, damping: 14, delay },
        opacity: { duration: 0.4, delay },
        filter:  { duration: 0.5, delay },
      }}
    >
      <motion.div
        style={{ width: "100%", height: "100%" }}
        animate={{ y: [0, -(6 + pieceIdx % 5), 0] }}
        transition={{ duration: 2.8 + (pieceIdx % 4) * 0.5,
          repeat: Infinity, ease: "easeInOut", delay: pieceIdx * 0.2 }}
      >
        {content}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CENTRAL SCENE  — shows ONE large scene + scattered smaller ones
   ═══════════════════════════════════════════════════════════════════ */
interface SceneDisplayProps {
  scenes:  SceneItem[];
  accent:  string;
  shouldReduce: boolean | null;
}

function SceneDisplay({ scenes, accent, shouldReduce }: SceneDisplayProps) {
  const N = scenes.length;
  const [current, setCurrent] = useState(0);
  const [nextIdx, setNextIdx] = useState(1 % N);
  const [phase,   setPhase]   = useState<"enter" | "exit">("enter");
  const stageRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [N]);

  const scatterCount = Math.min(N, SCATTER_COUNT);
  const EXIT_MS  = scatterCount * 60 + 580;
  const ENTER_MS = scatterCount * 60 + 980;
  const HOLD_MS  = 3000;

  const goTo = useCallback((idx: number) => {
    setNextIdx(idx);
    setPhase("exit");
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => { setCurrent(nextIdx); setPhase("enter"); }, EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, nextIdx, EXIT_MS]);

  useEffect(() => {
    if (shouldReduce || phase !== "enter") return;
    const t = setTimeout(() => goTo((current + 1) % N), ENTER_MS + HOLD_MS);
    return () => clearTimeout(t);
  }, [shouldReduce, phase, current, goTo, ENTER_MS, N]);

  const currentScene = scenes[current];
  const pieces = Array.from({ length: scatterCount }, (_, i) => i);

  return (
    <div className="hscene-stage" ref={stageRef}>
      <div className="hscene-glow"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent}20, transparent 68%)` }} />

      {origin.x > 0 && pieces.map(i => (
        <ScatterPiece
          key={`${current}-${i}`}
          scene={scenes[(current + i) % N]}
          pieceIdx={i}
          accent={accent}
          phase={phase}
          originX={origin.x}
          originY={origin.y}
        />
      ))}

      {/* Large central scene */}
      <motion.div
        key={`main-${current}`}
        className="hscene-main"
        initial={{ scale: 0.6, opacity: 0, filter: "blur(12px)", rotate: -5 }}
        animate={phase === "exit"
          ? { scale: 0.4, opacity: 0, filter: "blur(10px)", rotate: 8 }
          : { scale: 1,   opacity: 1, filter: "blur(0px)",  rotate: 0 }
        }
        transition={phase === "exit"
          ? { duration: 0.5, ease: [0.4, 0, 0.9, 0.1] as [number,number,number,number] }
          : { type: "spring", stiffness: 180, damping: 18, delay: 0.1 }
        }
      >
        <SceneContent scene={currentScene} accent={accent} />
      </motion.div>

      {/* Dot nav */}
      <div className="hscene-dots">
        {scenes.map((sc, i) => (
          <button key={i} type="button" aria-label={`Show ${sc.label}`}
            className={`hscene-dot${i === current ? " active" : ""}`}
            style={i === current ? { background: accent, transform: "scale(1.7)" } : {}}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Label */}
      <div className="hscene-label">
        <span style={{ color: accent }}>◆</span> {scenes[current].label}
      </div>

      {/* Progress bar */}
      {!shouldReduce && phase === "enter" && (
        <motion.div key={`bar-${current}`} className="hscene-bar"
          style={{ background: accent }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: (ENTER_MS + HOLD_MS) / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2.4, ease: "easeOut", delay: 0.9 });
    const unsub = mv.on("change", v => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; });
    return () => { ctrl.stop(); unsub(); };
  }, [value, suffix, mv]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   BACKGROUND PARTICLES
   ═══════════════════════════════════════════════════════════════════ */
function Particles({ accent }: { accent: string }) {
  const pts = [
    { x:"6%",  y:"12%", s:2.5, d:3.2 }, { x:"91%", y:"9%",  s:2, d:4.1 },
    { x:"16%", y:"78%", s:3.5, d:2.8 }, { x:"84%", y:"66%", s:2, d:5.0 },
    { x:"48%", y:"4%",  s:1.5, d:3.5 }, { x:"2%",  y:"50%", s:2.5,d:4.5 },
    { x:"95%", y:"55%", s:1.5, d:3.8 }, { x:"64%", y:"90%", s:2.5,d:2.6 },
    { x:"33%", y:"93%", s:1.5, d:4.8 }, { x:"22%", y:"34%", s:1.5,d:6.0 },
  ];
  return (
    <div className="hero-particles" aria-hidden="true">
      {pts.map((p, i) => (
        <motion.div key={i} className="hero-particle"
          style={{ left:p.x, top:p.y, width:p.s, height:p.s, background:accent }}
          animate={{ y:[0,-18,0], opacity:[0.25,0.8,0.25] }}
          transition={{ duration:p.d, repeat:Infinity, ease:"easeInOut", delay:i*0.3 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════ */
export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Build scenes from uploaded data or fall back to built-in SVGs
  const scenes = buildScenes(tenant.hero_scenes);

  // Mouse tilt on right panel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX  = useSpring(useTransform(mouseY, [-0.5,0.5],[ 5,-5]), { stiffness:80, damping:22 });
  const tiltY  = useSpring(useTransform(mouseX, [-0.5,0.5],[-7, 7]), { stiffness:80, damping:22 });

  // Scroll
  const { scrollYProgress } = useScroll({ target:sectionRef, offset:["start start","end start"] });
  const contentY  = useTransform(scrollYProgress, [0,1], ["0%","-10%"]);
  const contentOp = useTransform(scrollYProgress, [0,0.55],[1,0]);
  const sceneY    = useTransform(scrollYProgress, [0,1], ["0%","-18%"]);
  const sceneOp   = useTransform(scrollYProgress, [0,0.6],[1,0]);
  const springSceneY = useSpring(sceneY, { stiffness:50, damping:18 });

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

  const rr = parseInt(accent.slice(1,3),16);
  const gg = parseInt(accent.slice(3,5),16);
  const bb = parseInt(accent.slice(5,7),16);

  return (
    <section id="home" className="hero hero-v3"
      ref={sectionRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>

      {/* Background */}
      <div className="hero-mesh" style={{
        background:`
          radial-gradient(ellipse 75% 60% at 68% 40%,rgba(${rr},${gg},${bb},0.20) 0%,transparent 62%),
          radial-gradient(ellipse 50% 45% at 18% 65%,rgba(111,139,171,0.12) 0%,transparent 55%),
          radial-gradient(ellipse 40% 55% at 92% 82%,rgba(${rr},${gg},${bb},0.10) 0%,transparent 52%),
          linear-gradient(168deg,#09090c 0%,#0c0e15 55%,#09090c 100%)
        `
      }}/>
      <div className="hero-grain"/>
      <div className="hero-grid"/>
      <Particles accent={accent}/>

      {/* ── SPLIT LAYOUT ── */}
      <div className="hero-split">

        {/* LEFT — text */}
        <motion.div className="hero-left"
          variants={heroStagger} initial="hidden" animate="visible"
          style={{ y:shouldReduce?0:contentY, opacity:shouldReduce?1:contentOp }}>

          <motion.div className="hero-badge" variants={heroChild}>
            <span className="hero-badge-dot" style={{ background:accent }}/>
            <span style={{ color:accent }}>{contact?.city||"Addis Ababa"} · Ethiopia</span>
            {tenant.founded_year && <span className="hero-badge-year">Est. {tenant.founded_year}</span>}
          </motion.div>

          <motion.h1 className="hero-title display" variants={heroChild}>
            {firstName && <span className="hero-title-first">{firstName}</span>}
            <em className="hero-title-last" style={{ color:accent }}>{lastName}</em>
          </motion.h1>

          <motion.p className="hero-tagline" variants={heroChild}>
            {tenant.tagline||"Building the future of Ethiopia, one structure at a time."}
          </motion.p>

          <motion.div className="hero-actions" variants={heroChild}>
            <button type="button" className="btn-primary"
              onClick={()=>onScrollTo("projects")} style={{ background:accent }}>
              View Our Work
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" className="btn-outline" onClick={()=>onScrollTo("contact")}>
              Get a Quote
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT — 3D scene */}
        <motion.div className="hero-right"
          style={{ y:shouldReduce?0:springSceneY, opacity:shouldReduce?1:sceneOp }}>
          <motion.div className="hero-right-tilt"
            style={{
              rotateX:        shouldReduce?0:tiltX,
              rotateY:        shouldReduce?0:tiltY,
              transformStyle: "preserve-3d",
            }}>
            <SceneDisplay scenes={scenes} accent={accent} shouldReduce={shouldReduce}/>
          </motion.div>
        </motion.div>

      </div>

      {/* Scroll cue */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line" style={{ background:`linear-gradient(to bottom,${accent},transparent)` }}/>
      </div>
    </section>
  );
}
