// Hero video loading strategy.
//
// The <video> element's <source> children are static in index.html — the
// browser's own media-query + codec-support selection picks the right
// mobile/desktop and av1/h264 variant, so there's no JS-driven source
// swapping (that used to race IntersectionObserver callbacks and get the
// in-flight request cancelled in WebKit). This file only decides WHETHER
// to trigger loading/playback at all, and reflects play state via the
// `.is-playing` class that css/styles.css uses for the poster fade.
(function () {
  var video = document.getElementById("heroVideo");
  if (!video) return;

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

  function play() {
    video.addEventListener(
      "playing",
      function () {
        video.classList.add("is-playing");
      },
      { once: true }
    );

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Autoplay was blocked (or another playback error occurred) —
        // leave the poster image showing, nothing more to do.
      });
    }
  }

  video.preload = "auto";

  var target = video.closest(".hero__video-wrap") || video.closest(".hero") || video;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            observer.disconnect();
            play();
            return;
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(target);
  } else {
    play();
  }
})();
