// Hero video loading strategy (owned by the video-loading subsystem).
//
// Behaviour:
//  - Picks a mobile or desktop source tier based on viewport width.
//  - Skips loading the video entirely on slow/metered connections, or for
//    users who prefer reduced motion — the poster image stays as the final
//    state in those cases, no broken/blank UI.
//  - Only starts loading once the hero is near the viewport
//    (IntersectionObserver), so the same markup stays safe to reuse
//    elsewhere on a page.
//  - Fades the video in via the existing `.is-playing` CSS class once
//    playback actually starts; the poster <img> stays underneath the whole
//    time so there's never a blank/black flash.
(function () {
  var video = document.getElementById("heroVideo");
  if (!video) return;

  var MOBILE_BREAKPOINT = "(max-width: 760px)";

  var SOURCES = {
    mobile: [
      { src: "assets/video/mobile-av1.webm", type: 'video/webm; codecs="av01.0.05M.08"' },
      { src: "assets/video/mobile-h264.mp4", type: "video/mp4" },
    ],
    desktop: [
      { src: "assets/video/desktop-av1.webm", type: 'video/webm; codecs="av01.0.08M.08"' },
      { src: "assets/video/desktop-h264.mp4", type: "video/mp4" },
    ],
  };

  // --- Bail-out conditions: leave the poster image as the final state ---

  var reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  var connection =
    navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if (connection) {
    var slowTypes = ["slow-2g", "2g", "3g"];
    if (connection.saveData || slowTypes.indexOf(connection.effectiveType) !== -1) {
      return;
    }
  }

  // --- Pick a tier based on viewport width ---

  var isMobile =
    window.matchMedia && window.matchMedia(MOBILE_BREAKPOINT).matches;
  var tier = isMobile ? SOURCES.mobile : SOURCES.desktop;

  function loadAndPlay() {
    tier.forEach(function (variant) {
      var sourceEl = document.createElement("source");
      sourceEl.src = variant.src;
      sourceEl.type = variant.type;
      video.appendChild(sourceEl);
    });

    video.addEventListener(
      "playing",
      function () {
        video.classList.add("is-playing");
      },
      { once: true }
    );

    video.preload = "auto";
    video.load();

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Autoplay was blocked (or another playback error occurred) —
        // leave the poster image showing, nothing more to do.
      });
    }
  }

  // --- Only start loading once the hero is in/near the viewport ---

  var target = video.closest(".hero__video-wrap") || video.closest(".hero") || video;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            observer.disconnect();
            loadAndPlay();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(target);
  } else {
    // No IntersectionObserver support — just load, the hero is usually
    // the first thing in the viewport anyway.
    loadAndPlay();
  }
})();
