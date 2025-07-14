const CACHE_NAME = "AP Team-IDE-cache-v1.0";
const urlsToCache = [
  "/",
  "/index.html",
  "/amirap.html",
  "/feedback.html",
  "/check-connection.html",
  "/pwa/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/styles/style.css",
  "/js/app.js",
  "/pwa/sw.js",
  "/styles/fonts/vazir.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.1/ace.js"
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

// مدیریت درخواست‌ها
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // اگر درخواست HTML بود و اینترنت قطع بود، به صفحه check-connection.html هدایت کن
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./check-connection.html");
          }
        })
      );
    })
  );
});
