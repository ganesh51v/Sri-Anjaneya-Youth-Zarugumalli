import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useTheme } from '../context/ThemeContext';

const UniverseBackground = () => {
  const canvasRef = useRef(null);
  const nebula1Ref = useRef(null);
  const nebula2Ref = useRef(null);
  const nebula3Ref = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // --- Starfield ---
    const starCount = width < 768 ? 60 : width < 1280 ? 90 : 125;
    const stars = [];

    class Star {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -10;
        this.baseRadius = Math.random() * 1.5 + 0.4;
        this.radius = this.baseRadius;
        this.alpha = Math.random() * 0.7 + 0.2;
        this.baseAlpha = this.alpha;
        this.speedY = Math.random() * 0.12 + 0.03;
        this.speedX = (Math.random() - 0.5) * 0.04;

        const rand = Math.random();
        if (rand < 0.35) {
          // Warm Golden Diya Star
          this.color = isLight ? '#d97706' : '#fbbf24';
          this.glow = isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(251, 191, 36, 0.6)';
        } else if (rand < 0.55) {
          // Saffron Star
          this.color = isLight ? '#ea580c' : '#f97316';
          this.glow = isLight ? 'rgba(234, 88, 12, 0.4)' : 'rgba(249, 115, 22, 0.5)';
        } else if (rand < 0.75) {
          // Diamond Cyan
          this.color = isLight ? '#0284c7' : '#7dd3fc';
          this.glow = isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(125, 211, 252, 0.4)';
        } else {
          // Silver White
          this.color = isLight ? '#64748b' : '#ffffff';
          this.glow = isLight ? 'rgba(100, 116, 139, 0.2)' : 'rgba(255, 255, 255, 0.5)';
        }

        this.twinkleSpeed = Math.random() * 0.02 + 0.008;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }

      update() {
        if (!prefersReducedMotion) {
          this.y += this.speedY;
          this.x += this.speedX;
        }

        this.twinklePhase += this.twinkleSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.3;
        this.alpha = Math.max(0.08, Math.min(1, this.alpha));

        if (this.y > height + 10) this.reset();
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = isLight ? this.alpha * 0.65 : this.alpha * 0.9;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = this.baseRadius > 1.2 ? 5 : 2;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // --- Comets / Shooting Stars ---
    const comets = [];
    class Comet {
      constructor() {
        this.startX = Math.random() * (width * 0.7);
        this.startY = Math.random() * (height * 0.4);
        this.x = this.startX;
        this.y = this.startY;
        this.length = Math.random() * 90 + 70;
        this.speed = Math.random() * 10 + 14;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;
        this.opacity = 1;
        this.active = true;
        this.tail = [];
        this.maxTail = 16;
      }

      update() {
        if (!this.active) return;
        this.tail.unshift({ x: this.x, y: this.y, alpha: this.opacity });
        if (this.tail.length > this.maxTail) this.tail.pop();

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.02;

        if (this.opacity <= 0 || this.x > width + 100 || this.y > height + 100) {
          this.active = false;
        }
      }

      draw() {
        if (!this.active || this.tail.length < 2) return;
        ctx.save();
        for (let i = 0; i < this.tail.length - 1; i++) {
          const pt = this.tail[i];
          const nextPt = this.tail[i + 1];
          const progress = 1 - i / this.tail.length;

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.strokeStyle = isLight ? '#ea580c' : '#fbbf24';
          ctx.globalAlpha = pt.alpha * progress * (isLight ? 0.75 : 0.95);
          ctx.lineWidth = progress * 2.2;
          ctx.shadowColor = '#ff7700';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const cometInterval = setInterval(() => {
      if (!prefersReducedMotion && Math.random() > 0.4) {
        comets.push(new Comet());
      }
    }, 6000);

    // --- Solar System Planetary Data ---
    const planets = [
      { name: 'Mercury', color: '#b08968', radius: 3.0, distFactor: 0.11, speed: 0.022, angle: Math.random() * Math.PI * 2 },
      { name: 'Venus', color: '#e0a96d', radius: 4.5, distFactor: 0.17, speed: 0.015, angle: Math.random() * Math.PI * 2 },
      { name: 'Earth', color: '#38bdf8', radius: 5.2, distFactor: 0.25, speed: 0.011, angle: Math.random() * Math.PI * 2, hasMoon: true, moonDist: 10.5, moonAngle: 0 },
      { name: 'Mars', color: '#ef4444', radius: 3.8, distFactor: 0.34, speed: 0.009, angle: Math.random() * Math.PI * 2 },
      { name: 'Jupiter', color: '#f59e0b', radius: 9.8, distFactor: 0.48, speed: 0.005, angle: Math.random() * Math.PI * 2 },
      { name: 'Saturn', color: '#fcd34d', radius: 8.0, distFactor: 0.64, speed: 0.0035, angle: Math.random() * Math.PI * 2, hasRings: true },
      { name: 'Uranus', color: '#67e8f9', radius: 6.0, distFactor: 0.80, speed: 0.0024, angle: Math.random() * Math.PI * 2 },
      { name: 'Neptune', color: '#3b82f6', radius: 5.8, distFactor: 0.94, speed: 0.0018, angle: Math.random() * Math.PI * 2 }
    ];

    let sunPulse = 0;

    // --- Main Render Loop ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Starfield
      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
      }

      // 2. Draw Comets
      for (let i = comets.length - 1; i >= 0; i--) {
        comets[i].update();
        comets[i].draw();
        if (!comets[i].active) comets.splice(i, 1);
      }

      // 3. Render Responsive Solar System
      const cx = width * 0.5;
      const cy = height * 0.5;
      const isMobile = width < 768;
      const maxRadius = Math.min(width, height) * (isMobile ? 0.44 : 0.46);
      const sunRadius = isMobile ? 18 : 25;

      // Sun Flare & Core
      sunPulse += prefersReducedMotion ? 0.005 : 0.02;
      const pulseScale = 1 + Math.sin(sunPulse) * 0.06;

      ctx.save();
      // Outer solar glow
      const outerSunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * 3.4 * pulseScale);
      outerSunGrad.addColorStop(0, isLight ? 'rgba(255, 119, 0, 0.4)' : 'rgba(255, 150, 0, 0.6)');
      outerSunGrad.addColorStop(0.4, isLight ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 119, 0, 0.22)');
      outerSunGrad.addColorStop(1, 'rgba(255, 119, 0, 0)');
      ctx.fillStyle = outerSunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius * 3.4 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Core Sun
      const innerSunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * pulseScale);
      innerSunGrad.addColorStop(0, '#ffffff');
      innerSunGrad.addColorStop(0.35, '#ffedd5');
      innerSunGrad.addColorStop(0.7, '#f59e0b');
      innerSunGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = innerSunGrad;
      ctx.shadowColor = isLight ? '#ea580c' : '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Orbits & Planets
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const orbitRadius = sunRadius + p.distFactor * (maxRadius - sunRadius);

        // Orbit path line
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(212, 175, 55, 0.14)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.restore();

        // Update position
        if (!prefersReducedMotion) {
          p.angle += p.speed;
        }
        p.x = cx + Math.cos(p.angle) * orbitRadius;
        p.y = cy + Math.sin(p.angle) * orbitRadius;

        // Draw Planet Body
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 9;

        // Saturn 3D Tilted Rings
        if (p.hasRings) {
          ctx.save();
          ctx.rotate(0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 2.5, p.radius * 0.9, 0, 0, Math.PI * 2);
          ctx.strokeStyle = isLight ? 'rgba(217, 119, 6, 0.65)' : 'rgba(252, 211, 77, 0.75)';
          ctx.lineWidth = 2.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.8, p.radius * 0.65, 0, 0, Math.PI * 2);
          ctx.strokeStyle = isLight ? 'rgba(217, 119, 6, 0.35)' : 'rgba(252, 211, 77, 0.4)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        }

        // 3D Sphere Terminator (shaded away from Sun)
        const angleToSun = Math.atan2(cy - p.y, cx - p.x);
        const grad = ctx.createRadialGradient(
          Math.cos(angleToSun) * p.radius * 0.35,
          Math.sin(angleToSun) * p.radius * 0.35,
          0,
          0,
          0,
          p.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(0.85, isLight ? '#78350f' : '#0f172a');
        grad.addColorStop(1, '#000000');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Earth's Moon
        if (p.hasMoon) {
          if (!prefersReducedMotion) p.moonAngle += 0.045;
          const mx = Math.cos(p.moonAngle) * p.moonDist;
          const my = Math.sin(p.moonAngle) * p.moonDist;
          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#94a3b8' : '#e2e8f0';
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 3;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Resize listener
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(cometInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLight]);

  // Anime.js powered gentle drift for ambient cosmic nebulae
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    if (nebula1Ref.current) {
      animate(nebula1Ref.current, {
        translateX: [0, 45, -25, 0],
        translateY: [0, -35, 25, 0],
        scale: [1, 1.15, 0.95, 1],
        duration: 18000,
        loop: true,
        ease: 'inOutSine',
      });
    }

    if (nebula2Ref.current) {
      animate(nebula2Ref.current, {
        translateX: [0, -50, 30, 0],
        translateY: [0, 45, -30, 0],
        scale: [1, 1.2, 0.9, 1],
        duration: 22000,
        loop: true,
        ease: 'inOutSine',
      });
    }

    if (nebula3Ref.current) {
      animate(nebula3Ref.current, {
        translateX: [0, 30, -30, 0],
        translateY: [0, -25, 30, 0],
        scale: [1, 1.1, 1],
        duration: 15000,
        loop: true,
        ease: 'inOutSine',
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Fullscreen Cosmic Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      {/* Ambient Celestial Nebulae */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div
          ref={nebula1Ref}
          className="absolute rounded-full filter blur-[85px] transition-opacity duration-500"
          style={{
            width: '580px',
            height: '580px',
            background: 'radial-gradient(circle, #ff7700 0%, #b71c1c 45%, transparent 70%)',
            top: '-10%',
            right: '-5%',
            opacity: isLight ? 0.07 : 0.16,
          }}
        />
        <div
          ref={nebula2Ref}
          className="absolute rounded-full filter blur-[85px] transition-opacity duration-500"
          style={{
            width: '680px',
            height: '680px',
            background: 'radial-gradient(circle, #d4af37 0%, #ff7700 45%, transparent 70%)',
            bottom: '-15%',
            left: '-10%',
            opacity: isLight ? 0.07 : 0.16,
          }}
        />
        <div
          ref={nebula3Ref}
          className="absolute rounded-full filter blur-[85px] transition-opacity duration-500"
          style={{
            width: '440px',
            height: '440px',
            background: 'radial-gradient(circle, #0284c7 0%, #6366f1 45%, transparent 70%)',
            top: '35%',
            left: '25%',
            opacity: isLight ? 0.04 : 0.08,
          }}
        />
      </div>
    </div>
  );
};

export default UniverseBackground;
