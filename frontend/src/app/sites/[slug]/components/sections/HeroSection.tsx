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
import { useRef, useEffect } from "react";
import { Tenant } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";
import { HeritageMotif } from "../ui/EthiopianGeometric";

interface HeroSectionProps {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}

/* ─── 3-D Isometric Building SVG ──────────────────────── */
function IsoBuilding({
  accent,
  size = 120,
}: {
  accent: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      aria-hidden="true"
    >
      {/* Left face */}
      <polygon
        points="50,10 10,34 10,95 50,71"
        fill="#1c1f27"
        stroke={accent}
        strokeWidth="0.8"
        opacity="0.9"
      />
      {/* Right face */}
      <polygon
        points="50,10 90,34 90,95 50,71"
        fill="#14161b"
        stroke={accent}
        strokeWidth="0.8"
        opacity="0.9"
      />
      {/* Top face */}
      <polygon
        points="50,10 90,34 50,58 10,34"
        fill="#242830"
        stroke={accent}
        strokeWidth="0.8"
      />
      {/* Windows left */}
      {[42, 55, 68].map((y) => (
        <rect
          key={y}
          x="18"
          y={y}
          width="8"
          height="6"
          fill={accent}
          opacity="0.35"
          rx="0.5"
        />
      ))}
      {[42, 55, 68].map((y) => (
        <rect
          key={y + 100}
          x="30"
          y={y}
          width="8"
          height="6"
          fill={accent}
          opacity="0.2"
          rx="0.5"
        />
      ))}
      {/* Windows right */}
      {[42, 55, 68].map((y) => (
        <rect
          key={y + 200}
          x="58"
          y={y}
          width="8"
          height="6"
          fill={accent}
          opacity="0.25"
          rx="0.5"
        />
      ))}
      {[42, 55, 68].map((y) => (
        <rect
          key={y + 300}
          x="72"
          y={y}
          width="8"
          height="6"
          fill={accent}
          opacity="0.15"
          rx="0.5"
        />
      ))}
      {/* Accent edge */}
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="71"
        stroke={accent}
        strokeWidth="1.2"
        opacity="0.6"
      />
    </svg>
  );
}

/* ─── Tower Crane SVG ──────────────────────────────────── */
function TowerCrane({ accent, size = 100 }: { accent: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 80 120"
      fill="none"
      aria-hidden="true"
    >
      {/* Mast */}
      <rect x="37" y="30" width="6" height="80" fill="#1c1f27" stroke={accent} strokeWidth="0.8" />
      {/* Cross lattice on mast */}
      <line x1="37" y1="40" x2="43" y2="50" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <line x1="43" y1="40" x2="37" y2="50" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <line x1="37" y1="55" x2="43" y2="65" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <line x1="43" y1="55" x2="37" y2="65" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <line x1="37" y1="70" x2="43" y2="80" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      <line x1="43" y1="70" x2="37" y2="80" stroke={accent} strokeWidth="0.5" opacity="0.5" />
      {/* Jib (long arm) */}
      <rect x="10" y="26" width="60" height="5" fill={accent} opacity="0.8" rx="1" />
      {/* Counter jib */}
      <rect x="10" y="26" width="22" height="4" fill={accent} opacity="0.5" rx="1" />
      {/* Trolley */}
      <rect x="52" y="31" width="8" height="5" fill="#242830" stroke={accent} strokeWidth="0.7" />
      {/* Hook cable */}
      <line x1="56" y1="36" x2="56" y2="50" stroke={accent} strokeWidth="0.8" opacity="0.7" />
      {/* Hook */}
      <path d="M53 50 Q56 56 59 50" stroke={accent} strokeWidth="1" fill="none" />
      {/* Counterweight */}
      <rect x="12" y="30" width="12" height="8" fill="#1c1f27" stroke={accent} strokeWidth="0.7" rx="1" />
      {/* Base */}
      <rect x="32" y="108" width="16" height="6" fill={accent} opacity="0.6" rx="1" />
      {/* Cap */}
      <polygon points="40,18 48,30 32,30" fill={accent} opacity="0.9" />
    </svg>
  );
}

