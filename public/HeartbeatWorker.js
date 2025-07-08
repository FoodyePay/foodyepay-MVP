let heartbeatInterval;

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    console.log('💓 Heartbeat...');
  }, 10000);
}

function stopHeartbeat() {
  clearInterval(heartbeatInterval);
}

self.addEventListener('load', () => {
  startHeartbeat();
});

self.addEventListener('beforeunload', () => {
  stopHeartbeat();
});
