/* Render the Scorpius sky chart and expose nine accessible memory-star event targets. */
(function () {
  "use strict";

  const map = document.querySelector("#constellation-map");
  const lineLayer = document.querySelector("#constellation-lines");
  const starLayer = document.querySelector("#constellation-stars");
  const data = window.StarlitMemories && window.StarlitMemories.constellation;

  if (!map || !lineLayer || !starLayer || !data || !Array.isArray(data.stars) || !Array.isArray(data.lines)) {
    console.error("Không thể dựng chòm sao: thiếu dữ liệu hoặc thành phần SVG bắt buộc.");
    return;
  }

  const namespace = "http://www.w3.org/2000/svg";
  const width = 1000;
  const height = 700;
  const plot = { left: 75, right: 925, top: 65, bottom: 645 };
  const rightAscensions = data.stars.map(function (star) { return star.ra; });
  const declinations = data.stars.map(function (star) { return star.dec; });
  const raMin = Math.min.apply(null, rightAscensions);
  const raMax = Math.max.apply(null, rightAscensions);
  const decMin = Math.min.apply(null, declinations);
  const decMax = Math.max.apply(null, declinations);
  const starsById = new Map();
  const memoryStarsById = new Map();
  const hitAreasByMemoryId = new Map();
  const decorativeStars = [];

  function project(star) {
    return {
      x: plot.left + ((star.ra - raMin) / (raMax - raMin)) * (plot.right - plot.left),
      y: plot.top + ((decMax - star.dec) / (decMax - decMin)) * (plot.bottom - plot.top)
    };
  }

  function svgElement(tag, attributes) {
    const element = document.createElementNS(namespace, tag);
    Object.keys(attributes).forEach(function (name) {
      element.setAttribute(name, String(attributes[name]));
    });
    return element;
  }

  data.stars.forEach(function (star) {
    starsById.set(star.id, star);
  });

  data.lines.forEach(function (connection) {
    const first = starsById.get(connection[0]);
    const second = starsById.get(connection[1]);
    if (!first || !second) {
      console.error("Bỏ qua đường nối chòm sao có mã sao không tồn tại:", connection.join("–"));
      return;
    }

    const start = project(first);
    const end = project(second);
    lineLayer.appendChild(svgElement("line", {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      class: "constellation-line"
    }));
  });

  data.stars.forEach(function (star, index) {
    const point = project(star);
    const group = svgElement("g", {
      class: "constellation-star" + (star.memoryId ? " constellation-star--memory" : " constellation-star--decorative") +
        (star.id === 80763 ? " constellation-star--antares" : ""),
      transform: "translate(" + point.x + " " + point.y + ")",
      style: "--star-delay: " + (index * 115) + "ms"
    });
    const radius = Math.max(2.6, Math.min(7.5, 8.1 - star.magnitude * 1.55));
    group.dataset.coreRadius = String(radius);
    if (star.memoryId) {
      group.setAttribute("role", "button");
      group.setAttribute("tabindex", "0");
      group.setAttribute(
        "aria-label",
        star.memoryId === 9
          ? "Ngôi sao " + star.name + ", lời chúc sinh nhật cuối đang khóa"
          : "Ngôi sao " + star.name + ", ký ức " + String(star.memoryId).padStart(2, "0") + ", chưa khám phá"
      );
      group.setAttribute("data-memory-id", String(star.memoryId));
      group.setAttribute("data-star-name", star.name);
      group.setAttribute("aria-pressed", "false");
      const hitArea = svgElement("circle", {
        class: "constellation-star__hit-area",
        r: radius + 8
      });
      group.appendChild(hitArea);
      memoryStarsById.set(star.memoryId, group);
      hitAreasByMemoryId.set(star.memoryId, hitArea);
    } else {
      group.setAttribute("aria-hidden", "true");
      decorativeStars.push(group);
    }

    group.appendChild(svgElement("circle", {
      class: "constellation-star__glow",
      r: radius * 2.8
    }));
    group.appendChild(svgElement("circle", {
      class: "constellation-star__core",
      r: radius
    }));
    group.appendChild(svgElement("circle", {
      class: "constellation-star__spark",
      r: Math.max(1.2, radius * 0.36)
    }));
    starLayer.appendChild(group);
  });

  function emitSelection(star) {
    const selected = star.getAttribute("aria-pressed") !== "true";
    star.setAttribute("aria-pressed", String(selected));
    star.classList.toggle("is-selected", selected);
    document.dispatchEvent(new CustomEvent("starlit:memory-star-select", {
      detail: {
        memoryId: Number(star.getAttribute("data-memory-id")),
        starId: Number(star.dataset.starId),
        selected: selected
      }
    }));
  }

  window.StarlitMemories.selectMemoryStar = function (memoryId) {
    const star = memoryStarsById.get(memoryId);
    if (!star) {
      console.error("Không thể chọn ký ức: không tìm thấy sao " + memoryId + ".");
      return;
    }
    if (star.getAttribute("aria-pressed") !== "true") {
      emitSelection(star);
    }
  };

  function resizeHitAreas() {
    const matrix = map.getScreenCTM();
    if (!matrix) {
      return;
    }

    const scale = Math.hypot(matrix.a, matrix.b);
    if (!Number.isFinite(scale) || scale <= 0) {
      return;
    }

    memoryStarsById.forEach(function (starElement, memoryId) {
      const baseRadius = Number(starElement.dataset.coreRadius) + 8;
      hitAreasByMemoryId.get(memoryId).setAttribute("r", String(Math.max(baseRadius, 22 / scale)));
    });
  }

  function findClosestMemoryStar(clientX, clientY) {
    let closestStar = null;
    let closestDistance = Infinity;

    memoryStarsById.forEach(function (starElement, memoryId) {
      const matrix = starElement.getScreenCTM();
      const hitRadius = Number(hitAreasByMemoryId.get(memoryId).getAttribute("r"));
      if (!matrix || !Number.isFinite(hitRadius)) {
        return;
      }

      const center = new DOMPoint(0, 0).matrixTransform(matrix);
      const distance = Math.hypot(clientX - center.x, clientY - center.y);
      if (distance <= hitRadius * Math.hypot(matrix.a, matrix.b) && distance < closestDistance) {
        closestStar = starElement;
        closestDistance = distance;
      }
    });

    return closestStar;
  }

  function isDecorativeStarHit(clientX, clientY) {
    return decorativeStars.some(function (starElement) {
      const matrix = starElement.getScreenCTM();
      const core = starElement.querySelector(".constellation-star__core");
      if (!matrix || !core) {
        return false;
      }
      const center = new DOMPoint(0, 0).matrixTransform(matrix);
      const visibleRadius = Number(core.getAttribute("r")) * Math.hypot(matrix.a, matrix.b);
      return Math.hypot(clientX - center.x, clientY - center.y) <= Math.max(5, visibleRadius + 3);
    });
  }

  memoryStarsById.forEach(function (starElement) {
    const star = data.stars.find(function (item) {
      return item.memoryId === Number(starElement.getAttribute("data-memory-id"));
    });
    starElement.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        emitSelection(starElement);
      }
    });
    starElement.dataset.starId = String(star.id);
  });

  map.addEventListener("click", function (event) {
    if (!event.target.closest(".constellation-star__hit-area")) {
      return;
    }
    if (isDecorativeStarHit(event.clientX, event.clientY)) {
      return;
    }
    const star = findClosestMemoryStar(event.clientX, event.clientY);
    if (star) {
      emitSelection(star);
    }
  });

  map.setAttribute("viewBox", "0 0 " + width + " " + height);
  resizeHitAreas();
  window.addEventListener("resize", resizeHitAreas);
  document.addEventListener("starlit:constellation-ready", resizeHitAreas);
})();
