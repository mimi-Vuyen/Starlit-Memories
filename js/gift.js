/* Quản lý state machine và tương tác mở hộp quà của Phase 02. */
(function () {
  "use strict";

  const stage = document.querySelector("#gift-stage");
  const handle = document.querySelector("#ribbon-handle");
  const progress = document.querySelector("#pull-progress");
  const progressFill = progress && progress.querySelector(".pull-progress__fill");
  const title = document.querySelector("#gift-title");
  const instructions = document.querySelector("#ribbon-instructions");
  const openButton = document.querySelector("#gift-open-button");
  const message = document.querySelector("#gift-message");
  const enterButton = document.querySelector("#gift-enter-button");
  const requiredElements = [
    stage, handle, progress, progressFill, title, instructions, openButton, message, enterButton
  ];

  if (requiredElements.some(function (element) { return !element; })) {
    console.error("Không thể khởi tạo hộp quà: thiếu thành phần giao diện bắt buộc.");
    return;
  }

  const pullDistance = 122;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state = "invitation";
  let activePointerId = null;
  let startX = 0;
  let pullAmount = 0;
  let openingTimer = 0;

  function setState(nextState) {
    state = nextState;
    stage.dataset.state = state;
    document.documentElement.dataset.sceneState = state;
  }

  function setPullAmount(amount) {
    pullAmount = Math.max(0, Math.min(pullDistance, amount));
    const percentage = Math.round((pullAmount / pullDistance) * 100);
    stage.style.setProperty("--pull-progress", pullAmount + "px");
    progressFill.style.transform = "scaleX(" + percentage / 100 + ")";
    progress.setAttribute("aria-valuenow", String(percentage));
  }

  function openGift() {
    if (state === "gift-opened" || state === "ribbon-unwrapped") {
      return;
    }

    activePointerId = null;
    setPullAmount(pullDistance);
    setState("ribbon-unwrapped");
    stage.classList.add("is-unwrapped");
    handle.disabled = true;
    openButton.disabled = true;
    openButton.hidden = true;
    instructions.hidden = true;
    progress.hidden = true;

    openingTimer = window.setTimeout(function () {
      if (state !== "ribbon-unwrapped") {
        return;
      }
      setState("gift-opened");
      stage.classList.add("is-open");
      title.textContent = "Một món quà nhỏ dành riêng cho Tỷ";
      message.hidden = false;
      enterButton.hidden = false;
      enterButton.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 680);
  }

  handle.addEventListener("pointerdown", function (event) {
    if (state !== "gift-ready" || !event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    startX = event.clientX - pullAmount;
    handle.setPointerCapture(event.pointerId);
    setState("ribbon-dragging");
  });

  handle.addEventListener("pointermove", function (event) {
    if (state !== "ribbon-dragging" || event.pointerId !== activePointerId) {
      return;
    }

    setPullAmount(event.clientX - startX);
    if (pullAmount >= pullDistance) {
      openGift();
    }
  });

  function finishPull(event) {
    if (state !== "ribbon-dragging" || event.pointerId !== activePointerId) {
      return;
    }

    activePointerId = null;
    if (pullAmount >= pullDistance) {
      openGift();
      return;
    }

    setState("gift-ready");
    setPullAmount(0);
  }

  handle.addEventListener("pointerup", finishPull);
  handle.addEventListener("pointercancel", finishPull);
  handle.addEventListener("lostpointercapture", finishPull);

  openButton.addEventListener("click", function () {
    if (state === "gift-ready" || state === "ribbon-dragging") {
      openGift();
    }
  });

  enterButton.addEventListener("click", function () {
    if (state === "gift-opened") {
      document.dispatchEvent(new CustomEvent("starlit:request-constellation"));
    }
  });

  document.addEventListener("starlit:gift-ready", function () {
    if (state === "invitation") {
      setState("gift-ready");
    }
  });

  window.addEventListener("pagehide", function () {
    window.clearTimeout(openingTimer);
  });
})();
