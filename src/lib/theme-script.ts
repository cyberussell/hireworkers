// Applies the persisted/system theme to <html> before hydration so there's
// no flash of the wrong theme. Rendered via next/script's beforeInteractive
// strategy in app/layout.tsx rather than a raw <script> in the render tree,
// since a component-rendered <script> is inert on the client and React 19
// warns about it.
export const THEME_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark" ? stored : "system";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    var root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  } catch (e) {}
})();`;
