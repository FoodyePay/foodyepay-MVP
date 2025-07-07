// Minimal PWA Service Worker
self.addEventListener("install", (event) => {
  console.log("FoodyePay Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("FoodyePay Service Worker activating.");
});

self.addEventListener("fetch", (event) => {
  // You can cache resources here if needed
});
