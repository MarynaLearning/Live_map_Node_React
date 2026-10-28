import { MessageType, type TDeviceMessage } from '@iot/shared';
import type { IResumePlan, IResumePlanInput } from '../types/history';
import { filterSnapshot } from './subscription';

/**
 * @Description Thins replayed states to at most maxHz (by device time); events are always kept, and so is the newest state
 * @param messages one device's missed messages, oldest first
 * @param maxHz null = keep everything
 */
export const thinReplayStates = (messages: TDeviceMessage[], maxHz: number | null): TDeviceMessage[] => {
  if (maxHz === null) {
    return messages;
  }

  const minGapMs = 1000 / maxHz;
  const lastStateIndex = messages.findLastIndex((message) => message.type === MessageType.STATE);
  let lastKeptStateTs = -Infinity;

  return messages.filter((message, index) => {
    if (message.type === MessageType.EVENT) {
      return true;
    }

    if (index === lastStateIndex || message.ts - lastKeptStateTs >= minGapMs) {
      lastKeptStateTs = message.ts;

      return true;
    }

    return false;
  });
};

/**
 * @Description Decides per subscribed device: replay the gap from history when it still reaches back to lastSeen, otherwise send a fresh snapshot entry
 * @param input
 */
export const buildResumePlan = ({ snapshot, lastSeen, history, subscription }: IResumePlanInput): IResumePlan => {
  const plan: IResumePlan = { snapshot: [], replay: [], replayedDeviceIds: [] };

  for (const entry of filterSnapshot(snapshot, subscription)) {
    const deviceId = entry.message.deviceId;
    const seen = lastSeen[deviceId];
    const missed = seen === undefined ? null : history.readSince(deviceId, seen);

    if (missed === null) {
      plan.snapshot.push(entry);
      continue;
    }

    plan.replayedDeviceIds.push(deviceId);
    plan.replay.push(...thinReplayStates(missed, subscription.maxHz));
  }

  return plan;
};
