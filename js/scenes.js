/* Chuyển cảnh giữa lời mời và hộp quà; không điều khiển tương tác của hộp quà. */
(function () {
  "use strict";

  const invitation = document.querySelector(".invitation");
  const giftScene = document.querySelector("#gift-scene");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!invitation || !giftScene) {
    console.error("Không thể khởi tạo chuyển cảnh: thiếu thành phần giao diện bắt buộc.");
    return;
  }

  let transitionStarted = false;
  let transitionFinished = false;
  document.documentElement.dataset.sceneState = "invitation";

  function transitionToGift() {
    if (transitionStarted || !giftScene.hidden) {
      return;
    }

    transitionStarted = true;
    invitation.classList.add("is-leaving");

    const finishTransition = function () {
      if (transitionFinished) {
        return;
      }

      transitionFinished = true;
      invitation.hidden = true;
      giftScene.hidden = false;
      giftScene.classList.add("is-entering");
      document.documentElement.dataset.sceneState = "gift-ready";
      document.dispatchEvent(new CustomEvent("starlit:gift-ready"));

      window.requestAnimationFrame(function () {
        giftScene.classList.remove("is-entering");
      });
    };

    if (reducedMotion.matches) {
      finishTransition();
      return;
    }

    invitation.addEventListener("transitionend", function onFadeOut(event) {
      if (event.target === invitation && event.propertyName === "opacity") {
        invitation.removeEventListener("transitionend", onFadeOut);
        finishTransition();
      }
    });

    window.setTimeout(finishTransition, 600);
  }

  document.addEventListener("starlit:request-gift", transitionToGift);
})();
