// Confetti animation utility based on 2D physics blast effect (velocity 300-600, angle 250°-290°, gravity 800)
export function triggerConfetti(particleCount = 40) {
  const colors = ['#ff7700', '#d4af37', '#b71c1c', '#ffffff', '#ffd966', '#ef4444', '#10b981'];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.65;

  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    
    el.style.position = 'absolute';
    el.style.width = `${size}px`;
    el.style.height = `${size * (Math.random() > 0.5 ? 1 : 1.8)}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
    el.style.opacity = '1';
    el.style.boxShadow = `0 0 8px ${color}`;
    
    container.appendChild(el);

    // Physics parameters (velocity 300-600, angle 250-290 deg, gravity 750)
    const velocity = 350 + Math.random() * 300;
    const angleDeg = 245 + Math.random() * 50; // upwards blast angle
    const angleRad = (angleDeg * Math.PI) / 180;
    
    const vx = Math.cos(angleRad) * velocity;
    const vy = Math.sin(angleRad) * velocity;
    const rotSpeed = (Math.random() - 0.5) * 900;

    particles.push({ el, vx, vy, rotSpeed });
  }

  const startTime = performance.now();
  const gravity = 750;

  function animate(now) {
    const elapsed = (now - startTime) / 1000;
    if (elapsed > 2.5) {
      if (container.parentNode) container.parentNode.removeChild(container);
      return;
    }

    particles.forEach(p => {
      const currentX = p.vx * elapsed;
      const currentY = p.vy * elapsed + 0.5 * gravity * elapsed * elapsed;
      const currentRot = p.rotSpeed * elapsed;
      const opacity = Math.max(0, 1 - (elapsed / 2.2));

      p.el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentRot}deg)`;
      p.el.style.opacity = opacity.toString();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
