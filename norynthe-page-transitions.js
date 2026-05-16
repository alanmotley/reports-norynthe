(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showPage = () => {
    window.requestAnimationFrame(() => {
      root.classList.remove("nt-transition-exiting");
      root.classList.add("nt-transition-ready");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showPage, { once: true });
  } else {
    showPage();
  }

  window.addEventListener("pageshow", showPage);

  if (reduceMotion) return;

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    if (link.target && link.target !== "_self") return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    const samePageHash = url.pathname === window.location.pathname && url.search === window.location.search && url.hash;
    if (url.origin !== window.location.origin || samePageHash) return;

    event.preventDefault();
    root.classList.remove("nt-transition-ready");
    root.classList.add("nt-transition-exiting");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 180);
  });
})();
