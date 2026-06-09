(() => {
  const CLARITY_PROJECT_ID = "x3hvdxofa4";
  const OWNER_MODE_KEY = "norynthe_pulse_owner_mode_v1";
  const OWNER_MODE_COOKIE = "norynthe_pulse_owner_mode";
  const OWNER_MODE_ENABLE_VALUES = ["1", "true", "yes", "on", "enable", "enabled"];
  const OWNER_MODE_DISABLE_VALUES = ["0", "false", "no", "off", "disable", "disabled"];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ownerModeCommand = applyOwnerModeCommand();
  const ownerModeEnabled = isOwnerModeEnabled();
  window.NORYNTHE_PULSE_OWNER_MODE_COMMAND = Boolean(window.NORYNTHE_PULSE_OWNER_MODE_COMMAND || ownerModeCommand);
  window.NORYNTHE_PULSE_OWNER_MODE = Boolean(window.NORYNTHE_PULSE_OWNER_MODE || ownerModeEnabled);

  function applyOwnerModeCommand() {
    const params = new URLSearchParams(window.location.search);
    const value = String(params.get("pulse_owner") || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!OWNER_MODE_ENABLE_VALUES.includes(value) && !OWNER_MODE_DISABLE_VALUES.includes(value)) return false;

    const enabled = OWNER_MODE_ENABLE_VALUES.includes(value);
    try {
      if (enabled) {
        window.localStorage.setItem(OWNER_MODE_KEY, "1");
      } else {
        window.localStorage.removeItem(OWNER_MODE_KEY);
      }
    } catch (error) {}

    const parts = [
      OWNER_MODE_COOKIE + "=" + (enabled ? "1" : ""),
      "path=/",
      "max-age=" + (enabled ? 60 * 60 * 24 * 400 : 0),
      "SameSite=Lax"
    ];
    const host = window.location.hostname.replace(/^www\./, "");
    if (host.endsWith("norynthe.com")) parts.push("domain=.norynthe.com");
    if (host.endsWith("alanmotley.com")) parts.push("domain=.alanmotley.com");
    if (window.location.protocol === "https:") parts.push("Secure");
    document.cookie = parts.join("; ");

    try {
      params.delete("pulse_owner");
      const nextQuery = params.toString();
      window.history.replaceState(null, document.title, window.location.pathname + (nextQuery ? "?" + nextQuery : "") + window.location.hash);
    } catch (error) {}

    return true;
  }

  function isOwnerModeEnabled() {
    try {
      if (window.localStorage.getItem(OWNER_MODE_KEY) === "1") return true;
    } catch (error) {}

    return document.cookie.split(";").some((part) => part.trim() === OWNER_MODE_COOKIE + "=1");
  }

  const loadClarity = () => {
    if (ownerModeEnabled || ownerModeCommand) return;
    if (window.clarity || document.querySelector('script[data-clarity-project="' + CLARITY_PROJECT_ID + '"]')) return;

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    const clarity = document.createElement("script");
    clarity.async = true;
    clarity.src = "https://www.clarity.ms/tag/" + CLARITY_PROJECT_ID;
    clarity.dataset.clarityProject = CLARITY_PROJECT_ID;
    document.head.appendChild(clarity);
  };

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

  loadClarity();
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
