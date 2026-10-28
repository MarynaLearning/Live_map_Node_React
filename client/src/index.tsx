import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DEBUG_PATH, DEFAULT_SUBSCRIPTION } from '@iot/shared';
import { App, ROOT_ELEMENT_ID, ROOT_MISSING_ERROR } from '@/app';
import { ServicesContext } from '@/context';
import { createDebugApi } from '@/features/debug-controls';
import { createFrameLoop } from '@/frame-loop';
import { createDeviceStore, createDiagnostics, createLiveSync } from '@/store';
import type { IServices } from '@/types/services';
import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  buildWsUrl,
  createBackoff,
  createConnectionRecovery,
  createHeartbeatWatchdog,
  createPageEnvironment,
  createSubscriptionService,
  createWsClient,
  WATCHDOG_CHECK_INTERVAL_MS,
  WATCHDOG_TIMEOUT_MS,
} from '@/websocket';
import './global.css';

// Composition root: every service is created once here and handed to React through context.
const now = () => performance.now();

const frameLoop = createFrameLoop({
  requestFrame: (callback) => window.requestAnimationFrame(callback),
  cancelFrame: (frameId) => window.cancelAnimationFrame(frameId),
});
const wsClient = createWsClient({
  url: buildWsUrl(window.location),
  createSocket: (url) => new WebSocket(url),
  backoff: createBackoff({ baseMs: BACKOFF_BASE_MS, maxMs: BACKOFF_MAX_MS, random: Math.random }),
  watchdog: createHeartbeatWatchdog({ timeoutMs: WATCHDOG_TIMEOUT_MS, checkIntervalMs: WATCHDOG_CHECK_INTERVAL_MS, now }),
  now,
});
const deviceStore = createDeviceStore();
const subscription = createSubscriptionService({
  wsClient,
  initialSubscription: DEFAULT_SUBSCRIPTION,
  readLastSeen: deviceStore.getLastSeen,
});
const diagnostics = createDiagnostics({ now });
const liveSync = createLiveSync({ wsClient, deviceStore, diagnostics, frameLoop, now });
const debugApi = createDebugApi({ baseUrl: DEBUG_PATH, fetchJson: (url, init) => window.fetch(url, init) });

const services: IServices = { wsClient, subscription, deviceStore, diagnostics, frameLoop, debugApi, now };

const connectionRecovery = createConnectionRecovery({
  wsClient,
  environment: createPageEnvironment(document, window),
});

subscription.start();
connectionRecovery.start();
liveSync.start();
frameLoop.start();
wsClient.connect();

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (rootElement === null) {
  throw new Error(ROOT_MISSING_ERROR);
}

createRoot(rootElement).render(
  <StrictMode>
    <ServicesContext.Provider value={services}>
      <App />
    </ServicesContext.Provider>
  </StrictMode>,
);
