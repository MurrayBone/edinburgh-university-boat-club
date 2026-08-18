// Interaction logic for the liquid-glass nav buttons (owned by the buttons subsystem).
//
// Tracks the pointer over each .glass-button and exposes its position as the
// --x/--y custom properties, which css/buttons.css consumes in a radial-gradient
// to produce a soft specular highlight that follows the cursor. Falls back
// gracefully (fixed highlight position, no listeners) on touch-only devices
// or browsers without PointerEvent support.
(function () {
  "use strict";

  if (typeof window === "undefined" || !("PointerEvent" in window)) {
    return;
  }

  var buttons = document.querySelectorAll(".glass-button");
  if (!buttons.length) {
    return;
  }

  buttons.forEach(function (button) {
    button.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") {
        return;
      }
      var rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      button.style.setProperty("--x", x + "%");
      button.style.setProperty("--y", y + "%");
    });

    button.addEventListener("pointerleave", function (event) {
      if (event.pointerType === "touch") {
        return;
      }
      button.style.removeProperty("--x");
      button.style.removeProperty("--y");
    });
  });
})();
