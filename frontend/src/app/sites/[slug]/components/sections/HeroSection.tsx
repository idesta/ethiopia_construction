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

/* ═══════════════════════════════════════════════════════════════════
   10 ANIMATED SVG CONSTRUCTION SCENES
   Each is a transparent-background inline SVG with CSS keyframe
   animations built in. They adapt to the tenant accent color.
   ═══════════════════════════════════════════════════════════════════ */

function SceneCrane({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tower Crane">
      <style>{`
        @keyframes swing{0%,100%{transform-origin:200px 60px;transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
        @keyframes blink{0%,100%{opacity:.9}50%{opacity:.3}}
        @keyframes rise{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
        .crane-hook{animation:swing 3s ease-in-out infinite}
        .crane-blink{animation:blink 1.8s ease-in-out infinite}
        .crane-float{animation:rise 4s ease-in-out infinite}
      `}</style>
      {/* Mast */}
      <rect x="192" y="80" width="16" height="300" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      {/* Lattice */}
      {[100,130,160,190,220,250,280,310,340].map(y=>(
        <g key={y}>
          <line x1="192" y1={y} x2="208" y2={y+15} stroke={a} strokeWidth="0.7" opacity="0.5"/>
          <line x1="208" y1={y} x2="192" y2={y+15} stroke={a} strokeWidth="0.7" opacity="0.5"/>
        </g>
      ))}
      {/* Jib */}
      <rect x="80" y="75" width="240" height="10" rx="3" fill={a} opacity="0.85"/>
      {/* Counter-jib weight */}
      <rect x="82" y="85" width="45" height="18" rx="3" fill="#14161b" stroke={a} strokeWidth="1"/>
      {/* Cap */}
      <polygon points="200,58 216,78 184,78" fill={a}/>
      {/* Trolley */}
      <g className="crane-hook">
        <rect x="248" y="85" width="20" height="12" rx="2" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
        <line x1="258" y1="97" x2="258" y2="148" stroke={a} strokeWidth="1.2" opacity="0.8"/>
        <path d="M252 148 Q258 160 264 148" stroke={a} strokeWidth="2" fill="none"/>
        {/* Load block */}
        <rect x="244" y="162" width="28" height="20" rx="2" fill="#14161b" stroke={a} strokeWidth="0.8"/>
      </g>
      {/* Base platform */}
      <rect x="182" y="376" width="36" height="8" rx="2" fill={a} opacity="0.6"/>
      <rect x="162" y="382" width="76" height="6" rx="2" fill={a} opacity="0.3"/>
      {/* Ground lights */}
      <circle cx="175" cy="390" r="3" fill={a} className="crane-blink"/>
      <circle cx="225" cy="390" r="3" fill={a} className="crane-blink" style={{animationDelay:"0.9s"}}/>
      {/* Background city silhouette */}
      <rect x="20"  y="280" width="50" height="100" fill="#14161b" stroke={a} strokeWidth="0.5" opacity="0.4"/>
      <rect x="310" y="260" width="60" height="120" fill="#14161b" stroke={a} strokeWidth="0.5" opacity="0.35"/>
      <rect x="340" y="240" width="28" height="140" fill="#1c1f27" stroke={a} strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

function SceneVilla({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Villa House">
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}.win{animation:shimmer 3s ease-in-out infinite}`}</style>
      {/* Ground */}
      <rect x="0" y="330" width="400" height="50" fill="#0d0e11"/>
      <line x1="0" y1="330" x2="400" y2="330" stroke={a} strokeWidth="0.5" opacity="0.3"/>
      {/* Main body */}
      <rect x="60" y="180" width="280" height="150" fill="#14161b" stroke={a} strokeWidth="1"/>
      {/* Roof */}
      <polygon points="40,180 200,90 360,180" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
      <line x1="200" y1="90" x2="200" y2="180" stroke={a} strokeWidth="0.8" opacity="0.5"/>
      {/* Windows upper */}
      <rect x="110" y="120" width="45" height="35" rx="2" fill="#0a0b0d" stroke={a} strokeWidth="0.8" className="win"/>
      <rect x="245" y="120" width="45" height="35" rx="2" fill="#0a0b0d" stroke={a} strokeWidth="0.8" className="win" style={{animationDelay:"1s"}}/>
      {/* Door */}
      <rect x="168" y="255" width="64" height="75" rx="3" fill="#0a0b0d" stroke={a} strokeWidth="1"/>
      <circle cx="226" cy="292" r="4" fill={a}/>
      {/* Ground floor windows */}
      <rect x="85"  y="215" width="55" height="40" rx="2" fill="#0a0b0d" stroke={a} strokeWidth="0.8" className="win" style={{animationDelay:"0.5s"}}/>
      <rect x="260" y="215" width="55" height="40" rx="2" fill="#0a0b0d" stroke={a} strokeWidth="0.8" className="win" style={{animationDelay:"1.5s"}}/>
      {/* Chimney */}
      <rect x="270" y="100" width="22" height="50" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      {/* Accent stripe */}
      <rect x="60" y="195" width="280" height="5" fill={a} opacity="0.35"/>
      {/* Garden path */}
      <ellipse cx="200" cy="340" rx="38" ry="6" fill={a} opacity="0.12"/>
      {[0,1,2].map(i=>(
        <rect key={i} x={175+i*20} y={330} width="12" height="10" rx="1" fill="#1c1f27" stroke={a} strokeWidth="0.5"/>
      ))}
    </svg>
  );
}

function SceneApartment({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apartment">
      <style>{`@keyframes wink{0%,80%,100%{opacity:.6}85%{opacity:.05}}.apt-w{animation:wink 5s ease-in-out infinite}`}</style>
      {/* Tower A */}
      <rect x="40"  y="80"  width="110" height="350" fill="#14161b" stroke={a} strokeWidth="1"/>
      {/* Tower B */}
      <rect x="250" y="120" width="110" height="310" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      {/* Tower C (back) */}
      <rect x="150" y="40"  width="100" height="390" fill="#0f1017" stroke={a} strokeWidth="1" opacity="0.85"/>
      {/* Windows tower A */}
      {[100,135,170,205,240,275,310,345].map(y=>
        [55,80,105].map(x=>(
          <rect key={`a${x}${y}`} x={x} y={y} width="20" height="15" rx="1" fill={a} opacity="0.35" className="apt-w"
            style={{animationDelay:`${(x+y)*0.008}s`}}/>
        ))
      )}
      {/* Windows tower B */}
      {[140,175,210,245,280,315,350].map(y=>
        [265,290,315,340].map(x=>(
          <rect key={`b${x}${y}`} x={x} y={y} width="20" height="14" rx="1" fill={a} opacity="0.28" className="apt-w"
            style={{animationDelay:`${(x+y)*0.006}s`}}/>
        ))
      )}
      {/* Windows tower C */}
      {[60,95,130,165,200,235,270,305,340].map(y=>
        [163,188,213].map(x=>(
          <rect key={`c${x}${y}`} x={x} y={y} width="16" height="12" rx="1" fill={a} opacity="0.22" className="apt-w"
            style={{animationDelay:`${(x+y)*0.007}s`}}/>
        ))
      )}
      {/* Roof accents */}
      <line x1="40"  y1="80"  x2="150" y2="80"  stroke={a} strokeWidth="2" opacity="0.7"/>
      <line x1="150" y1="40"  x2="250" y2="40"  stroke={a} strokeWidth="2" opacity="0.6"/>
      <line x1="250" y1="120" x2="360" y2="120" stroke={a} strokeWidth="2" opacity="0.5"/>
      {/* Antennas */}
      <line x1="95"  y1="80"  x2="95"  y2="54"  stroke={a} strokeWidth="1.2"/>
      <circle cx="95" cy="52" r="3" fill={a}/>
      <line x1="200" y1="40"  x2="200" y2="14"  stroke={a} strokeWidth="1.2"/>
      <circle cx="200" cy="12" r="3" fill={a}/>
      {/* Ground */}
      <rect x="0" y="428" width="400" height="32" fill="#0d0e11"/>
    </svg>
  );
}

function SceneRoad({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Road">
      <style>{`
        @keyframes roll{from{transform:translateX(-420px)}to{transform:translateX(0)}}
        @keyframes dashMove{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
        .roller{animation:roll 4s linear infinite}
        .road-dash{animation:dashMove 0.6s linear infinite}
      `}</style>
      {/* Sky gradient strip */}
      <rect x="0" y="0" width="400" height="180" fill="#0d0e11"/>
      {/* Distant buildings */}
      {[20,70,110,160,210,260,300,340].map((x,i)=>(
        <rect key={x} x={x} y={160-(i%3)*30} width={20+i*4} height={30+(i%3)*30} fill="#14161b" stroke={a} strokeWidth="0.4" opacity="0.4"/>
      ))}
      {/* Road surface */}
      <rect x="0" y="200" width="400" height="80" fill="#1a1a1a"/>
      <rect x="0" y="278" width="400" height="20" fill="#111"/>
      {/* Road markings */}
      <line x1="0" y1="240" x2="400" y2="240" strokeDasharray="30 15" strokeWidth="3"
        stroke={a} opacity="0.6" className="road-dash"/>
      {/* Pavement edges */}
      <line x1="0" y1="200" x2="400" y2="200" stroke={a} strokeWidth="1.5" opacity="0.5"/>
      <line x1="0" y1="278" x2="400" y2="278" stroke={a} strokeWidth="1" opacity="0.3"/>
      {/* Road roller */}
      <g className="roller" transform="translateX(0)">
        {/* Body */}
        <rect x="310" y="210" width="90" height="55" rx="4" fill="#2a2a30" stroke={a} strokeWidth="1"/>
        {/* Drum (front roller) */}
        <ellipse cx="325" cy="268" rx="16" ry="12" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
        <ellipse cx="325" cy="268" rx="10" ry="7"  fill="#14161b" stroke={a} strokeWidth="0.6"/>
        {/* Rear wheel */}
        <ellipse cx="382" cy="268" rx="10" ry="9" fill="#1c1f27" stroke={a} strokeWidth="1"/>
        {/* Cab */}
        <rect x="340" y="215" width="52" height="35" rx="3" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
        <rect x="345" y="220" width="22" height="16" rx="1" fill={a} opacity="0.2"/>
        {/* Accent stripe */}
        <rect x="310" y="238" width="90" height="4" fill={a} opacity="0.5"/>
      </g>
      {/* Worker silhouette */}
      <circle cx="120" cy="198" r="10" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      <rect x="112" y="208" width="16" height="30" rx="4" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      <line x1="112" y1="218" x2="98"  y2="232" stroke={a} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="128" y1="218" x2="140" y2="228" stroke={a} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Hard hat */}
      <path d="M110 196 Q120 188 130 196" fill={a} opacity="0.85"/>
      {/* Cone */}
      <polygon points="190,278 198,240 206,278" fill={a} opacity="0.7"/>
      <polygon points="215,278 222,252 229,278" fill={a} opacity="0.5"/>
    </svg>
  );
}

function SceneTallBuilding({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tall Buildings">
      <style>{`@keyframes glow{0%,100%{opacity:.4}50%{opacity:.9}}.tglow{animation:glow 2.5s ease-in-out infinite}`}</style>
      {/* Main skyscraper */}
      <rect x="130" y="40"  width="140" height="440" fill="#14161b" stroke={a} strokeWidth="1.2"/>
      {/* Glass curtain wall panels */}
      {Array.from({length:18},(_, r)=>Array.from({length:4},(_, c)=>(
        <rect key={`${r}${c}`} x={138+c*34} y={50+r*24} width="28" height="18" rx="1"
          fill={a} opacity={0.08+(r%3)*0.06} stroke={a} strokeWidth="0.3"/>
      )))}
      {/* Glowing crown windows */}
      {[60,78].map(y=>
        [138,172,206,240].map(x=>(
          <rect key={`${x}${y}`} x={x} y={y} width="28" height="12" rx="1" fill={a} opacity="0.55" className="tglow"
            style={{animationDelay:`${x*0.01}s`}}/>
        ))
      )}
      {/* Spire */}
      <line x1="200" y1="40"  x2="200" y2="4"   stroke={a} strokeWidth="2"/>
      <circle cx="200" cy="4" r="4" fill={a} className="tglow"/>
      {/* Side building L */}
      <rect x="30"  y="160" width="100" height="320" fill="#1c1f27" stroke={a} strokeWidth="0.8" opacity="0.8"/>
      {Array.from({length:10},(_, r)=>[42,65,90].map(x=>(
        <rect key={`l${x}${r}`} x={x} y={172+r*28} width="18" height="16" rx="1" fill={a} opacity="0.2"/>
      )))}
      {/* Side building R */}
      <rect x="270" y="200" width="100" height="280" fill="#1c1f27" stroke={a} strokeWidth="0.8" opacity="0.75"/>
      {Array.from({length:8},(_, r)=>[282,305,328,350].map(x=>(
        <rect key={`r${x}${r}`} x={x} y={212+r*28} width="16" height="15" rx="1" fill={a} opacity="0.18"/>
      )))}
      {/* Ground reflection */}
      <rect x="0" y="476" width="400" height="24" fill="#0d0e11"/>
      <line x1="0" y1="476" x2="400" y2="476" stroke={a} strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

function SceneSafetyGear({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Safety Gear">
      <style>{`@keyframes pulse{0%,100%{r:18}50%{r:22}}.hpulse{animation:pulse 2s ease-in-out infinite}`}</style>
      {/* Hard hat large */}
      <path d="M100 200 Q100 100 200 82 Q300 100 300 200 Z" fill={a} opacity="0.88"/>
      <rect x="80"  y="196" width="240" height="28" rx="14" fill={a} opacity="0.65"/>
      <rect x="168" y="82"  width="32"  height="50" rx="4"  fill="rgba(255,255,255,0.1)"/>
      <path d="M122 145 Q200 118 278 145" stroke="rgba(255,255,255,0.22)" strokeWidth="5" fill="none"/>
      {/* Safety vest shape */}
      <path d="M140 240 L120 340 L200 320 L280 340 L260 240 L220 260 L200 250 L180 260 Z"
        fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
      {/* Vest stripes */}
      <path d="M148 270 L252 270" stroke={a} strokeWidth="6" opacity="0.7" strokeLinecap="round"/>
      <path d="M145 292 L255 292" stroke={a} strokeWidth="6" opacity="0.5" strokeLinecap="round"/>
      {/* Reflective strips */}
      <path d="M156 282 L244 282" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round"/>
      {/* Goggles */}
      <circle cx="170" cy="170" r="22" fill="#0d0e11" stroke={a} strokeWidth="2"/>
      <circle cx="230" cy="170" r="22" fill="#0d0e11" stroke={a} strokeWidth="2"/>
      <line x1="192" y1="170" x2="208" y2="170" stroke={a} strokeWidth="2"/>
      <circle cx="170" cy="170" r="12" fill={a} opacity="0.15"/>
      <circle cx="230" cy="170" r="12" fill={a} opacity="0.15"/>
      {/* Gloves */}
      <path d="M110 260 Q80 255 72 275 Q68 295 90 298 Q108 300 115 280 Z" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      <path d="M290 260 Q320 255 328 275 Q332 295 310 298 Q292 300 285 280 Z" fill="#1c1f27" stroke={a} strokeWidth="1"/>
    </svg>
  );
}

function SceneBulldozer({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bulldozer">
      <style>{`
        @keyframes trackMove{from{stroke-dashoffset:0}to{stroke-dashoffset:30}}
        @keyframes bladeShake{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .track{animation:trackMove 0.5s linear infinite}
        .blade{animation:bladeShake 1.2s ease-in-out infinite}
      `}</style>
      {/* Ground */}
      <rect x="0" y="248" width="440" height="52" fill="#0f1017"/>
      <line x1="0" y1="248" x2="440" y2="248" stroke={a} strokeWidth="0.8" opacity="0.3"/>
      {/* Track left */}
      <rect x="60"  y="196" width="270" height="54" rx="27" fill="#1c1f27" stroke={a} strokeWidth="1.5"/>
      <rect x="72"  y="202" width="246" height="42" rx="21" fill="#14161b" stroke={a} strokeWidth="0.5"/>
      {/* Track links */}
      <rect x="60" y="196" width="270" height="54" rx="27" fill="none"
        stroke={a} strokeWidth="8" strokeDasharray="18 6" opacity="0.35" className="track"/>
      {/* Sprockets */}
      <circle cx="88"  cy="223" r="24" fill="#1c1f27" stroke={a} strokeWidth="1.5"/>
      <circle cx="88"  cy="223" r="14" fill="#0d0e11" stroke={a} strokeWidth="1"/>
      <circle cx="88"  cy="223" r="5"  fill={a}/>
      <circle cx="302" cy="223" r="24" fill="#1c1f27" stroke={a} strokeWidth="1.5"/>
      <circle cx="302" cy="223" r="14" fill="#0d0e11" stroke={a} strokeWidth="1"/>
      <circle cx="302" cy="223" r="5"  fill={a}/>
      {/* Idler wheels */}
      {[138,178,218,258].map(x=>(
        <circle key={x} cx={x} cy="238" r="10" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      ))}
      {/* Main body */}
      <rect x="110" y="130" width="200" height="70" rx="5" fill="#14161b" stroke={a} strokeWidth="1.2"/>
      {/* Cab */}
      <rect x="198" y="88"  width="90"  height="46" rx="4" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      <rect x="206" y="94"  width="44"  height="28" rx="2" fill={a} opacity="0.15"/>
      {/* Exhaust stack */}
      <rect x="270" y="60"  width="12"  height="32" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      <ellipse cx="276" cy="60" rx="7" ry="4" fill="#0d0e11" stroke={a} strokeWidth="0.8"/>
      {/* Blade */}
      <g className="blade">
        <path d="M60 148 L110 138 L110 198 L60 210 Z" fill="#1c1f27" stroke={a} strokeWidth="1.5"/>
        <path d="M58 148 L62 148 L62 210 L58 210 Z" fill={a} opacity="0.6"/>
        <line x1="62" y1="155" x2="62" y2="204" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
        <rect x="46" y="170" width="16" height="25" rx="2" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      </g>
      {/* Ripper (back) */}
      <path d="M310 180 L350 172 L356 218 L310 218 Z" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      <line x1="338" y1="190" x2="345" y2="230" stroke={a} strokeWidth="2" strokeLinecap="round"/>
      {/* Accent stripe */}
      <rect x="110" y="175" width="200" height="6" fill={a} opacity="0.4"/>
    </svg>
  );
}

function SceneExcavator({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 460 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Excavator">
      <style>{`
        @keyframes dig{0%,100%{transform:rotate(0deg);transform-origin:290px 140px}50%{transform:rotate(12deg);transform-origin:290px 140px}}
        @keyframes scoop{0%,100%{transform:rotate(0deg);transform-origin:380px 175px}50%{transform:rotate(-18deg);transform-origin:380px 175px}}
        .arm1{animation:dig 3s ease-in-out infinite}
        .arm2{animation:scoop 3s ease-in-out infinite 0.2s}
      `}</style>
      {/* Ground */}
      <rect x="0" y="268" width="460" height="52" fill="#0f1017"/>
      <line x1="0" y1="268" x2="460" y2="268" stroke={a} strokeWidth="0.8" opacity="0.3"/>
      {/* Tracks */}
      <rect x="30"  y="218" width="280" height="52" rx="26" fill="#1c1f27" stroke={a} strokeWidth="1.5"/>
      <rect x="43"  y="224" width="254" height="40" rx="20" fill="#14161b"/>
      <rect x="30" y="218" width="280" height="52" rx="26" fill="none"
        stroke={a} strokeWidth="7" strokeDasharray="16 6" opacity="0.3"/>
      <circle cx="56"  cy="244" r="22" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
      <circle cx="284" cy="244" r="22" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
      <circle cx="56"  cy="244" r="10" fill="#0d0e11" stroke={a} strokeWidth="0.8"/>
      <circle cx="284" cy="244" r="10" fill="#0d0e11" stroke={a} strokeWidth="0.8"/>
      {[110,150,190,230].map(x=>(
        <circle key={x} cx={x} cy="256" r="9" fill="#1c1f27" stroke={a} strokeWidth="0.7"/>
      ))}
      {/* Body / swing */}
      <rect x="60"  y="150" width="230" height="72" rx="6" fill="#14161b" stroke={a} strokeWidth="1.2"/>
      {/* Cab */}
      <rect x="70"  y="102" width="110" height="52" rx="5" fill="#1c1f27" stroke={a} strokeWidth="1"/>
      <rect x="78"  y="108" width="55"  height="30" rx="2" fill={a} opacity="0.18"/>
      {/* Counterweight */}
      <rect x="240" y="162" width="50"  height="32" rx="3" fill="#0d0e11" stroke={a} strokeWidth="1"/>
      {/* Boom arm */}
      <g className="arm1">
        <rect x="270" y="90" width="120" height="16" rx="6" fill={a} opacity="0.75" transform="rotate(-25 270 90)"/>
      </g>
      {/* Stick */}
      <g className="arm2">
        <rect x="360" y="120" width="80" height="12" rx="5" fill={a} opacity="0.6" transform="rotate(20 360 120)"/>
        {/* Bucket */}
        <path d="M406 148 L428 138 L436 162 L412 174 Z" fill="#14161b" stroke={a} strokeWidth="1.2" transform="rotate(20 360 120)"/>
        <line x1="412" y1="174" x2="408" y2="184" stroke={a} strokeWidth="2" strokeLinecap="round" transform="rotate(20 360 120)"/>
        <line x1="420" y1="170" x2="418" y2="180" stroke={a} strokeWidth="2" strokeLinecap="round" transform="rotate(20 360 120)"/>
        <line x1="428" y1="165" x2="428" y2="175" stroke={a} strokeWidth="2" strokeLinecap="round" transform="rotate(20 360 120)"/>
      </g>
      {/* Body stripe */}
      <rect x="60" y="193" width="230" height="5" fill={a} opacity="0.4"/>
    </svg>
  );
}

function SceneTruck({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Truck">
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes headlight{0%,100%{opacity:.8}50%{opacity:.4}}
        .wheel{transform-box:fill-box;transform-origin:center;animation:spin 1s linear infinite}
        .light{animation:headlight 1.5s ease-in-out infinite}
      `}</style>
      {/* Ground */}
      <rect x="0" y="240" width="480" height="40" fill="#0f1017"/>
      <line x1="0" y1="240" x2="480" y2="240" stroke={a} strokeWidth="0.8" opacity="0.3"/>
      {/* Dump body */}
      <path d="M160 80 L390 80 L410 200 L140 200 Z" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
      {/* Load (gravel) */}
      <path d="M168 88 L382 88 L396 192 L152 192 Z" fill="#14161b"/>
      <path d="M168 88 Q275 76 382 88" fill={a} opacity="0.12"/>
      {/* Cab */}
      <rect x="60"  y="108" width="102" height="94" rx="6" fill="#14161b" stroke={a} strokeWidth="1.2"/>
      {/* Windshield */}
      <rect x="70"  y="116" width="60"  height="40" rx="3" fill={a} opacity="0.15"/>
      {/* Headlights */}
      <rect x="62"  y="164" width="18"  height="12" rx="2" fill={a} opacity="0.8" className="light"/>
      <rect x="62"  y="180" width="18"  height="8"  rx="2" fill={a} opacity="0.4" className="light" style={{animationDelay:"0.5s"}}/>
      {/* Exhaust */}
      <rect x="148" y="90"  width="10"  height="22" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      {/* Chassis */}
      <rect x="55"  y="200" width="370" height="18" rx="3" fill="#14161b" stroke={a} strokeWidth="0.8"/>
      {/* Wheels */}
      {[100,155,280,345,400].map(x=>(
        <g key={x}>
          <circle cx={x} cy="232" r="26" fill="#1c1f27" stroke={a} strokeWidth="1.5" className="wheel"/>
          <circle cx={x} cy="232" r="16" fill="#0d0e11" stroke={a} strokeWidth="0.8"/>
          <circle cx={x} cy="232" r="5"  fill={a}/>
          {[0,60,120,180,240,300].map(deg=>(
            <line key={deg} x1={x} y1="232"
              x2={x+14*Math.cos(deg*Math.PI/180)}
              y2={232+14*Math.sin(deg*Math.PI/180)}
              stroke={a} strokeWidth="1" opacity="0.5"/>
          ))}
        </g>
      ))}
      {/* Accent */}
      <rect x="55" y="200" width="370" height="5" fill={a} opacity="0.4"/>
    </svg>
  );
}

function SceneEngineer({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 400 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Civil Engineer">
      <style>{`
        @keyframes measure{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.04)}}
        @keyframes nod{0%,100%{transform:rotate(0deg);transform-origin:200px 80px}50%{transform:rotate(-4deg);transform-origin:200px 80px}}
        .blueprint{animation:measure 3s ease-in-out infinite}
        .head{animation:nod 4s ease-in-out infinite}
      `}</style>
      {/* Blueprint / plan table */}
      <rect x="60"  y="260" width="280" height="140" rx="4" fill="#14161b" stroke={a} strokeWidth="1.2" className="blueprint"/>
      {/* Grid on blueprint */}
      {[280,300,320,340,360,380].map(y=>
        <line key={y} x1="68" y1={y} x2="332" y2={y} stroke={a} strokeWidth="0.4" opacity="0.3"/>
      )}
      {[80,110,140,170,200,230,260,290,320].map(x=>
        <line key={x} x1={x} y1="268" x2={x} y2="392" stroke={a} strokeWidth="0.4" opacity="0.3"/>
      )}
      {/* Floor plan lines on blueprint */}
      <rect x="80"  y="278" width="80" height="60" stroke={a} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <rect x="170" y="278" width="50" height="40" stroke={a} strokeWidth="1"   fill="none" opacity="0.6"/>
      <rect x="230" y="290" width="90" height="80" stroke={a} strokeWidth="1"   fill="none" opacity="0.55"/>
      <line x1="80" y1="338" x2="320" y2="338" stroke={a} strokeWidth="0.8" opacity="0.5"/>
      {/* Compass/ruler on table */}
      <line x1="180" y1="370" x2="300" y2="370" stroke={a} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      {[185,205,225,245,265,285].map(x=>(
        <line key={x} x1={x} y1="370" x2={x} y2={x%40===5?362:366} stroke={a} strokeWidth="1" opacity="0.5"/>
      ))}
      {/* Person */}
      {/* Head */}
      <g className="head">
        <circle cx="200" cy="82" r="32" fill="#1c1f27" stroke={a} strokeWidth="1.2"/>
        {/* Face */}
        <rect x="186" y="74" width="10" height="12" rx="3" fill={a} opacity="0.5"/>
        <rect x="204" y="74" width="10" height="12" rx="3" fill={a} opacity="0.5"/>
        <path d="M190 96 Q200 104 210 96" stroke={a} strokeWidth="1.5" fill="none"/>
        {/* Hard hat */}
        <path d="M168 78 Q168 50 200 46 Q232 50 232 78 Z" fill={a} opacity="0.9"/>
        <rect x="162" y="76" width="76" height="8" rx="4" fill={a} opacity="0.6"/>
      </g>
      {/* Neck */}
      <rect x="192" y="112" width="16" height="20" fill="#1c1f27" stroke={a} strokeWidth="0.6"/>
      {/* Body / vest */}
      <path d="M148 130 L200 124 L252 130 L268 258 L132 258 Z" fill="#14161b" stroke={a} strokeWidth="1.2"/>
      {/* Vest stripes */}
      <line x1="155" y1="165" x2="245" y2="165" stroke={a} strokeWidth="5" opacity="0.6" strokeLinecap="round"/>
      <line x1="152" y1="185" x2="248" y2="185" stroke={a} strokeWidth="5" opacity="0.4" strokeLinecap="round"/>
      {/* Arms */}
      <path d="M148 140 L100 210 L114 216 L158 154 Z" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      <path d="M252 140 L300 210 L314 204 L242 136 Z" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      {/* Hands */}
      <circle cx="107" cy="214" r="10" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      <circle cx="307" cy="207" r="10" fill="#1c1f27" stroke={a} strokeWidth="0.8"/>
      {/* Clipboard in right hand */}
      <rect x="298" y="192" width="32" height="40" rx="2" fill="#14161b" stroke={a} strokeWidth="0.8"/>
      <line x1="304" y1="202" x2="324" y2="202" stroke={a} strokeWidth="0.8" opacity="0.6"/>
      <line x1="304" y1="210" x2="324" y2="210" stroke={a} strokeWidth="0.8" opacity="0.6"/>
      <line x1="304" y1="218" x2="318" y2="218" stroke={a} strokeWidth="0.8" opacity="0.6"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE REGISTRY
   ═══════════════════════════════════════════════════════════════════ */
const SCENES: { label: string; Component: React.FC<{ a: string }> }[] = [
  { label: "Tower Crane",     Component: SceneCrane },
  { label: "Villa House",     Component: SceneVilla },
  { label: "Apartment Block", Component: SceneApartment },
  { label: "Asphalt Road",    Component: SceneRoad },
  { label: "Tall Buildings",  Component: SceneTallBuilding },
  { label: "Safety Gear",     Component: SceneSafetyGear },
  { label: "Bulldozer",       Component: SceneBulldozer },
  { label: "Excavator",       Component: SceneExcavator },
  { label: "Dump Truck",      Component: SceneTruck },
  { label: "Civil Engineer",  Component: SceneEngineer },
];

const N = SCENES.length; // 10 pieces to scatter

/* Scatter destinations — spread wide across the hero */
const SCATTER = Array.from({ length: N }, (_, i) => {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
  const radius = 420 + i * 28;
  return {
    x:   Math.cos(angle) * radius,
    y:   Math.sin(angle) * radius * 0.65,
    rot: (i % 2 === 0 ? 1 : -1) * (28 + i * 9),
  };
});

/* ═══════════════════════════════════════════════════════════════════
   SCATTER PIECE — renders in a full-viewport absolute overlay
   so pieces can fly across the entire hero, not just the right column
   ═══════════════════════════════════════════════════════════════════ */
interface PieceProps {
  sceneIdx: number;
  pieceIdx: number;
  accent:   string;
  phase:    "enter" | "exit";
  /* centre of the assembled scene in viewport coords */
  originX:  number;
  originY:  number;
}

function ScatterPiece({ sceneIdx, pieceIdx, accent, phase, originX, originY }: PieceProps) {
  const { Component } = SCENES[sceneIdx];
  const s = SCATTER[pieceIdx];
  const size = 80 + (pieceIdx % 4) * 18;
  const delay = pieceIdx * 0.06;

  // Where this piece sits when assembled (loose cluster around origin)
  const offsetX = (((pieceIdx * 137) % 360) / 360 - 0.5) * 260;
  const offsetY = (((pieceIdx * 97)  % 360) / 360 - 0.5) * 180;

  const assembled = {
    x: originX + offsetX - size / 2,
    y: originY + offsetY - size / 2,
    rotate: (pieceIdx % 2 === 0 ? 1 : -1) * (pieceIdx % 3) * 4,
    scale:   0.5 + (pieceIdx % 4) * 0.1,
    opacity: 0.5 + (pieceIdx % 3) * 0.15,
    filter:  "blur(0px)",
  };

  // Scattered = origin + full-viewport scatter vector
  const scatteredX = originX + s.x - size / 2;
  const scatteredY = originY + s.y - size / 2;

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
        <Component a={accent} />
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
        <Component a={accent} />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CENTRAL SCENE  — shows ONE large hero SVG + scattered smaller ones
   ═══════════════════════════════════════════════════════════════════ */
interface SceneDisplayProps {
  accent: string;
  shouldReduce: boolean | null;
}

function SceneDisplay({ accent, shouldReduce }: SceneDisplayProps) {
  const [current, setCurrent] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [phase,   setPhase]   = useState<"enter" | "exit">("enter");
  const stageRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // Measure the centre of the stage in viewport coords so scatter
  // pieces can use position:fixed and truly cross the full screen
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
  }, []);

  const EXIT_MS  = N * 60 + 580;
  const ENTER_MS = N * 60 + 980;
  const HOLD_MS  = 4500;

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
    const t = setTimeout(() => goTo((current + 1) % SCENES.length), ENTER_MS + HOLD_MS);
    return () => clearTimeout(t);
  }, [shouldReduce, phase, current, goTo, ENTER_MS]);

  const { Component } = SCENES[current];
  const pieces = Array.from({ length: N }, (_, i) => i);

  return (
    <div className="hscene-stage" ref={stageRef}>
      {/* Glow */}
      <div className="hscene-glow"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent}20, transparent 68%)` }} />

      {/* Scatter pieces — position:fixed, use measured viewport origin
          so they explode across the entire hero section */}
      {origin.x > 0 && pieces.map(i => (
        <ScatterPiece
          key={`${current}-${i}`}
          sceneIdx={(current + i) % SCENES.length}
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
        <Component a={accent} />
      </motion.div>

      {/* Dot nav */}
      <div className="hscene-dots">
        {SCENES.map((sc, i) => (
          <button key={i} type="button" aria-label={`Show ${sc.label}`}
            className={`hscene-dot${i === current ? " active" : ""}`}
            style={i === current ? { background: accent, transform: "scale(1.7)" } : {}}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Label */}
      <div className="hscene-label">
        <span style={{ color: accent }}>◆</span> {SCENES[current].label}
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

        {/* RIGHT — 3D SVG scene */}
        <motion.div className="hero-right"
          style={{ y:shouldReduce?0:springSceneY, opacity:shouldReduce?1:sceneOp }}>
          <motion.div className="hero-right-tilt"
            style={{
              rotateX:        shouldReduce?0:tiltX,
              rotateY:        shouldReduce?0:tiltY,
              transformStyle: "preserve-3d",
            }}>
            <SceneDisplay accent={accent} shouldReduce={shouldReduce}/>
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
