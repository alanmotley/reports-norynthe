(function () {
  const GA4_MEASUREMENT_ID = "G-570981B382";
  const OWNER_MODE_KEY = "norynthe_pulse_owner_mode_v1";
  const OWNER_MODE_COOKIE = "norynthe_pulse_owner_mode";
  const OWNER_MODE_ENABLE_VALUES = ["1", "true", "yes", "on", "enable", "enabled"];
  const OWNER_MODE_DISABLE_VALUES = ["0", "false", "no", "off", "disable", "disabled"];
  const SITE_PREFIX = "Norynthe.Score";

  const ownerModeCommand = applyOwnerModeCommand();
  const ownerModeEnabled = isOwnerModeEnabled();
  window.NORYNTHE_PULSE_OWNER_MODE_COMMAND = Boolean(window.NORYNTHE_PULSE_OWNER_MODE_COMMAND || ownerModeCommand);
  window.NORYNTHE_PULSE_OWNER_MODE = Boolean(window.NORYNTHE_PULSE_OWNER_MODE || ownerModeEnabled);

  if (window.NORYNTHE_PULSE_OWNER_MODE || window.NORYNTHE_PULSE_OWNER_MODE_COMMAND) return;
  if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === "G-XXXXXXXXXX") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(tag);
  }

  const title = document.title.includes(SITE_PREFIX)
    ? document.title
    : `${SITE_PREFIX} | ${document.title}`;

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    page_title: title,
    page_path: window.location.pathname + window.location.search + window.location.hash
  });

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

    return document.cookie.split(";").some(function (part) {
      return part.trim() === OWNER_MODE_COOKIE + "=1";
    });
  }
})();