/* ─── Excavator / Digger SVG ───────────────────────────── */
function Excavator({ accent, size = 100 }: { accent: string; size?: number }) {
  return (
    <svg
      width={size * 1.4}
      height={size}
      viewBox="0 0 140 100"
      fill="none"
      aria-hidden="true"
    >
      {/* Tracks */}
      <rect x="5" y="72" width="80" height="16" rx="8" fill="#1c1f27" stroke={accent} strokeWidth="0.8" />
      <circle cx="15" cy="80" r="7" fill="#242830" stroke={accent} strokeWidth="0.8" />
      <circle cx="35" cy="80" r="7" fill="#242830" stroke={accent} strokeWidth="0.8" />
      <circle cx="55" cy="80" r="7" fill="#242830" stroke={accent} strokeWidth="0.8" />
      <circle cx="75" cy="80" r="7" fill="#242830" stroke={accent} strokeWidth="0.8" />
      {/* Body */}
      <rect x="10" y="45" width="70" height="30" rx="3" fill="#14161b" stroke={accent} strokeWidth="0.8" />
      {/* Cab */}
      <rect x="20" y="30" width="40" height="20" rx="3" fill="#1c1f27" stroke={accent} strokeWidth="0.8" />
      {/* Cab window */}
      <rect x="26" y="34" width="20" height="12" rx="2" fill={accent} opacity="0.2" />
      {/* Boom arm */}
      <rect
        x="70"
        y="35"
        width="45"
        height="8"
        rx="3"
        fill={accent}
        opacity="0.75"
        transform="rotate(-20 70 35)"
      />
      {/* Stick */}
      <rect
        x="98"
        y="22"
        width="32"
        height="6"
        rx="2"
        fill={accent}
        opacity="0.6"
        transform="rotate(15 98 22)"
      />
      {/* Bucket */}
      <path
        d="M120 38 L134 32 L138 42 L122 50 Z"
        fill="#1c1f27"
        stroke={accent}
        strokeWidth="0.8"
      />
      {/* Bucket teeth */}
      <line x1="124" y1="49" x2="122" y2="55" stroke={accent} strokeWidth="1" />
      <line x1="130" y1="47" x2="130" y2="53" stroke={accent} strokeWidth="1" />
      <line x1="136" y1="44" x2="136" y2="50" stroke={accent} strokeWidth="1" />
      {/* Accent stripe */}
      <rect x="10" y="58" width="70" height="3" fill={accent} opacity="0.4" />
    </svg>
  );
}

/* ─── Hard Hat SVG ─────────────────────────────────────── */
function HardHat({ accent, size = 60 }: { accent: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 80 60"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 42 Q8 18 40 14 Q72 18 72 42 Z"
        fill={accent}
        opacity="0.85"
      />
      <rect x="4" y="40" width="72" height="8" rx="4" fill={accent} opacity="0.6" />
      <rect x="35" y="14" width="10" height="16" rx="2" fill="rgba(255,255,255,0.15)" />
      {/* Stripe */}
      <path
        d="M20 24 Q40 18 60 24"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}

/* ─── Blueprint Roll SVG ───────────────────────────────── */
function Blueprint({ accent, size = 70 }: { accent: string; size?: number }) {
  return (
    <svg
      width={size * 1.3}
      height={size}
      viewBox="0 0 90 70"
      fill="none"
      aria-hidden="true"
    >
      {/* Roll body */}
      <rect x="10" y="10" width="70" height="50" rx="3" fill="#14161b" stroke={accent} strokeWidth="0.8" />
      {/* Blueprint grid lines */}
      {[20, 30, 40, 50, 60].map((x) => (
        <line key={x} x1={x} y1="10" x2={x} y2="60" stroke={accent} strokeWidth="0.4" opacity="0.3" />
      ))}
      {[20, 30, 40, 50].map((y) => (
        <line key={y} x1="10" y1={y} x2="80" y2={y} stroke={accent} strokeWidth="0.4" opacity="0.3" />
      ))}
      {/* Floor plan lines */}
      <rect x="18" y="18" width="24" height="18" stroke={accent} strokeWidth="1" fill="none" opacity="0.7" />
      <rect x="48" y="18" width="22" height="12" stroke={accent} strokeWidth="1" fill="none" opacity="0.7" />
      <line x1="18" y1="36" x2="70" y2="36" stroke={accent} strokeWidth="0.8" opacity="0.5" />
      <rect x="18" y="42" width="52" height="10" stroke={accent} strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Roll ends */}
      <ellipse cx="10" cy="35" rx="4" ry="25" fill="#1c1f27" stroke={accent} strokeWidth="0.8" />
      <ellipse cx="80" cy="35" rx="4" ry="25" fill="#1c1f27" stroke={accent} strokeWidth="0.8" />
    </svg>
  );
}

