// Fake HeartbeatWorker to prevent Vercel build failure
// This file is only used as a placeholder and will be removed in production

self.addEventListener("message", (event) => {
  if (event.data === "ping") {
    self.postMessage("pong");
  }
});
