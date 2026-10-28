import { createServer } from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { DEBUG_PATH, DEFAULT_SUBSCRIPTION, HELLO_TIMEOUT_MS, WS_PATH } from '@iot/shared';
import { readServerConfig } from './config/env';
import { HISTORY_MAX_AGE_MS, HISTORY_MAX_MESSAGES_PER_DEVICE } from './constants/history';
import { SHUTDOWN_CLOSE_CODE, SHUTDOWN_CLOSE_REASON } from './constants/server';
import {
  MAX_QUEUED_EVENTS,
  OUTBOX_HIGH_WATER_BYTES,
  PING_INTERVAL_MS,
  SLOW_CONSUMER_CLOSE_CODE,
  SLOW_CONSUMER_CLOSE_REASON,
  UNLIMITED_FLUSH_INTERVAL_MS,
} from './constants/session';
import { TEXT } from './constants/text';
import { createDebugController } from './controllers/debug';
import { handleNotFound, handleServerError } from './controllers/error';
import { createWsController } from './controllers/ws';
import { createDeviceFleet } from './models/device';
import { createDebugRouter } from './routes/debug';
import { createChaosLayer } from './services/chaos';
import { createConnectionRegistry } from './services/connections';
import { createDeviceHistory } from './services/device-history';
import { createGateway } from './services/gateway';
import { createLivenessMonitor } from './services/liveness';
import { createOutbox } from './services/outbox';
import { createSession } from './services/session';
import { createSimulator } from './services/simulator';
import { createStateThrottle } from './services/state-throttle';
import type { TNow, TRandom } from './types/common';
import type { ILivenessSocket } from './types/liveness';
import type { ISessionSocket } from './types/session';

// Composition root: every instance is created here and passed down explicitly.
const config = readServerConfig(process.env);
const random: TRandom = Math.random;
const now: TNow = Date.now;

const devices = createDeviceFleet({ count: config.deviceCount, random, now });
const simulator = createSimulator({ devices, random, now, stress: config.stress });
const chaos = createChaosLayer({ settings: config.chaos, random });
const gateway = createGateway({ source: chaos, now });
const history = createDeviceHistory({
  maxMessagesPerDevice: HISTORY_MAX_MESSAGES_PER_DEVICE,
  maxAgeMs: HISTORY_MAX_AGE_MS,
  now,
});
const connections = createConnectionRegistry();

simulator.subscribe(chaos.send);
chaos.subscribe(history.record);

// One outbox + throttle per client: memory per client is bounded by them.
const openSession = (socket: ISessionSocket) => {
  const outbox = createOutbox({
    socket,
    highWaterBytes: OUTBOX_HIGH_WATER_BYTES,
    maxQueuedEvents: MAX_QUEUED_EVENTS,
    onOverflow: () => {
      socket.close(SLOW_CONSUMER_CLOSE_CODE, SLOW_CONSUMER_CLOSE_REASON);
    },
  });
  const stateThrottle = createStateThrottle({
    flushStates: outbox.sendStates,
    unlimitedFlushIntervalMs: UNLIMITED_FLUSH_INTERVAL_MS,
  });

  return createSession({
    socket,
    gateway,
    history,
    outbox,
    stateThrottle,
    initialSubscription: DEFAULT_SUBSCRIPTION,
    helloTimeoutMs: HELLO_TIMEOUT_MS,
    now,
  });
};

const watchLiveness = (socket: ILivenessSocket) => createLivenessMonitor({ socket, intervalMs: PING_INTERVAL_MS });

const wsController = createWsController({ connections, openSession, watchLiveness });
const debugController = createDebugController({ simulator, chaos, connections, deviceCount: config.deviceCount });

const app = express();

app.use(express.json());
app.use(DEBUG_PATH, createDebugRouter(debugController));
app.use(handleNotFound);
app.use(handleServerError);

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: WS_PATH });

wsServer.on('connection', wsController.handleConnection);

const shutdown = () => {
  simulator.stop();
  connections.dropAll(SHUTDOWN_CLOSE_CODE, SHUTDOWN_CLOSE_REASON);
  wsServer.close();
  httpServer.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

httpServer.listen(config.port, () => {
  simulator.start();
  console.log(`${TEXT.LISTENING} http://localhost:${config.port} (devices: ${config.deviceCount}, stress: ${config.stress})`);
});
