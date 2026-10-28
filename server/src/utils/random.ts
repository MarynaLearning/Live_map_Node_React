import type { TRandom } from '../types/common';

/**
 * @Description Returns a random number in [min, max)
 * @param random
 * @param min
 * @param max
 */
export const randomBetween = (random: TRandom, min: number, max: number): number => min + random() * (max - min);

/**
 * @Description Returns true with the given probability (0..1)
 * @param random
 * @param probability
 */
export const rollChance = (random: TRandom, probability: number): boolean => random() < probability;
