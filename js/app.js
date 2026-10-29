/* Điều phối trạng thái và tương tác của Scene 01. */
(function () {
  "use strict";

  const invitation = document.querySelector(".invitation");
  const startButton = document.querySelector("#start-button");
  const continueButton = document.querySelector("#continue-button");
  const message = document.querySelector("#invitation-message");

  if (!invitation || !startButton || !continueButton || !message) {
    console.error("Không thể khởi tạo Scene 01: thiếu thành phần giao diện bắt buộc.");
    return;
  }

  let invitationOpened = false;

  startButton.addEventListener("click", function () {
    if (invitationOpened) {
      return;
    }

    invitationOpened = true;
    invitation.classList.add("is-open");
    message.hidden = false;
    startButton.hidden = true;
    continueButton.hidden = false;
  });

  continueButton.addEventListener("click", function () {
    if (invitationOpened) {
      document.dispatchEvent(new CustomEvent("starlit:request-gift"));
    }
  });
})();
 