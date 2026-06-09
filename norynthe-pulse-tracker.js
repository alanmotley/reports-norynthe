(function () {
  const ENDPOINT = "https://norynthe-pulse-tracker.alanmotley.workers.dev/track";
  const HOST_SITE = {
    "www.norynthe.com": "norynthe",
    "norynthe.com": "norynthe",
    "investors.norynthe.com": "investor",
    "reports.norynthe.com": "reports",
    "www.alanmotley.com": "alanmotley",
    "alanmotley.com": "alanmotley"
  };

  const currentScript = document.currentScript;
  const site = currentScript?.dataset?.pulseSite || HOST_SITE[window.location.hostname] || "unknown";

  function send(payload) {
    const body = JSON.stringify(Object.assign({
      site,
      page: window.location.pathname + window.location.search,
      title: document.title,
      referrer: document.referrer
    }, payload));

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      return;
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body,
      keepalive: true
    }).catch(function () {});
  }

  send();

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const isPdf = /\.pdf(?:[?#].*)?$/i.test(href) || link.hasAttribute("download");
    if (!isPdf) return;

    let page = href;
    try {
      page = new URL(href, window.location.href).pathname;
    } catch (error) {
      page = href;
    }

    send({
      page,
      title: "Download: " + ((link.textContent || "PDF").replace(/\s+/g, " ").trim() || "PDF"),
      referrer: window.location.href
    });
  }, { capture: true });
}());
