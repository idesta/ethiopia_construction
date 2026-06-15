"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  animate,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Tenant } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";

interface HeroSectionProps {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}

/* ─── Animated counter ─────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ctrl = animate(motionVal, value, { duration: 2.4, ease: "easeOut", delay: 0.9 });
    const unsub = motionVal.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return () => { ctrl.stop(); unsub(); };
  }, [value, suffix, motionVal]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Isometric Building cluster (the hero 3D object) ──── */
function IsometricScene({ accent }: { accent: string }) {
  const a = accent;
  const dark1 = "#0d0e11";
  const dark2 = "#14161b";
  const dark3 = "#1c1f27";
  const mid = "#242830";

  return (
    <svg viewBox="0 0 520 560" fill="none" aria-hidden="true" className="hero-iso-svg">
      {/* ── Drop shadow blur ── */}
      <defs>
        <filter id="iso-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor={a} floodOpacity="0.22" />
        </filter>
        <filter id="iso-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={a} floodOpacity="0.5" />
        </filter>
        <radialGradient id="scene-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={a} stopOpacity="0.15" />
          <stop offset="100%" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Glow backdrop */}
      <ellipse cx="260" cy="400" rx="200" ry="80" fill="url(#scene-glow)" />

      {/* ── Far-back tower (left) ── */}
      <g opacity="0.5" filter="url(#iso-shadow)">
        <polygon points="110,120 60,150 60,340 110,310" fill={dark2} stroke={a} strokeWidth="0.6" />
        <polygon points="110,120 160,150 160,340 110,310" fill={dark1} stroke={a} strokeWidth="0.6" />
        <polygon points="110,120 160,150 110,180 60,150" fill={mid} stroke={a} strokeWidth="0.6" />
        {[170,200,230,260,290].map(y=>(
          <g key={y}>
            <rect x="68" y={y} width="12" height="9" rx="1" fill={a} opacity="0.3" />
            <rect x="85" y={y} width="12" height="9" rx="1" fill={a} opacity="0.2" />
          </g>
        ))}
      </g>

      {/* ── Far-back tower (right) ── */}
      <g opacity="0.45" filter="url(#iso-shadow)">
        <polygon points="400,100 350,130 350,300 400,270" fill={dark2} stroke={a} strokeWidth="0.6" />
        <polygon points="400,100 450,130 450,300 400,270" fill={dark1} stroke={a} strokeWidth="0.6" />
        <polygon points="400,100 450,130 400,160 350,130" fill={mid} stroke={a} strokeWidth="0.6" />
        {[160,190,220,250].map(y=>(
          <g key={y}>
            <rect x="358" y={y} width="10" height="8" rx="1" fill={a} opacity="0.25" />
            <rect x="374" y={y} width="10" height="8" rx="1" fill={a} opacity="0.15" />
          </g>
        ))}
      </g>

      {/* ── Main center tower (tall) ── */}
      <g filter="url(#iso-shadow)">
        {/* Left face */}
        <polygon points="260,40 160,100 160,360 260,300" fill={dark3} stroke={a} strokeWidth="0.9" />
        {/* Right face */}
        <polygon points="260,40 360,100 360,360 260,300" fill={dark2} stroke={a} strokeWidth="0.9" />
        {/* Top face */}
        <polygon points="260,40 360,100 260,160 160,100" fill={mid} stroke={a} strokeWidth="0.9" />
        {/* Glass sheen on top */}
        <polygon points="260,40 360,100 260,160 160,100" fill="url(#glass-sheen)" />

        {/* Window grid — left face */}
        {[175,200,225,250,275,300,325].map(y=>(
          <g key={y}>
            <rect x="172" y={y} width="14" height="11" rx="1" fill={a} opacity="0.45" />
            <rect x="192" y={y} width="14" height="11" rx="1" fill={a} opacity="0.3" />
            <rect x="212" y={y} width="14" height="11" rx="1" fill={a} opacity="0.2" />
            <rect x="232" y={y} width="14" height="11" rx="1" fill={a} opacity="0.15" />
          </g>
        ))}
        {/* Window grid — right face */}
        {[175,200,225,250,275,300,325].map(y=>(
          <g key={y}>
            <rect x="272" y={y} width="14" height="11" rx="1" fill={a} opacity="0.25" />
            <rect x="292" y={y} width="14" height="11" rx="1" fill={a} opacity="0.18" />
            <rect x="312" y={y} width="14" height="11" rx="1" fill={a} opacity="0.12" />
            <rect x="332" y={y} width="14" height="11" rx="1" fill={a} opacity="0.08" />
          </g>
        ))}

        {/* Vertical accent spine */}
        <line x1="260" y1="40" x2="260" y2="300" stroke={a} strokeWidth="1.5" opacity="0.7" filter="url(#iso-glow)" />

        {/* Antenna */}
        <line x1="260" y1="40" x2="260" y2="8" stroke={a} strokeWidth="1.2" opacity="0.9" />
        <circle cx="260" cy="8" r="3.5" fill={a} opacity="0.9" filter="url(#iso-glow)" />
      </g>

      {/* ── Right side lower building ── */}
      <g opacity="0.75" filter="url(#iso-shadow)">
        <polygon points="370,240 310,275 310,420 370,385" fill={dark3} stroke={a} strokeWidth="0.8" />
        <polygon points="370,240 430,275 430,420 370,385" fill={dark2} stroke={a} strokeWidth="0.8" />
        <polygon points="370,240 430,275 370,310 310,275" fill={mid} stroke={a} strokeWidth="0.8" />
        {[300,325,350,370].map(y=>(
          <g key={y}>
            <rect x="318" y={y} width="10" height="8" rx="1" fill={a} opacity="0.35" />
            <rect x="334" y={y} width="10" height="8" rx="1" fill={a} opacity="0.2" />
          </g>
        ))}
      </g>

      {/* ── Left side lower building ── */}
      <g opacity="0.7" filter="url(#iso-shadow)">
        <polygon points="150,250 90,285 90,420 150,385" fill={dark3} stroke={a} strokeWidth="0.8" />
        <polygon points="150,250 210,285 210,420 150,385" fill={dark2} stroke={a} strokeWidth="0.8" />
        <polygon points="150,250 210,285 150,320 90,285" fill={mid} stroke={a} strokeWidth="0.8" />
        {[310,335,360,385].map(y=>(
          <g key={y}>
            <rect x="98" y={y} width="10" height="8" rx="1" fill={a} opacity="0.3" />
            <rect x="114" y={y} width="10" height="8" rx="1" fill={a} opacity="0.18" />
          </g>
        ))}
      </g>

      {/* ── Ground / platform ── */}
      <polygon points="260,420 80,510 260,560 440,510" fill={dark1} stroke={a} strokeWidth="0.5" opacity="0.6" />
      <polygon points="260,420 440,510 440,520 260,430" fill="#0a0b0d" stroke={a} strokeWidth="0.4" opacity="0.4" />
      <polygon points="260,420 80,510 80,520 260,430" fill="#0d0e0f" stroke={a} strokeWidth="0.4" opacity="0.4" />

      {/* Ground grid lines */}
      {[-3,-2,-1,0,1,2,3].map(i=>(
        <line key={i}
          x1={260 + i*50} y1={420 + Math.abs(i)*12}
          x2={260} y2={560}
          stroke={a} strokeWidth="0.4" opacity="0.15"
        />
      ))}

      {/* ── Tower crane ── */}
      <g opacity="0.85">
        {/* Mast */}
        <rect x="354" y="100" width="8" height="145" fill={dark3} stroke={a} strokeWidth="0.7" />
        {/* Lattice */}
        {[110,128,146,164,182,200,218].map(y=>(
          <g key={y}>
            <line x1="354" y1={y} x2="362" y2={y+9} stroke={a} strokeWidth="0.4" opacity="0.5" />
            <line x1="362" y1={y} x2="354" y2={y+9} stroke={a} strokeWidth="0.4" opacity="0.5" />
          </g>
        ))}
        {/* Jib */}
        <rect x="310" y="96" width="85" height="6" rx="2" fill={a} opacity="0.8" />
        {/* Counter-jib */}
        <rect x="310" y="96" width="32" height="5" rx="1" fill={a} opacity="0.5" />
        {/* Counterweight */}
        <rect x="312" y="101" width="20" height="12" rx="2" fill={dark3} stroke={a} strokeWidth="0.7" />
        {/* Hook cable */}
        <line x1="375" y1="102" x2="375" y2="128" stroke={a} strokeWidth="0.9" opacity="0.7" />
        {/* Hook */}
        <path d="M372 128 Q375 136 378 128" stroke={a} strokeWidth="1.2" fill="none" />
        {/* Cap */}
        <polygon points="358,90 368,100 348,100" fill={a} opacity="0.9" />
      </g>

      {/* ── Excavator (bottom left area) ── */}
      <g opacity="0.8" transform="translate(60,390) scale(0.7)">
        <rect x="5" y="55" width="90" height="18" rx="9" fill={dark3} stroke={a} strokeWidth="0.9" />
        <circle cx="14" cy="64" r="7" fill={mid} stroke={a} strokeWidth="0.8" />
        <circle cx="34" cy="64" r="7" fill={mid} stroke={a} strokeWidth="0.8" />
        <circle cx="54" cy="64" r="7" fill={mid} stroke={a} strokeWidth="0.8" />
        <circle cx="74" cy="64" r="7" fill={mid} stroke={a} strokeWidth="0.8" />
        <rect x="10" y="30" width="72" height="28" rx="3" fill={dark2} stroke={a} strokeWidth="0.8" />
        <rect x="18" y="18" width="38" height="16" rx="2" fill={dark3} stroke={a} strokeWidth="0.7" />
        <rect x="22" y="20" width="18" height="10" rx="1" fill={a} opacity="0.18" />
        <rect x="82" y="28" width="50" height="7" rx="2" fill={a} opacity="0.7" transform="rotate(-18 82 28)" />
        <rect x="118" y="16" width="34" height="5" rx="2" fill={a} opacity="0.55" transform="rotate(12 118 16)" />
        <path d="M142 28 L158 22 L162 32 L146 40 Z" fill={dark3} stroke={a} strokeWidth="0.8" />
        <line x1="146" y1="39" x2="144" y2="45" stroke={a} strokeWidth="1" />
        <line x1="152" y1="37" x2="152" y2="43" stroke={a} strokeWidth="1" />
        <line x1="158" y1="34" x2="158" y2="40" stroke={a} strokeWidth="1" />
      </g>

      {/* ── Floating accent diamonds ── */}
      <g filter="url(#iso-glow)">
        <rect x="80" y="60" width="14" height="14" rx="1.5" transform="rotate(45 87 67)" stroke={a} strokeWidth="1" fill="none" opacity="0.7" />
        <rect x="430" y="200" width="10" height="10" rx="1" transform="rotate(45 435 205)" stroke={a} strokeWidth="1" fill={a} fillOpacity="0.2" opacity="0.8" />
        <rect x="150" y="440" width="8" height="8" rx="1" transform="rotate(45 154 444)" stroke={a} strokeWidth="0.8" fill="none" opacity="0.55" />
        <rect x="390" y="440" width="12" height="12" rx="1" transform="rotate(45 396 446)" stroke={a} strokeWidth="1" fill={a} fillOpacity="0.15" opacity="0.7" />
      </g>

      {/* ── Floating hard hat ── */}
      <g opacity="0.9" transform="translate(62,200)">
        <path d="M4 34 Q4 12 36 8 Q68 12 68 34 Z" fill={a} opacity="0.8" />
        <rect x="0" y="32" width="72" height="8" rx="4" fill={a} opacity="0.55" />
        <rect x="31" y="8" width="10" height="14" rx="2" fill="rgba(255,255,255,0.12)" />
        <path d="M14 20 Q36 14 58 20" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" />
      </g>

      {/* ── Blueprint scroll ── */}
      <g opacity="0.75" transform="translate(400,300) rotate(-15)">
        <rect x="0" y="0" width="70" height="48" rx="2" fill={dark2} stroke={a} strokeWidth="0.7" />
        {[12,22,32,42,52].map(x=>(
          <line key={x} x1={x} y1="0" x2={x} y2="48" stroke={a} strokeWidth="0.3" opacity="0.3" />
        ))}
        {[12,24,36].map(y=>(
          <line key={y} x1="0" y1={y} x2="70" y2={y} stroke={a} strokeWidth="0.3" opacity="0.3" />
        ))}
        <rect x="6" y="6" width="22" height="16" stroke={a} strokeWidth="0.8" fill="none" opacity="0.6" />
        <rect x="34" y="6" width="28" height="10" stroke={a} strokeWidth="0.8" fill="none" opacity="0.6" />
        <ellipse cx="0" cy="24" rx="3" ry="22" fill={dark3} stroke={a} strokeWidth="0.6" />
        <ellipse cx="70" cy="24" rx="3" ry="22" fill={dark3} stroke={a} strokeWidth="0.6" />
      </g>
    </svg>
  );
}

