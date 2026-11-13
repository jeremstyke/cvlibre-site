/* 14 nov 2026 (Jeremy): Jobs CVLibre alerts. Shows the morning notification with the new jobs, opens the search on tap. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("push", function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || "Jobs CVLibre", { body: d.body || "", icon: "/assets/app-192.png", badge: "/assets/app-192.png", tag: d.tag || "cvl-alert", data: { url: d.url || self.registration.scope } }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var u = new URL((e.notification.data && e.notification.data.url) || self.registration.scope, self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) { var c = l[i]; if (c.url.indexOf(self.registration.scope) === 0 && "focus" in c) { if (c.navigate) c.navigate(u); return c.focus(); } }
    return self.clients.openWindow(u);
  }));
});
