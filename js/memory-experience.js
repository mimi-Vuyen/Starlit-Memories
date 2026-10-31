/* Present Star 01-08 memories through the shared Polaroid and opening timeline. */
(function () {
  "use strict";

  const scene = document.querySelector("#constellation-scene");
  const panel = document.querySelector("#memory-polaroid");
  const closeButton = document.querySelector("#memory-close-button");
  const count = document.querySelector("#constellation-count");
  const nextMemoryButton = document.querySelector("#constellation-next-memory");
  const finalWishButton = document.querySelector("#constellation-final-wish");
  const lockStatus = document.querySelector("#constellation-lock-status");
  const memoryTitle = document.querySelector("#memory-title");
  const memoryMessage = document.querySelector("#memory-message");
  const memoryCaption = document.querySelector(".polaroid__caption");
  const memoryEyebrow = document.querySelector(".memory-polaroid__eyebrow");
  const memoryImage = document.querySelector("#memory-image");
  const edgeOrbitMotion = document.querySelector("#memory-edge-orbit-motion");
  const edgeTrailMotion = document.querySelector("#memory-edge-trail-motion");
  const dustMotions = Array.from(document.querySelectorAll('[id^="memory-dust-motion-"]'));
  const memories = window.StarlitMemories && window.StarlitMemories.memories;
  const fallbackImage = "assets/images/memory-sample.svg";

  if (!scene || !panel || !closeButton || !count || !nextMemoryButton || !finalWishButton ||
      !lockStatus || !memoryTitle || !memoryMessage || !memoryCaption || !memoryEyebrow || !memoryImage) {
    console.error("Không thể khởi tạo hành trình ký ức: thiếu thành phần giao diện bắt buộc.");
    return;
  }

  if (!Array.isArray(memories)) {
    console.error("Không thể khởi tạo ký ức: thiếu dữ liệu trong memories.js.");
    return;
  }

  const memoriesById = new Map(memories.map(function (memory) {
    return [memory.id, memory];
  }));
  const starsByMemoryId = new Map(
    Array.from(scene.querySelectorAll(".constellation-star[data-memory-id]")).map(function (star) {
      return [Number(star.getAttribute("data-memory-id")), star];
    })
  );
  for (let memoryId = 1; memoryId <= 9; memoryId += 1) {
    if (!starsByMemoryId.has(memoryId)) {
      console.error("Không thể khởi tạo ánh xạ sao: thiếu Star " + String(memoryId).padStart(2, "0") + ".");
      return;
    }
  }
  const requiredMemoryFields = ["image", "caption", "title", "message", "alt"];
  for (let memoryId = 1; memoryId <= 8; memoryId += 1) {
    const memory = memoriesById.get(memoryId);
    if (!memory || requiredMemoryFields.some(function (field) {
      return typeof memory[field] !== "string" || memory[field].trim() === "";
    })) {
      console.error("Không thể khởi tạo ký ức " + memoryId + ": dữ liệu chưa đầy đủ.");
      return;
    }
  }

  const openedMemoryIds = new Set();
  window.StarlitMemories.memoryProgress = {
    hasDiscovered: function (memoryId) {
      return openedMemoryIds.has(memoryId);
    },
    get discoveredCount() {
      return openedMemoryIds.size;
    },
    isComplete: function () {
      return openedMemoryIds.size === 8;
    }
  };
  let activeStar = null;
  let activeMemory = null;
  let closeTimer = 0;
  let isClosing = false;
  let closingStar = null;
  let restoreFocusAfterClose = false;
  let edgeMotionActive = false;
  let edgeTrailMotionActive = false;
  let lockFeedbackTimer = 0;
  const activeDustMotions = new Set();
  const openingTimers = new Set();
  const sparkleTimers = new Set();
  const activeSparkles = new Set();

  const sparkleDirections = [
    [-12, -9], [0, -16], [13, -10],
    [12, 12], [-5, 15], [-15, 5]
  ];

  memoryImage.addEventListener("error", function () {
    if (!activeMemory || memoryImage.getAttribute("src") !== activeMemory.image) {
      return;
    }
    if (activeMemory.image === fallbackImage) {
      console.error("Không thể tải ảnh ký ức hoặc ảnh dự phòng:", activeMemory.image);
      return;
    }
    console.warn("Không thể tải ảnh ký ức; dùng ảnh dự phòng cục bộ:", activeMemory.image);
    memoryImage.src = fallbackImage;
  });

  function renderMemory(memory) {
    activeMemory = memory;
    memoryCaption.textContent = memory.caption;
    memoryEyebrow.textContent = "KÝ ỨC " + String(memory.id).padStart(2, "0");
    memoryTitle.textContent = memory.title;
    memoryMessage.textContent = memory.message;
    memoryImage.alt = memory.alt;
    memoryImage.src = memory.image;
  }

  function updateMemoryCount() {
    count.textContent = openedMemoryIds.size + " / 9 ký ức đã khám phá";
    memoriesById.forEach(function (memory, memoryId) {
      const star = document.querySelector('[data-memory-id="' + memoryId + '"]');
      if (!star) {
        return;
      }
      const explored = openedMemoryIds.has(memoryId);
      star.classList.toggle("is-explored", explored);
      star.setAttribute(
        "aria-label",
        "Ngôi sao " + star.getAttribute("data-star-name") + ", ký ức " +
          String(memoryId).padStart(2, "0") + (explored ? ", đã khám phá" : ", chưa khám phá")
      );
    });
    updateFinalStarState();
    lockStatus.textContent = "";
  }

  function updateFinalStarState() {
    const finalStar = document.querySelector('[data-memory-id="9"]');
    const isUnlocked = openedMemoryIds.size === 8;
    nextMemoryButton.hidden = isUnlocked;
    finalWishButton.hidden = !isUnlocked;
    finalWishButton.classList.toggle("is-unlocked", isUnlocked);
    if (!finalStar) {
      console.error("Không thể cập nhật Star 09: không tìm thấy điểm sao tương tác.");
      return;
    }
    finalStar.setAttribute("aria-disabled", String(!isUnlocked));
    finalStar.setAttribute(
      "aria-label",
      isUnlocked
        ? "Ngôi sao Lesath, lời chúc sinh nhật cuối"
        : "Ngôi sao Lesath đang khóa. Hãy khám phá đủ 8 ký ức để mở lời chúc cuối."
    );
    finalStar.classList.toggle("is-unlocked", isUnlocked);
  }

  updateFinalStarState();

  nextMemoryButton.addEventListener("click", function () {
    const nextMemory = memories.find(function (memory) {
      return !openedMemoryIds.has(memory.id);
    });
    if (!nextMemory) {
      nextMemoryButton.hidden = true;
      return;
    }
    if (typeof window.StarlitMemories.selectMemoryStar !== "function") {
      console.error("Không thể mở ký ức tiếp theo: bộ điều khiển chòm sao chưa sẵn sàng.");
      return;
    }
    window.StarlitMemories.selectMemoryStar(nextMemory.id);
  });

  finalWishButton.addEventListener("click", function () {
    if (!window.StarlitMemories.memoryProgress.isComplete()) {
      updateFinalStarState();
      return;
    }
    if (typeof window.StarlitMemories.selectMemoryStar !== "function") {
      console.error("Không thể mở lời chúc cuối: bộ điều khiển chòm sao chưa sẵn sàng.");
      return;
    }
    window.StarlitMemories.selectMemoryStar(9);
  });

  function createStarSparkles(star) {
    const namespace = "http://www.w3.org/2000/svg";

    sparkleDirections.forEach(function (direction, index) {
      const sparkle = document.createElementNS(namespace, "circle");
      sparkle.setAttribute("class", "memory-star-sparkle");
      sparkle.setAttribute("cx", "0");
      sparkle.setAttribute("cy", "0");
      sparkle.setAttribute("r", index % 3 === 0 ? "2.1" : "1.5");
      sparkle.style.setProperty("--spark-x", direction[0] + "px");
      sparkle.style.setProperty("--spark-y", direction[1] + "px");
      star.appendChild(sparkle);

      activeSparkles.add(sparkle);
      const timer = window.setTimeout(function () {
        sparkleTimers.delete(timer);
        activeSparkles.delete(sparkle);
        sparkle.remove();
      }, 900);
      sparkleTimers.add(timer);
    });
  }

  function stopMotion(motion, isActive) {
    if (isActive && motion && typeof motion.endElement === "function") {
      motion.endElement();
    }
  }

  function cancelOpeningSequence() {
    openingTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    openingTimers.clear();

    sparkleTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    sparkleTimers.clear();

    activeSparkles.forEach(function (sparkle) {
      sparkle.remove();
    });
    activeSparkles.clear();

    stopMotion(edgeOrbitMotion, edgeMotionActive);
    stopMotion(edgeTrailMotion, edgeTrailMotionActive);
    activeDustMotions.forEach(function (motion) {
      stopMotion(motion, true);
    });
    activeDustMotions.clear();
    edgeMotionActive = false;
    edgeTrailMotionActive = false;
    panel.classList.remove(
      "is-opening",
      "is-visible",
      "is-edging",
      "is-stardusting",
      "is-story-visible",
      "is-floating"
    );
  }

  function scheduleOpeningStep(callback, delay) {
    const timer = window.setTimeout(function () {
      openingTimers.delete(timer);
      if (!panel.hidden && !isClosing) {
        callback();
      }
    }, delay);
    openingTimers.add(timer);
  }

  function beginMotion(motion) {
    if (motion && typeof motion.beginElement === "function") {
      motion.beginElement();
      return true;
    }
    return false;
  }

  function startOpeningSequence(star) {
    panel.classList.add("is-opening");
    createStarSparkles(star);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.classList.add("is-visible", "is-story-visible");
      return;
    }

    scheduleOpeningStep(function () {
      panel.classList.add("is-visible");
    }, 1200);

    scheduleOpeningStep(function () {
      panel.classList.add("is-story-visible");
    }, 2500);

    scheduleOpeningStep(function () {
      panel.classList.add("is-edging");
      edgeMotionActive = beginMotion(edgeOrbitMotion);
      edgeTrailMotionActive = beginMotion(edgeTrailMotion);
    }, 3200);

    scheduleOpeningStep(function () {
      stopMotion(edgeOrbitMotion, edgeMotionActive);
      stopMotion(edgeTrailMotion, edgeTrailMotionActive);
      edgeMotionActive = false;
      edgeTrailMotionActive = false;
      panel.classList.remove("is-edging");
      panel.classList.add("is-stardusting");
      dustMotions.forEach(function (motion) {
        if (beginMotion(motion)) {
          activeDustMotions.add(motion);
        }
      });
    }, 4800);

    scheduleOpeningStep(function () {
      activeDustMotions.forEach(function (motion) {
        stopMotion(motion, true);
      });
      activeDustMotions.clear();
      panel.classList.remove("is-stardusting");
      panel.classList.add("is-floating");
    }, 6000);
  }

  function finishClose() {
    closeTimer = 0;
    if (!isClosing) {
      return;
    }

    cancelOpeningSequence();
    isClosing = false;
    panel.hidden = true;
    panel.classList.remove("is-closing");
    updateFinalStarState();

    if (restoreFocusAfterClose && closingStar && closingStar.isConnected) {
      closingStar.focus({ preventScroll: true });
    }

    closingStar = null;
    restoreFocusAfterClose = false;
  }

  function closeMemory(restoreFocus) {
    if (panel.hidden) {
      return;
    }

    if (isClosing) {
      restoreFocusAfterClose = restoreFocusAfterClose && restoreFocus;
      return;
    }

    isClosing = true;
    closingStar = activeStar;
    restoreFocusAfterClose = restoreFocus && Boolean(closingStar);
    activeStar = null;
    cancelOpeningSequence();
    panel.classList.add("is-closing");
    scene.classList.remove("has-memory-open");

    if (closingStar && closingStar.isConnected) {
      closingStar.setAttribute("aria-pressed", "false");
      closingStar.classList.remove("is-selected");
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimer = window.setTimeout(finishClose, reducedMotion ? 0 : 560);
  }

  document.addEventListener("starlit:memory-star-select", function (event) {
    const detail = event.detail;
    const memoryId = Number(detail && detail.memoryId);
    const selectedStar = starsByMemoryId.get(memoryId);
    if (!selectedStar || Number(selectedStar.dataset.starId) !== Number(detail.starId)) {
      console.error("Bỏ qua sự kiện chọn sao có ánh xạ không hợp lệ:", detail);
      return;
    }

    if (!detail.selected) {
      if (activeStar === selectedStar) {
        closeMemory(false);
      }
      return;
    }

    if (memoryId === 9) {
      closeMemory(false);
      if (!window.StarlitMemories.memoryProgress.isComplete()) {
        selectedStar.setAttribute("aria-pressed", "false");
        selectedStar.classList.remove("is-selected");
        selectedStar.classList.add("is-locked-feedback");
        lockStatus.textContent = "Khám phá đủ 8 ký ức để mở lời chúc cuối.";
        if (lockFeedbackTimer) {
          window.clearTimeout(lockFeedbackTimer);
        }
        lockFeedbackTimer = window.setTimeout(function () {
          selectedStar.classList.remove("is-locked-feedback");
          lockStatus.textContent = "";
          lockFeedbackTimer = 0;
        }, 1400);
        return;
      }

      document.dispatchEvent(new CustomEvent("starlit:final-wish-request", {
        detail: { starId: detail.starId }
      }));
      return;
    }

    const memory = memoriesById.get(memoryId);
    if (!memory) {
      closeMemory(false);
      return;
    }

    if (activeStar && activeStar !== selectedStar) {
      activeStar.setAttribute("aria-pressed", "false");
      activeStar.classList.remove("is-selected");
    }
    cancelOpeningSequence();
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }
    isClosing = false;
    closingStar = null;
    restoreFocusAfterClose = false;
    activeStar = selectedStar;
    renderMemory(memory);
    panel.hidden = false;
    panel.classList.remove("is-closing");
    scene.classList.add("has-memory-open");
    startOpeningSequence(selectedStar);

    if (!openedMemoryIds.has(memory.id)) {
      openedMemoryIds.add(memory.id);
      updateMemoryCount();
    }

    closeButton.focus({ preventScroll: true });
  });

  closeButton.addEventListener("click", function () {
    closeMemory(true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (!panel.hidden && !isClosing) {
        event.preventDefault();
        closeMemory(true);
      }
    }
  });
})();
