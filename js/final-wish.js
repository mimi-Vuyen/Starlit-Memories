/* Orchestrate Star 09 and its independent, looping final wishes. */
(function () {
  "use strict";

  const scene = document.querySelector("#constellation-scene");
  const wish = document.querySelector("#final-wish");
  const replayButton = document.querySelector("#final-wish-replay");
  const returnButton = document.querySelector("#final-wish-return");
  const title = document.querySelector("#final-wish-title");
  const subtitle = document.querySelector("#final-wish-subtitle");
  const message = document.querySelector("#final-wish-body");
  const signature = document.querySelector("#final-wish-signature");
  const staticWishes = document.querySelector("#final-wish-static-wishes");
  const floatingSky = document.querySelector(".final-wish__sky");
  const content = window.StarlitMemories && window.StarlitMemories.finalWish;
  const floatingConfig = {
    spawnInterval: 1000,
    defaultDuration: 7000,
    minDuration: 6000,
    maxDuration: 8000,
    desktopMaxConcurrent: 3,
    mobileMaxConcurrent: 2,
    mobileBreakpoint: 760,
    safeMargin: 14,
    cardGap: 18
  };
  const timers = new Set();
  const awakeningTimers = new Set();
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = false;
  let loopActive = false;
  let nextWishIndex = 0;
  let spawnTimer = 0;
  let nextSpawnAt = 0;
  let spawnDelayRemaining = 0;
  let queuedWishIndex = null;
  let queuedCount = 0;
  let maxObservedConcurrent = 0;
  const activeCards = new Map();

  function updateFloatingStats() {
    floatingSky.dataset.activeCount = String(activeCards.size);
    floatingSky.dataset.queuedWish = queuedWishIndex === null
      ? ""
      : normalizedWishes[queuedWishIndex].id;
    floatingSky.dataset.queuedCount = String(queuedCount);
    floatingSky.dataset.maxConcurrent = String(maxObservedConcurrent);
  }

  if (!scene || !wish || !replayButton || !returnButton || !title || !subtitle ||
      !message || !signature || !staticWishes || !floatingSky || !content) {
    console.error("Không thể khởi tạo lời chúc cuối: thiếu cấu hình hoặc thành phần giao diện.");
    return;
  }

  if (["title", "message", "signature"].some(function (key) {
    return typeof content[key] !== "string" || content[key].trim() === "";
  }) || (content.subtitle !== undefined && typeof content.subtitle !== "string") ||
      !Array.isArray(content.wishes)) {
    console.error("Không thể khởi tạo lời chúc cuối: cấu hình văn bản hoặc danh sách lời chúc chưa hợp lệ.");
    return;
  }

  const finalStar = document.querySelector('[data-memory-id="9"]');
  const constellationStars = Array.from(scene.querySelectorAll(".constellation-star"));
  const constellationLines = Array.from(scene.querySelectorAll(".constellation-line"));
  if (!finalStar || constellationStars.length === 0 || constellationLines.length === 0) {
    console.error("Không thể khởi tạo lời chúc cuối: thiếu sao hoặc hình học chòm sao.");
    return;
  }

  const normalizedWishes = [];
  const wishIds = new Set();

  function getDuration(value, id) {
    let duration = floatingConfig.defaultDuration;
    if (value !== undefined) {
      if (Number.isFinite(value) && value > 0) {
        duration = Math.min(
          floatingConfig.maxDuration,
          Math.max(floatingConfig.minDuration, value)
        );
      } else {
        console.warn("Thời lượng lời chúc không hợp lệ; dùng thời lượng mặc định:", id);
      }
    }
    return duration;
  }

  content.wishes.forEach(function (entry, index) {
    if (!entry || (typeof entry.id !== "string" && typeof entry.id !== "number") ||
        String(entry.id).trim() === "" || wishIds.has(String(entry.id))) {
      console.warn("Bỏ qua lời chúc có ID thiếu tại vị trí " + (index + 1) + ".");
      return;
    }
    if (typeof entry.message !== "string" || entry.message.trim() === "") {
      console.warn("Bỏ qua lời chúc không có nội dung:", entry.id);
      return;
    }

    const id = String(entry.id);
    wishIds.add(id);
    normalizedWishes.push({
      id: id,
      message: entry.message.trim(),
      duration: getDuration(entry.duration, id)
    });
  });

  if (normalizedWishes.length === 0) {
    console.warn("Danh sách lời chúc trống hoặc không hợp lệ; dùng nội dung thay thế an toàn.");
    normalizedWishes.push({
      id: "wish-placeholder",
      message: "Lời chúc sẽ được bổ sung sau.",
      duration: floatingConfig.defaultDuration
    });
  }

  title.textContent = content.title;
  subtitle.textContent = content.subtitle || "";
  subtitle.hidden = !content.subtitle;
  message.textContent = content.message;
  signature.textContent = content.signature;

  normalizedWishes.forEach(function (wishEntry) {
    const item = document.createElement("p");
    item.className = "final-wish__static-item";
    item.setAttribute("role", "listitem");
    item.textContent = wishEntry.message;
    staticWishes.appendChild(item);
  });

  function schedule(callback, delay) {
    const timer = window.setTimeout(function () {
      timers.delete(timer);
      if (active) {
        callback();
      }
    }, delay);
    timers.add(timer);
  }

  function clearTimeline() {
    timers.forEach(window.clearTimeout);
    timers.clear();
    awakeningTimers.forEach(window.clearTimeout);
    awakeningTimers.clear();
  }

  function stopWishLoop() {
    loopActive = false;
    window.clearTimeout(spawnTimer);
    spawnTimer = 0;
    nextSpawnAt = 0;
    spawnDelayRemaining = 0;
    queuedWishIndex = null;
    queuedCount = 0;
    activeCards.forEach(function (laneId, card) {
      card.remove();
      activeCards.delete(card);
    });
    updateFloatingStats();
  }

  function clearVisualState() {
    clearTimeline();
    stopWishLoop();
    scene.classList.remove(
      "is-final-wish",
      "is-final-wish-started",
      "is-final-wish-awakening",
      "is-final-wish-gallery",
      "is-final-wish-revealed",
      "is-final-wish-eternal",
      "is-page-hidden"
    );
    constellationStars.forEach(function (star) {
      star.classList.remove("is-finally-awakened", "is-final-star");
    });
    constellationLines.forEach(function (line) {
      line.classList.remove("is-finally-awakened");
    });
  }

  function returnToConstellation(restoreFocus) {
    active = false;
    clearVisualState();
    wish.hidden = true;
    scene.classList.remove("has-memory-open");
    finalStar.setAttribute("aria-pressed", "false");
    finalStar.classList.remove("is-selected");
    document.dispatchEvent(new CustomEvent("starlit:final-wish-close"));
    if (restoreFocus) {
      finalStar.focus({ preventScroll: true });
    }
  }

  function revealConstellation() {
    scene.classList.add("is-final-wish-awakening");
    constellationLines.forEach(function (line) {
      line.classList.add("is-finally-awakened");
    });

    constellationStars.forEach(function (star, index) {
      const timer = window.setTimeout(function () {
        awakeningTimers.delete(timer);
        if (active) {
          star.classList.add("is-finally-awakened");
        }
      }, index * 155);
      awakeningTimers.add(timer);
    });
  }

  function getMaxConcurrent() {
    const mobile = window.innerWidth <= floatingConfig.mobileBreakpoint;
    return mobile ? floatingConfig.mobileMaxConcurrent : floatingConfig.desktopMaxConcurrent;
  }

  function scheduleNextSpawn(delay) {
    window.clearTimeout(spawnTimer);
    spawnDelayRemaining = delay;
    nextSpawnAt = Date.now() + delay;
    spawnTimer = window.setTimeout(function () {
      spawnTimer = 0;
      spawnDelayRemaining = 0;
      nextSpawnAt = 0;
      if (active && loopActive && !document.hidden) {
        requestNextWish();
      }
    }, delay);
  }

  function intersects(first, second, gap) {
    return first.left < second.right + gap &&
      first.right + gap > second.left &&
      first.top < second.bottom + gap &&
      first.bottom + gap > second.top;
  }

  function findSafePosition(card) {
    const stage = floatingSky.getBoundingClientRect();
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const margin = floatingConfig.safeMargin;
    const minX = cardWidth / 2 + margin;
    const maxX = stage.width - cardWidth / 2 - margin;
    const minY = margin;
    const maxY = stage.height - cardHeight - margin - 28;
    if (maxX < minX || maxY < minY) {
      return null;
    }

    const obstacles = [];
    [message.parentElement, document.querySelector(".final-wish__controls")].forEach(function (element) {
      if (!element || element.hidden) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) {
        obstacles.push({
          left: rect.left - stage.left,
          top: rect.top - stage.top,
          right: rect.right - stage.left,
          bottom: rect.bottom - stage.top
        });
      }
    });
    activeCards.forEach(function (laneId, activeCard) {
      const rect = activeCard.getBoundingClientRect();
      obstacles.push({
        left: rect.left - stage.left,
        top: rect.top - stage.top,
        right: rect.right - stage.left,
        bottom: rect.bottom - stage.top
      });
    });

    const xStep = Math.max(cardWidth * 0.72, 72);
    const yStep = cardHeight + floatingConfig.cardGap;
    const xPositions = [minX];
    for (let x = minX + xStep; x < maxX; x += xStep) {
      xPositions.push(x);
    }
    if (maxX > minX) {
      xPositions.push(maxX);
    }
    const yPositions = [];
    for (let y = maxY; y >= minY; y -= yStep) {
      yPositions.push(y);
    }
    if (yPositions.length === 0 || yPositions[yPositions.length - 1] > minY) {
      yPositions.push(minY);
    }

    for (let row = 0; row < yPositions.length; row += 1) {
      for (let column = 0; column < xPositions.length; column += 1) {
        const x = xPositions[(column + row) % xPositions.length];
        const y = yPositions[row];
        const bounds = {
          left: x - cardWidth / 2,
          top: y,
          right: x + cardWidth / 2,
          bottom: y + cardHeight + 28
        };
        if (obstacles.every(function (obstacle) {
          return !intersects(bounds, obstacle, floatingConfig.cardGap / 2);
        })) {
          return { x: x, y: y };
        }
      }
    }
    return null;
  }

  function spawnWish(index) {
    const wishEntry = normalizedWishes[index];
    const card = document.createElement("p");
    const duration = wishEntry.duration;
    card.className = "final-wish__floating-wish";
    card.setAttribute("aria-hidden", "true");
    card.dataset.wishId = wishEntry.id;
    card.style.setProperty("--wish-duration", duration + "ms");
    card.textContent = wishEntry.message;

    floatingSky.appendChild(card);
    const position = findSafePosition(card);
    if (!position) {
      card.remove();
      return false;
    }
    card.style.left = position.x + "px";
    card.style.top = position.y + "px";
    card.addEventListener("animationend", function (event) {
      if (event.target === card &&
          event.animationName === "wish-text-drift") {
        removeFloatingCard(card);
      }
    });
    activeCards.set(card, true);
    maxObservedConcurrent = Math.max(maxObservedConcurrent, activeCards.size);
    card.classList.add("is-floating");
    updateFloatingStats();
    return true;
  }

  function spawnQueuedWish() {
    if (queuedCount === 0 || activeCards.size >= getMaxConcurrent()) {
      return false;
    }
    if (!spawnWish(queuedWishIndex)) {
      return false;
    }
    queuedCount -= 1;
    queuedWishIndex = queuedCount === 0
      ? null
      : (queuedWishIndex + 1) % normalizedWishes.length;
    updateFloatingStats();
    return true;
  }

  function removeFloatingCard(card) {
    if (!activeCards.has(card)) {
      return;
    }
    activeCards.delete(card);
    card.remove();
    updateFloatingStats();
    if (!active || !loopActive || document.hidden) {
      return;
    }
    if (queuedCount > 0 && activeCards.size < getMaxConcurrent()) {
      if (spawnQueuedWish()) {
        scheduleNextSpawn(floatingConfig.spawnInterval);
      }
    }
  }

  function queueWish(index) {
    if (queuedCount === 0) {
      queuedWishIndex = index;
    }
    queuedCount += 1;
    updateFloatingStats();
  }

  function requestNextWish() {
    if (!active || !loopActive || motionPreference.matches || document.hidden) {
      return;
    }
    const wishIndex = nextWishIndex;
    nextWishIndex = (nextWishIndex + 1) % normalizedWishes.length;
    if (queuedCount > 0 || activeCards.size >= getMaxConcurrent() || !spawnWish(wishIndex)) {
      queueWish(wishIndex);
    }
    scheduleNextSpawn(floatingConfig.spawnInterval);
  }

  function startWishLoop() {
    if (motionPreference.matches || normalizedWishes.length === 0) {
      return;
    }
    stopWishLoop();
    loopActive = true;
    nextWishIndex = 0;
    queuedCount = 0;
    maxObservedConcurrent = 0;
    updateFloatingStats();
    if (!document.hidden) {
      requestNextWish();
    }
  }

  function pauseWishLoop() {
    if (!loopActive || !spawnTimer) {
      return;
    }
    spawnDelayRemaining = Math.max(0, nextSpawnAt - Date.now());
    window.clearTimeout(spawnTimer);
    spawnTimer = 0;
  }

  function resumeWishLoop() {
    if (!loopActive || document.hidden) {
      return;
    }
    if (queuedCount > 0 && activeCards.size < getMaxConcurrent() && spawnQueuedWish()) {
      scheduleNextSpawn(floatingConfig.spawnInterval);
      return;
    }
    scheduleNextSpawn(spawnDelayRemaining || floatingConfig.spawnInterval);
  }

  function playTimeline() {
    clearVisualState();
    scene.classList.add("is-final-wish", "is-final-wish-started");
    finalStar.classList.add("is-final-star");

    if (motionPreference.matches) {
      scene.classList.add(
        "is-final-wish-awakening",
        "is-final-wish-gallery",
        "is-final-wish-revealed",
        "is-final-wish-eternal"
      );
      constellationStars.forEach(function (star) {
        star.classList.add("is-finally-awakened");
      });
      constellationLines.forEach(function (line) {
        line.classList.add("is-finally-awakened");
      });
      return;
    }

    schedule(revealConstellation, 1500);
    schedule(function () {
      scene.classList.add("is-final-wish-gallery");
      startWishLoop();
    }, 4500);
    schedule(function () {
      scene.classList.add("is-final-wish-revealed");
    }, 8500);
    schedule(function () {
      scene.classList.add("is-final-wish-eternal");
    }, 11000);
  }

  function startFinalWish() {
    const progress = window.StarlitMemories.memoryProgress;
    if (!progress || !progress.isComplete()) {
      return;
    }
    active = true;
    wish.hidden = false;
    scene.classList.remove("has-memory-open");
    playTimeline();
    replayButton.focus({ preventScroll: true });
  }

  document.addEventListener("starlit:final-wish-request", startFinalWish);

  replayButton.addEventListener("click", function () {
    if (active) {
      playTimeline();
    }
  });

  returnButton.addEventListener("click", function () {
    if (active) {
      returnToConstellation(true);
    }
  });

  document.addEventListener("visibilitychange", function () {
    scene.classList.toggle("is-page-hidden", document.hidden);
    if (document.hidden) {
      pauseWishLoop();
    } else {
      resumeWishLoop();
    }
  });

  motionPreference.addEventListener("change", function (event) {
    if (!active) {
      return;
    }
    if (event.matches) {
      stopWishLoop();
      scene.classList.add(
        "is-final-wish-awakening",
        "is-final-wish-gallery",
        "is-final-wish-revealed",
        "is-final-wish-eternal"
      );
      constellationStars.forEach(function (star) {
        star.classList.add("is-finally-awakened");
      });
      constellationLines.forEach(function (line) {
        line.classList.add("is-finally-awakened");
      });
    } else {
      playTimeline();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && active) {
      event.preventDefault();
      returnToConstellation(true);
    }
  });
})();
