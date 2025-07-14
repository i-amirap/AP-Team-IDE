const CACHE_NAME = "AP-Team-IDE-cache-v1.0";
const urlsToCache = [
  "/AP-Team-IDE/",
  "/AP-Team-IDE/index.html",
  "/AP-Team-IDE/amirap.html",
  "/AP-Team-IDE/feedback.html",
  "/AP-Team-IDE/check-connection.html",
  "/AP-Team-IDE/manifest.json",
  "/AP-Team-IDE/images/icon-192.png",
  "/AP-Team-IDE/images/icon-192-maskable.png",
  "/AP-Team-IDE/images/icon-512.png",
  "/AP-Team-IDE/images/icon-512-maskable.png",
  "/AP-Team-IDE/images/IDE-Mobile.png",
  "/AP-Team-IDE/images/IDE-Desktop.png",
  "/AP-Team-IDE/styles/style.css",
  "/AP-Team-IDE/js/app.js",
  "/AP-Team-IDE/sw.js",
  "/AP-Team-IDE/styles/fonts/vazir.woff2"
];

// نصب و کش کردن فایل‌ها
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// فعال‌سازی و حذف کش‌های قدیمی
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// مدیریت درخواست‌ها با fallback مناسب
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.headers.get("accept")?.includes("text/html")) {
            // هنگام آفلاین بودن و درخواست HTML، صفحه چک اتصال نشان داده شود
            return caches.match("/AP-Team-IDE/check-connection.html");
          }
          // fallback برای فایل‌های غیر HTML
          return new Response("آفلاین هستید و فایل در کش موجود نیست.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        })
      );
    })
  );
});

// ذخیره داده‌ها در زمان آفلاین بودن (Background Sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncUserData() {
  // فرض مثال: داده‌ها در IndexedDB ذخیره شدن
  const data = await getPendingDataFromIndexedDB();

  for (let item of data) {
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      await markAsSyncedInDB(item.id);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }
}