/* ─── Orbit ring with icons ────────────────────────────── */
function OrbitRing({ accent, shouldReduce }: { accent: string; shouldReduce: boolean | null }) {
  const icons = [
    // Hard hat
    { angle: 0, label: "Safety",
      icon: <path d="M4 18 Q4 6 20 4 Q36 6 36 18 Z" fill={accent} opacity="0.9" /> },
    // Crane hook
    { angle: 90, label: "Lifting",
      icon: <path d="M18 4 L18 18 Q18 28 28 28 Q38 28 38 18 L36 18 Q36 26 28 26 Q20 26 20 18 L20 4 Z" stroke={accent} strokeWidth="2" fill="none" /> },
    // Ruler
    { angle: 180, label: "Precision",
      icon: <><rect x="2" y="14" width="36" height="12" rx="2" stroke={accent} strokeWidth="1.5" fill="none" />{[8,14,20,26,32].map(x=><line key={x} x1={x} y1="14" x2={x} y2={x===14||x===26?20:17} stroke={accent} strokeWidth="1.2" />)}</> },
    // Bolt/gear
    { angle: 270, label: "Build",
      icon: <><circle cx="20" cy="20" r="8" stroke={accent} strokeWidth="1.5" fill="none" /><circle cx="20" cy="20" r="3" fill={accent} opacity="0.7" />{[0,45,90,135,180,225,270,315].map(a=><rect key={a} x="19" y="10" width="2" height="4" rx="1" fill={accent} transform={`rotate(${a} 20 20)`} />)}</> },
  ];

  return (
    <div className="hero-orbit" aria-hidden="true">
      <motion.div
        className="hero-orbit-ring"
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ borderColor: `${accent}30` }}
      >
        {icons.map(({ angle, label, icon }) => (
          <div
            key={label}
            className="hero-orbit-item"
            style={{
              transform: `rotate(${angle}deg) translateX(140px) rotate(-${angle}deg)`,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label={label}>
              {icon}
            </svg>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Floating particles ───────────────────────────────── */
function Particles({ accent }: { accent: string }) {
  const pts = [
    { x: "12%", y: "18%", s: 3, d: 3.2 }, { x: "88%", y: "12%", s: 2, d: 4.1 },
    { x: "22%", y: "72%", s: 4, d: 2.8 }, { x: "78%", y: "68%", s: 2.5, d: 5 },
    { x: "50%", y: "8%",  s: 2, d: 3.5 }, { x: "5%",  y: "45%", s: 3, d: 4.5 },
    { x: "94%", y: "50%", s: 2, d: 3.8 }, { x: "65%", y: "88%", s: 3, d: 2.6 },
    { x: "35%", y: "90%", s: 2, d: 4.8 }, { x: "18%", y: "38%", s: 1.5, d: 6 },
  ];
  return (
    <div className="hero-particles" aria-hidden="true">
      {pts.map((p, i) => (
        <motion.div
          key={i}
          className="hero-particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            background: accent,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}

/* ─── Main HeroSection ─────────────────────────────────── */
export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Mouse tracking for interactive tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 30 });

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const sceneY      = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const sceneScale  = useTransform(scrollYProgress, [0, 0.7], [1, 0.88]);
  const sceneOpacity= useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentY    = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOp   = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const springY     = useSpring(sceneY,  { stiffness: 60, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const contact    = tenant.contacts?.[0];
  const words      = tenant.name.split(" ");
  const lastName   = words.slice(-1)[0];
  const firstName  = words.slice(0, -1).join(" ");
  const yearsActive = tenant.founded_year ? new Date().getFullYear() - tenant.founded_year : null;

  // Gradient mesh from accent color
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);

  return (
    <section
      id="home"
      className="hero hero-split"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Gradient mesh background ── */}
      <div className="hero-mesh" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 70% 40%, rgba(${r},${g},${b},0.18) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 20% 60%, rgba(111,139,171,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 50% 70% at 85% 80%, rgba(${r},${g},${b},0.08) 0%, transparent 55%),
          linear-gradient(165deg, #0d0e11 0%, #10121a 50%, #0d0e11 100%)
        `
      }} />

      {/* Subtle noise grain */}
      <div className="hero-grain" />

      {/* Blueprint grid overlay */}
      <div className="hero-grid" />

      {/* Particles */}
      <Particles accent={accent} />

      {/* ── Split layout ── */}
      <div className="hero-split-inner">

        {/* LEFT: Text content */}
        <motion.div
          className="hero-content hero-content--left"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          style={{
            y: shouldReduce ? 0 : contentY,
            opacity: shouldReduce ? 1 : contentOp,
          }}
        >
          {/* Badge */}
          <motion.div className="hero-badge" variants={heroChild}>
            <span className="hero-badge-dot" style={{ background: accent }} />
            <span style={{ color: accent }}>
              {contact?.city || "Addis Ababa"} · Ethiopia
            </span>
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

          {/* Heading */}
          <motion.h1 className="hero-title display" variants={heroChild}>
            {firstName && (
              <span className="hero-title-first">{firstName}</span>
            )}
            <em className="hero-title-last" style={{ color: accent }}>{lastName}</em>
          </motion.h1>

          {/* Tagline */}
          <motion.p className="hero-tagline" variants={heroChild}>
            {tenant.tagline || "Building the future of Ethiopia, one structure at a time."}
          </motion.p>

          {/* Stats row */}
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
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => onScrollTo("contact")}
            >
              Get a Quote
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT: 3D scene */}
        <motion.div
          className="hero-scene-wrap"
          style={{
            y:       shouldReduce ? 0 : springY,
            scale:   shouldReduce ? 1 : sceneScale,
            opacity: shouldReduce ? 1 : sceneOpacity,
          }}
        >
          {/* Orbit ring */}
          <OrbitRing accent={accent} shouldReduce={shouldReduce} />

          {/* Depth rings */}
          <div className="hero-depth-ring hero-depth-ring--1" style={{ borderColor: `${accent}18` }} />
          <div className="hero-depth-ring hero-depth-ring--2" style={{ borderColor: `${accent}10` }} />
          <div className="hero-depth-ring hero-depth-ring--3" style={{ borderColor: `${accent}08` }} />

          {/* 3D tilt container */}
          <motion.div
            className="hero-iso-wrap"
            style={{
              rotateX: shouldReduce ? 0 : rotateX,
              rotateY: shouldReduce ? 0 : rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Glow halo */}
            <div
              className="hero-iso-glow"
              style={{
                background: `radial-gradient(ellipse 70% 55% at 50% 55%, ${accent}28, transparent 70%)`
              }}
            />

            {/* The isometric scene */}
            <motion.div
              animate={shouldReduce ? {} : {
                y:      [0, -14, 0],
                rotate: [0, 0.8, -0.5, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.75, 1] }}
            >
              <IsometricScene accent={accent} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }} />
      </div>
    </section>
  );
}
