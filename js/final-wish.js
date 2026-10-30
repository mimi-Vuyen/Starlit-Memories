/* Orchestrate Star 09 and its looping, data-driven memory sky. */
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
  const floatingCard = document.querySelector("#final-wish-memory");
  const staticWishes = document.querySelector("#final-wish-static-wishes");
  const floatingSky = document.querySelector(".final-wish__sky");
  const memories = window.StarlitMemories && window.StarlitMemories.memories;
  const content = window.StarlitMemories && window.StarlitMemories.finalWish;
  const fallbackImage = "assets/images/memory-sample.svg";
  const floatingConfig = {
    spawnInterval: 1000,
    defaultDuration: 14000,
    minDuration: 12000,
    maxDuration: 16000,
    desktopMaxConcurrent: 6,
    mobileMaxConcurrent: 3,
    mobileBreakpoint: 760,
    desktopLanes: [
      { id: "desktop-left-low", x: "10%", bottom: "1%", offset: "-12px" },
      { id: "desktop-left-high", x: "25%", bottom: "15%", offset: "10px" },
      { id: "desktop-center-left", x: "42%", bottom: "3%", offset: "-8px" },
      { id: "desktop-center-right", x: "58%", bottom: "14%", offset: "9px" },
      { id: "desktop-right-high", x: "75%", bottom: "2%", offset: "-10px" },
      { id: "desktop-right-low", x: "90%", bottom: "16%", offset: "12px" }
    ],
    mobileLanes: [
      { id: "mobile-left", x: "17%", bottom: "2%", offset: "-5px" },
      { id: "mobile-center", x: "50%", bottom: "7%", offset: "4px" },
      { id: "mobile-right", x: "83%", bottom: "3%", offset: "-4px" }
    ]
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
      !message || !signature || !floatingCard ||
      !staticWishes || !floatingSky || !Array.isArray(memories) || !content) {
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
  const memoriesByImage = new Map(memories.map(function (memory) {
    return [memory.image, memory];
  }));

  content.wishes.forEach(function (entry, index) {
    if (!entry || (typeof entry.id !== "string" && typeof entry.id !== "number") ||
        String(entry.id).trim() === "" || wishIds.has(String(entry.id))) {
      console.warn("Bỏ qua lời chúc có ID thiếu hoặc trùng lặp tại vị trí " + (index + 1) + ".");
      return;
    }
    if (typeof entry.message !== "string" || entry.message.trim() === "") {
      console.warn("Bỏ qua lời chúc không có nội dung:", entry.id);
      return;
    }

    wishIds.add(String(entry.id));
    const memoryFallback = memories[index % Math.max(1, memories.length)];
    let image = typeof entry.image === "string" && entry.image.trim()
      ? entry.image.trim()
      : memoryFallback && memoryFallback.image;
    if (!image) {
      image = fallbackImage;
    }

    let duration = floatingConfig.defaultDuration;
    if (entry.duration !== undefined) {
      if (Number.isFinite(entry.duration) &&
          entry.duration >= floatingConfig.minDuration &&
          entry.duration <= floatingConfig.maxDuration) {
        duration = entry.duration;
      } else {
        console.warn("Thời lượng lời chúc không hợp lệ; dùng thời lượng mặc định:", entry.id);
      }
    }

    const imageMemory = memoriesByImage.get(image);
    const imageAlt = memoryFallback && memoryFallback.image === image
      ? memoryFallback.alt
      : imageMemory && imageMemory.alt;
    normalizedWishes.push({
      id: String(entry.id),
      image: image,
      fallbackImage: memoryFallback ? memoryFallback.image : fallbackImage,
      alt: imageAlt || "Ảnh minh họa cho một lời chúc sinh nhật",
      message: entry.message.trim(),
      duration: duration
    });
  });

  if (normalizedWishes.length === 0) {
    console.warn("Danh sách lời chúc trống hoặc không hợp lệ; dùng nội dung thay thế an toàn.");
    normalizedWishes.push({
      id: "wish-placeholder",
      image: fallbackImage,
      fallbackImage: fallbackImage,
      alt: "Ảnh minh họa cho một lời chúc sinh nhật",
      message: "Lời chúc sẽ được bổ sung sau.",
      duration: 12000
    });
  }

  title.textContent = content.title;
  subtitle.textContent = content.subtitle || "";
  subtitle.hidden = !content.subtitle;
  message.textContent = content.message;
  signature.textContent = content.signature;

  function setImageSource(image, wishEntry, allowMemoryFallback) {
    image.alt = wishEntry.alt;
    image.onerror = function () {
      image.onerror = null;
      const currentSource = image.getAttribute("src");
      const nextSource = allowMemoryFallback && wishEntry.fallbackImage !== currentSource
        ? wishEntry.fallbackImage
        : fallbackImage;
      if (currentSource === fallbackImage || nextSource === currentSource) {
        console.error("Không thể tải ảnh lời chúc hoặc ảnh dự phòng:", currentSource);
        return;
      }
      console.warn("Không thể tải ảnh lời chúc; dùng ảnh dự phòng cục bộ:", currentSource);
      image.src = nextSource;
    };
    image.src = wishEntry.image;
  }

  function createStaticWish(wishEntry, index) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const wishMessage = document.createElement("figcaption");
    figure.className = "final-wish__static-item";
    figure.style.setProperty("--static-index", String(index));
    setImageSource(image, wishEntry, true);
    wishMessage.textContent = wishEntry.message;
    figure.append(image, wishMessage);
    return figure;
  }

  normalizedWishes.forEach(function (wishEntry, index) {
    staticWishes.appendChild(createStaticWish(wishEntry, index));
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
    activeCards.forEach(function (laneId, card) {
      card.remove();
      activeCards.delete(card);
    });
    floatingCard.classList.remove("is-floating");
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

  function getLanes() {
    return window.innerWidth <= floatingConfig.mobileBreakpoint
      ? floatingConfig.mobileLanes
      : floatingConfig.desktopLanes;
  }

  function getMaxConcurrent() {
    const mobile = window.innerWidth <= floatingConfig.mobileBreakpoint;
    const configuredLimit = mobile
      ? floatingConfig.mobileMaxConcurrent
      : floatingConfig.desktopMaxConcurrent;
    return Math.max(1, Math.min(configuredLimit, getLanes().length));
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

  function chooseLane() {
    const occupied = new Set(activeCards.values());
    return getLanes().find(function (lane) {
      return !occupied.has(lane.id);
    }) || null;
  }

  function spawnWish(index, lane) {
    const wishEntry = normalizedWishes[index];
    const card = floatingCard.cloneNode(true);
    const image = card.querySelector("img");
    const wishText = card.querySelector("p");
    const particleLayer = card.querySelector(".final-wish__particles");
    const duration = wishEntry.duration;
    card.removeAttribute("id");
    card.setAttribute("aria-label", "Ký ức và lời chúc: " + wishEntry.message);
    card.dataset.wishId = wishEntry.id;
    card.style.setProperty("--wish-duration", duration + "ms");
    card.style.setProperty("--wish-dissolve-delay", Math.round(duration * 0.78) + "ms");
    card.style.setProperty("--wish-lane-x", lane.x);
    card.style.setProperty("--wish-lane-bottom", lane.bottom);
    card.style.setProperty("--wish-path-offset", lane.offset);
    image.removeAttribute("id");
    wishText.removeAttribute("id");
    setImageSource(image, wishEntry, true);
    wishText.textContent = wishEntry.message;
    particleLayer.setAttribute("aria-hidden", "true");

    card.addEventListener("animationend", function (event) {
      if (event.target === card &&
          (event.animationName === "wish-memory-drift" ||
            event.animationName === "wish-memory-drift-mobile")) {
        removeFloatingCard(card);
      }
    });
    activeCards.set(card, lane.id);
    maxObservedConcurrent = Math.max(maxObservedConcurrent, activeCards.size);
    floatingSky.appendChild(card);
    card.classList.add("is-floating");
    updateFloatingStats();
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
    if (queuedWishIndex !== null && activeCards.size < getMaxConcurrent()) {
      const queuedIndex = queuedWishIndex;
      queuedWishIndex = null;
      spawnWish(queuedIndex, chooseLane());
      scheduleNextSpawn(floatingConfig.spawnInterval);
    }
  }

  function requestNextWish() {
    if (!active || !loopActive || motionPreference.matches || document.hidden) {
      return;
    }
    const lane = activeCards.size < getMaxConcurrent() ? chooseLane() : null;
    if (!lane) {
      if (queuedWishIndex === null) {
        queuedWishIndex = nextWishIndex;
        nextWishIndex = (nextWishIndex + 1) % normalizedWishes.length;
        queuedCount += 1;
        updateFloatingStats();
      }
      return;
    }

    const wishIndex = nextWishIndex;
    nextWishIndex = (nextWishIndex + 1) % normalizedWishes.length;
    spawnWish(wishIndex, lane);
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
    if (queuedWishIndex !== null && activeCards.size < getMaxConcurrent()) {
      const queuedIndex = queuedWishIndex;
      queuedWishIndex = null;
      spawnWish(queuedIndex, chooseLane());
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
