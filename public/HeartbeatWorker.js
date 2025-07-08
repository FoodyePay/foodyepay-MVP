// ✅ public/HeartbeatWorker.js
self.addEventListener('message', (event) => {
  const { type } = event.data;

  switch (type) {
    case 'start':
      self.postMessage({ type: 'started' });
      break;
    case 'stop':
      self.postMessage({ type: 'stopped' });
      break;
    default:
      self.postMessage({ type: 'heartbeat' });
  }
});
