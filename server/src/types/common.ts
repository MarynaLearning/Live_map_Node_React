/** Returns a number in [0, 1), injected so randomness can be faked. */
export type TRandom = () => number;

/** Returns the current time in ms, injected so time can be faked. */
export type TNow = () => number;
