const CACHE_NAME = "akshaya-hms-v1";
const assets = [
    "/",
    "/index.html",
    "/manifest.json",
    "/photo.png",
    "/vite.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