/* ─── Tall skyscraper ──────────────────────────────────── */
function Skyscraper({ accent, size = 90 }: { accent: string; size?: number }) {
  return (
    <svg
      width={size * 0.6}
      height={size}
      viewBox="0 0 60 100"
      fill="none"
      aria-hidden="true"
    >
      {/* Main tower */}
      <rect x="15" y="10" width="30" height="85" fill="#14161b" stroke={accent} strokeWidth="0.8" />
      {/* Spire */}
      <polygon points="30,2 35,12 25,12" fill={accent} opacity="0.9" />
      {/* Window grid */}
      {[18, 28, 38, 48, 58, 68, 78].map((y) =>
        [19, 27, 35].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="5"
            height="6"
            fill={accent}
            opacity={Math.random() > 0.4 ? 0.5 : 0.1}
            rx="0.3"
          />
        ))
      )}
      {/* Setbacks */}
      <rect x="10" y="65" width="40" height="5" fill="#1c1f27" stroke={accent} strokeWidth="0.5" />
      <rect x="5" y="80" width="50" height="5" fill="#1c1f27" stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/* ─── Floating 3D element wrapper ──────────────────────── */
interface FloatProps {
  children: React.ReactNode;
  delay?: number;
  amplitude?: number;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}

function FloatingElement({
  children,
  delay = 0,
  amplitude = 12,
  duration = 4,
  style,
  className,
}: FloatProps) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      style={style}
      className={className}
      animate={
        shouldReduce
          ? {}
          : {
              y: [0, -amplitude, 0],
              rotate: [0, 1.5, -1, 0],
            }
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
        times: [0, 0.45, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctrl = animate(motionVal, value, {
      duration: 2.2,
      ease: "easeOut",
      delay: 0.8,
    });
    const unsub = motionVal.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value, suffix, motionVal]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Main HeroSection ─────────────────────────────────── */
export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax layers — different depths
  const yLayer1 = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const yLayer2 = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const yLayer3 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const yLayer4 = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Spring-smooth the parallax
  const sLayer1 = useSpring(yLayer1, { stiffness: 80, damping: 20 });
  const sLayer2 = useSpring(yLayer2, { stiffness: 60, damping: 18 });
  const sLayer3 = useSpring(yLayer3, { stiffness: 50, damping: 16 });
  const sLayer4 = useSpring(yLayer4, { stiffness: 40, damping: 14 });

  const contact = tenant.contacts?.[0];
  const words = tenant.name.split(" ");
  const lastName = words.slice(-1)[0];
  const firstName = words.slice(0, -1).join(" ");
  const yearsActive = tenant.founded_year
    ? new Date().getFullYear() - tenant.founded_year
    : null;

  const parallaxY1 = shouldReduce ? undefined : sLayer1;
  const parallaxY2 = shouldReduce ? undefined : sLayer2;
  const parallaxY3 = shouldReduce ? undefined : sLayer3;
  const parallaxY4 = shouldReduce ? undefined : sLayer4;

  return (
    <section id="home" className="hero hero-3d" ref={sectionRef}>
      {/* ── Dark cinematic base ── */}
      <div className="hero-bg" />
      <div className="hero-grid" />

      {/* ── Depth accent lines ── */}
      <div
        className="hero-accent-line"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}44, transparent)`,
        }}
      />
      <div
        className="hero-accent-line hero-accent-line--right"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}22, transparent)`,
        }}
      />

      {/* ── Ground plane grid (perspective) ── */}
      <div className="hero-ground-plane" />

      {/* ── Deepest layer: distant skyscrapers ── */}
      <motion.div
        className="hero-3d-layer hero-3d-layer--bg"
        style={{ y: parallaxY4 }}
      >
        <FloatingElement delay={0} amplitude={6} duration={6} className="h3d-iso h3d-iso--far-left">
          <Skyscraper accent={accent} size={70} />
        </FloatingElement>
        <FloatingElement delay={1.5} amplitude={5} duration={7} className="h3d-iso h3d-iso--far-right">
          <Skyscraper accent={accent} size={55} />
        </FloatingElement>
        <FloatingElement delay={0.8} amplitude={4} duration={8} className="h3d-iso h3d-iso--far-center">
          <IsoBuilding accent={accent} size={60} />
        </FloatingElement>
      </motion.div>

      {/* ── Mid-back layer: mid-rise buildings ── */}
      <motion.div
        className="hero-3d-layer hero-3d-layer--mid"
        style={{ y: parallaxY3 }}
      >
        <FloatingElement delay={0.3} amplitude={10} duration={5} className="h3d-iso h3d-iso--mid-left">
          <IsoBuilding accent={accent} size={95} />
        </FloatingElement>
        <FloatingElement delay={1.2} amplitude={8} duration={5.5} className="h3d-iso h3d-iso--mid-right">
          <IsoBuilding accent={accent} size={80} />
        </FloatingElement>
        <FloatingElement delay={2} amplitude={7} duration={6} className="h3d-iso h3d-iso--mid-center">
          <Skyscraper accent={accent} size={85} />
        </FloatingElement>
      </motion.div>

      {/* ── Mid-front layer: machinery + tools ── */}
      <motion.div
        className="hero-3d-layer hero-3d-layer--front"
        style={{ y: parallaxY2 }}
      >
        <FloatingElement delay={0.6} amplitude={14} duration={4.5} className="h3d-iso h3d-iso--crane">
          <TowerCrane accent={accent} size={90} />
        </FloatingElement>
        <FloatingElement delay={1.8} amplitude={10} duration={5} className="h3d-iso h3d-iso--excavator">
          <Excavator accent={accent} size={80} />
        </FloatingElement>
        <FloatingElement delay={0.2} amplitude={12} duration={4.8} className="h3d-iso h3d-iso--blueprint">
          <Blueprint accent={accent} size={65} />
        </FloatingElement>
      </motion.div>

      {/* ── Nearest layer: hard hat ── */}
      <motion.div
        className="hero-3d-layer hero-3d-layer--near"
        style={{ y: parallaxY1 }}
      >
        <FloatingElement delay={1} amplitude={16} duration={3.8} className="h3d-iso h3d-iso--hardhat">
          <HardHat accent={accent} size={65} />
        </FloatingElement>
        {/* Floating accent diamonds */}
        <motion.div
          className="h3d-iso h3d-iso--diamond1"
          animate={shouldReduce ? {} : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="14" y="1" width="18" height="18" rx="2" transform="rotate(45 14 1)" stroke={accent} strokeWidth="1.2" opacity="0.7" />
          </svg>
        </motion.div>
        <motion.div
          className="h3d-iso h3d-iso--diamond2"
          animate={shouldReduce ? {} : { rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="8" y="0.5" width="10" height="10" rx="1" transform="rotate(45 8 0.5)" stroke={accent} strokeWidth="1" fill={accent} fillOpacity="0.12" />
          </svg>
        </motion.div>
        <motion.div
          className="h3d-iso h3d-iso--diamond3"
          animate={shouldReduce ? {} : { rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="10" y="1" width="13" height="13" rx="1.5" transform="rotate(45 10 1)" stroke={accent} strokeWidth="1" opacity="0.5" />
          </svg>
        </motion.div>
      </motion.div>

      {/* ── Gold ambient glow ── */}
      <div
        className="hero-glow"
        style={{
          background: `radial-gradient(ellipse 55% 35% at 70% 55%, ${accent}18, transparent 70%)`,
        }}
      />

      {/* ── Hero content ── */}
      <motion.div
        className="hero-content"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        style={{ scale: shouldReduce ? 1 : scaleHero, opacity: shouldReduce ? 1 : opacityHero }}
      >
        <HeritageMotif
          accent={accent}
          className="absolute -top-16 -left-16 opacity-40"
        />

        {tenant.logo_url ? (
          <motion.div className="hero-brand" variants={heroChild}>
            <img
              src={tenant.logo_url}
              alt={`${tenant.name} logo`}
              className="hero-logo"
            />
          </motion.div>
        ) : null}

        <motion.div
          className="hero-eyebrow"
          style={{ color: accent }}
          variants={heroChild}
        >
          <span className="hero-eyebrow-line" style={{ background: accent }} />
          {contact?.city || "Addis Ababa"}, Ethiopia
          {tenant.founded_year && ` · Est. ${tenant.founded_year}`}
        </motion.div>

        <motion.h1 className="hero-title display" variants={heroChild}>
          {firstName ? `${firstName} ` : ""}
          <em style={{ color: accent }}>{lastName}</em>
        </motion.h1>

        <motion.p className="hero-tagline" variants={heroChild}>
          {tenant.tagline ||
            "Building the future of Ethiopia, one structure at a time."}
        </motion.p>

        {/* Inline mini stats */}
        {yearsActive && (
          <motion.div className="hero-stats-row" variants={heroChild}>
            <div className="hero-stat">
              <span className="hero-stat-num" style={{ color: accent }}>
                <AnimatedNumber value={yearsActive} suffix="+" />
              </span>
              <span className="hero-stat-label">Years Active</span>
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
              <span className="hero-stat-label">Team Members</span>
            </div>
          </motion.div>
        )}

        <motion.div className="hero-actions" variants={heroChild}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onScrollTo("projects")}
            style={{ background: accent }}
          >
            View Our Work
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => onScrollTo("contact")}
          >
            Contact Us
          </button>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div
          className="scroll-line"
          style={{
            background: `linear-gradient(to bottom, ${accent}, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
