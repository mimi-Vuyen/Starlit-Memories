/* Điều phối hai bản nhạc nền và các chuyển tiếp giữa các phase. */
(function () {
  "use strict";

  const musicButton = document.querySelector("#music-toggle");
  const volume = 0.35;
  const fadeInterval = 50;
  const storageKey = "starlit-memories-muted";
  const tracks = {
    miette: null,
    firstLight: null
  };
  let muted = false;
  let started = false;
  let mix = { miette: 0, firstLight: 0 };
  let transition = null;
  let transitionTimer = 0;
  let initializationError = null;

  window.StarlitMemories = window.StarlitMemories || {};

  try {
    muted = window.sessionStorage.getItem(storageKey) === "true";
  } catch (error) {
    console.warn("Không thể đọc tùy chọn âm thanh trong phiên hiện tại.", error);
  }

  function updateButton() {
    if (!musicButton) {
      return;
    }
    musicButton.setAttribute("aria-pressed", String(muted));
    musicButton.setAttribute("aria-label", muted ? "Bật nhạc nền" : "Tắt nhạc nền");
    musicButton.title = muted ? "Bật nhạc nền" : "Tắt nhạc nền";
    const icon = musicButton.querySelector(".music-toggle__icon");
    if (icon) {
      icon.textContent = muted ? "♪" : "♫";
    }
  }

  function applyVolumes() {
    Object.keys(tracks).forEach(function (name) {
      if (tracks[name]) {
        tracks[name].volume = muted ? 0 : volume * mix[name];
      }
    });
  }

  function initializeTracks() {
    if (initializationError) {
      console.warn("Không thể khởi tạo nhạc nền; tiếp tục không có nhạc.", initializationError);
      return false;
    }
    if (tracks.miette && tracks.firstLight) {
      return true;
    }
    try {
      const miette = new Audio("assets/audio/miette.mp3");
      const firstLight = new Audio("assets/audio/first-light.mp3");
      tracks.miette = miette;
      tracks.firstLight = firstLight;
      Object.keys(tracks).forEach(function (name) {
        const track = tracks[name];
        track.loop = true;
        track.preload = "none";
        track.volume = 0;
        track.addEventListener("error", function () {
          console.warn("Không thể tải bản nhạc:", track.currentSrc || track.src);
        });
      });
      return true;
    } catch (error) {
      initializationError = error;
      console.error("Không thể khởi tạo nhạc nền.", error);
      return false;
    }
  }

  function playTrack(name) {
    const track = tracks[name];
    if (!track || !track.paused) {
      return;
    }
    try {
      const result = track.play();
      if (result && typeof result.catch === "function") {
        result.catch(function (error) {
          console.warn("Trình duyệt không cho phép phát nhạc nền.", error);
        });
      }
    } catch (error) {
      console.warn("Không thể bắt đầu phát nhạc nền.", error);
    }
  }

  function stopTransition() {
    if (transitionTimer) {
      window.clearInterval(transitionTimer);
      transitionTimer = 0;
    }
    transition = null;
  }

  function transitionTo(name, duration) {
    if (!started || !initializeTracks()) {
      return;
    }
    stopTransition();
    playTrack(name);
    const target = { miette: 0, firstLight: 0 };
    target[name] = 1;
    transition = {
      from: { miette: mix.miette, firstLight: mix.firstLight },
      to: target,
      startedAt: Date.now(),
      duration: duration
    };

    function updateTransition() {
      if (!transition) {
        return;
      }
      const progress = Math.min(1, (Date.now() - transition.startedAt) / transition.duration);
      Object.keys(mix).forEach(function (trackName) {
        mix[trackName] = transition.from[trackName] +
          (transition.to[trackName] - transition.from[trackName]) * progress;
      });
      applyVolumes();
      if (progress === 1) {
        const finishedTarget = name;
        stopTransition();
        Object.keys(tracks).forEach(function (trackName) {
          if (trackName !== finishedTarget) {
            tracks[trackName].pause();
          }
        });
      }
    }

    updateTransition();
    if (transition) {
      transitionTimer = window.setInterval(updateTransition, fadeInterval);
    }
  }

  function startMiette() {
    if (started || !initializeTracks()) {
      return;
    }
    started = true;
    transitionTo("miette", 2000);
  }

  function setMuted(nextMuted) {
    muted = nextMuted;
    try {
      window.sessionStorage.setItem(storageKey, String(muted));
    } catch (error) {
      console.warn("Không thể lưu tùy chọn âm thanh trong phiên hiện tại.", error);
    }
    applyVolumes();
    updateButton();
    if (started) {
      Object.keys(mix).forEach(function (name) {
        if (mix[name] > 0) {
          playTrack(name);
        }
      });
    }
  }

  if (musicButton) {
    musicButton.addEventListener("click", function () {
      setMuted(!muted);
    });
  } else {
    console.error("Không thể khởi tạo điều khiển âm thanh: thiếu nút bật/tắt nhạc.");
  }
  updateButton();

  document.addEventListener("starlit:gift-opened", startMiette);
  document.addEventListener("starlit:final-wish-request", function () {
    transitionTo("firstLight", 3000);
  });
  document.addEventListener("starlit:final-wish-close", function () {
    transitionTo("miette", 3000);
  });

  window.addEventListener("pagehide", function () {
    stopTransition();
    Object.keys(tracks).forEach(function (name) {
      if (tracks[name]) {
        tracks[name].pause();
      }
    });
  });

  window.StarlitMemories.audio = {
    start: startMiette,
    transitionTo: transitionTo,
    setMuted: setMuted,
    getState: function () {
      return {
        started: started,
        muted: muted,
        mietteVolume: mix.miette,
        firstLightVolume: mix.firstLight,
        transitioning: Boolean(transition)
      };
    }
  };
})();
