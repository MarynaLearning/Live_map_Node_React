/** Per-device history kept for resume: whichever limit is hit first. ~30 s in normal mode, ~3 s in stress. */
export const HISTORY_MAX_MESSAGES_PER_DEVICE = 300;

/** Older messages are dropped even if the count limit is not reached. */
export const HISTORY_MAX_AGE_MS = 10_000;
