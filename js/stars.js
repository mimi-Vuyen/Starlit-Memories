/* Vẽ nền sao nhẹ bằng Canvas 2D, không dùng thư viện ngoài. */
(function () {
  "use strict";

  const canvas = document.querySelector(".starfield");
  const context = canvas && canvas.getContext("2d");

  if (!canvas || !context) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stars = [];
  const starCountPerPixel = 0.00012;
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let lastFrame = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(110, Math.max(36, Math.round(width * height * starCountPerPixel)));
    stars.length = 0;

    for (let index = 0; index < count; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.05 + 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        drift: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2
      });
    }

    draw(0, true);
  }

  function draw(time, still) {
    context.clearRect(0, 0, width, height);

    stars.forEach(function (star) {
      const shimmer = still ? 0 : Math.sin(time * 0.00045 + star.phase) * 0.12;
      const opacity = Math.max(0.08, Math.min(0.9, star.opacity + shimmer));

      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(224, 218, 255, " + opacity + ")";
      context.fill();

      if (!still) {
        star.x += star.drift;
        if (star.x < -2) star.x = width + 2;
        if (star.x > width + 2) star.x = -2;
      }
    });
  }

  function animate(time) {
    if (time - lastFrame > 40) {
      draw(time, false);
      lastFrame = time;
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function updateMotionPreference() {
    window.cancelAnimationFrame(animationFrame);
    if (reducedMotion.matches) {
      draw(0, true);
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", updateMotionPreference);
  }

  resize();
  updateMotionPreference();
})();
