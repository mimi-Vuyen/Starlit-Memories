/* Điều phối trạng thái và tương tác của Scene 01. */
(function () {
  "use strict";

  const invitation = document.querySelector(".invitation");
  const startButton = document.querySelector("#start-button");
  const continueButton = document.querySelector("#continue-button");
  const message = document.querySelector("#invitation-message");
  const notice = document.querySelector("#next-chapter-notice");

  if (!invitation || !startButton || !continueButton || !message || !notice) {
    console.error("Không thể khởi tạo Scene 01: thiếu thành phần giao diện bắt buộc.");
    return;
  }

  const state = {
    scene: "invitation",
    invitationOpened: false
  };

  startButton.addEventListener("click", function () {
    if (state.invitationOpened) {
      return;
    }

    state.invitationOpened = true;
    invitation.classList.add("is-open");
    message.hidden = false;
    startButton.hidden = true;
    continueButton.hidden = false;
  });

  continueButton.addEventListener("click", function () {
    notice.hidden = false;
  });
})();
 