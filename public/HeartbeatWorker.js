// public/HeartbeatWorker.js

self.addEventListener('beforeunload', () => {
  stopHeartbeat();
});

// 不要加 export{}，否则构建失败

