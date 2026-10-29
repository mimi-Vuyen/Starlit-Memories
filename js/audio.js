/* Chuẩn bị giao diện quản lý âm thanh; Phase 01 không phát nhạc. */
(function () {
  "use strict";

  let audio = null;

  window.StarlitMemories = window.StarlitMemories || {};
  window.StarlitMemories.audio = {
    load: function (source) {
      if (typeof source !== "string" || source.trim() === "") {
        throw new TypeError("Đường dẫn âm thanh phải là một chuỗi không rỗng.");
      }

      audio = new Audio(source);
      audio.loop = true;
      audio.preload = "none";
      return audio;
    },
    play: function () {
      if (!audio) {
        return Promise.reject(new Error("Chưa tải nguồn âm thanh."));
      }
      return audio.play();
    },
    pause: function () {
      if (audio) {
        audio.pause();
      }
    },
    setVolume: function (volume) {
      if (!audio) {
        throw new Error("Chưa tải nguồn âm thanh.");
      }
      if (typeof volume !== "number" || Number.isNaN(volume)) {
        throw new TypeError("Âm lượng phải là một số.");
      }
      audio.volume = Math.min(1, Math.max(0, volume));
    }
  };
})();
