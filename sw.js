const CACHE_NAME = "AP-Team-IDE-cache-v1.0";
const urlsToCache = [
  "/",
  "/index.html",
  "/amirap.html",
  "/feedback.html",
  "/check-connection.html",
  "/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/images/IDE-Mobile.png",
  "/images/IDE-Desktop.png",
  "/styles/style.css",
  "/js/app.js",
  "/sw.js",
  "/styles/fonts/vazir.woff2"
  // آدرس CDN حذف شد
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
            return caches.match("/check-connection.html");
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
