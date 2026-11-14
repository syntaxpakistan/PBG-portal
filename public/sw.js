// PBG Portal — web push service worker
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "PBG Portal", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "PBG Portal";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/push-icon.png",
      badge: "/push-icon.png",
      tag: data.tag || undefined,
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
