import {
  ClientMessageType,
  HEARTBEAT_INTERVAL_MS,
  MessageType,
  type IHelloMessage,
  type TClientMessage,
  type TDeviceMessage,
  type TLastSeen,
  type TUnsubscribe,
} from '@iot/shared';
import type { INormalizedSubscription, ISession, ISessionDeps, ISessionStats } from '../types/session';
import { buildResumePlan } from '../utils/resume-plan';
import { filterSnapshot, isDeviceSubscribed, normalizeSubscription } from '../utils/subscription';
import { buildHeartbeatMessage, buildResumeMessage, buildSnapshotMessage } from '../views/messages';

/**
 * @Description Streams to one client. Waits for hello (subscription + lastSeen), answers with resume (replay or snapshot per device), then live messages: states throttled, events never. Heartbeat every second
 * @param deps
 */
export const createSession = ({
  socket,
  gateway,
  history,
  outbox,
  stateThrottle,
  initialSubscription,
  helloTimeoutMs,
  now,
}: ISessionDeps): ISession => {
  let subscription: INormalizedSubscription = normalizeSubscription(initialSubscription);
  let stopLiveStream: TUnsubscribe | null = null;
  let isDisposed = false;

  const sendSnapshot = () => {
    outbox.sendControl(buildSnapshotMessage(filterSnapshot(gateway.getSnapshot(), subscription)));
  };

  const sendResume = (lastSeen: TLastSeen) => {
    const plan = buildResumePlan({ snapshot: gateway.getSnapshot(), lastSeen, history, subscription });

    outbox.sendControl(buildResumeMessage(plan));
  };

  const routeDeviceMessage = (message: TDeviceMessage) => {
    if (!isDeviceSubscribed(subscription, message.deviceId)) {
      return;
    }

    if (message.type === MessageType.EVENT) {
      outbox.sendEvent(message);

      return;
    }

    stateThrottle.offer(message);
  };

  const applySubscription = (nextSubscription: INormalizedSubscription) => {
    subscription = nextSubscription;
    stateThrottle.setMaxHz(subscription.maxHz);
    stateThrottle.keepOnly((deviceId) => isDeviceSubscribed(subscription, deviceId));
  };

  // Resume (or snapshot) and the live subscription start in one synchronous step, so no message falls in between.
  const startLiveStream = (sendInitialState: () => void) => {
    if (stopLiveStream !== null || isDisposed) {
      return;
    }

    sendInitialState();
    stopLiveStream = gateway.subscribe(routeDeviceMessage);
  };

  const helloTimer = setTimeout(() => {
    startLiveStream(sendSnapshot);
  }, helloTimeoutMs);

  const handleHello = (message: IHelloMessage) => {
    clearTimeout(helloTimer);
    applySubscription(normalizeSubscription(message.subscription));

    if (stopLiveStream === null) {
      startLiveStream(() => sendResume(message.lastSeen));

      return;
    }

    sendSnapshot();
  };

  const handleClientMessage = (message: TClientMessage) => {
    if (message.type === ClientMessageType.HELLO) {
      handleHello(message);

      return;
    }

    applySubscription(normalizeSubscription(message));

    if (stopLiveStream !== null) {
      sendSnapshot();
    }
  };

  const getStats = (sessionId: string): ISessionStats => ({
    sessionId,
    maxHz: subscription.maxHz,
    subscribedDevices: subscription.deviceFilter === null ? null : Object.keys(subscription.deviceFilter).length,
    ...outbox.getStats(),
    coalescedStates: stateThrottle.getCoalescedCount(),
  });

  const heartbeatTimer = setInterval(() => {
    outbox.sendControl(buildHeartbeatMessage(now()));
  }, HEARTBEAT_INTERVAL_MS);

  const dispose = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    clearTimeout(helloTimer);
    clearInterval(heartbeatTimer);
    stopLiveStream?.();
    stateThrottle.dispose();
  };

  const close = (code: number, reason: string) => {
    dispose();
    socket.close(code, reason);
  };

  return { handleClientMessage, getStats, dispose, close };
};
