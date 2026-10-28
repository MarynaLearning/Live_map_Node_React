import type { TRandom } from '../types/common';
import type { IMovement, IVector } from '../types/simulator';
import { randomBetween } from './random';

/**
 * @Description Creates a velocity with the given speed pointing in a random direction
 * @param random
 * @param speed
 */
export const createRandomVelocity = (random: TRandom, speed: number): IVector => {
  const angle = randomBetween(random, 0, Math.PI * 2);

  return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
};

/**
 * @Description Rotates a velocity by a small random angle so the device wanders instead of moving straight
 * @param velocity
 * @param random
 * @param maxTurnRadians largest allowed turn for this step
 */
export const steerVelocity = (velocity: IVector, random: TRandom, maxTurnRadians: number): IVector => {
  const turn = randomBetween(random, -maxTurnRadians, maxTurnRadians);
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);

  return { x: velocity.x * cos - velocity.y * sin, y: velocity.x * sin + velocity.y * cos };
};

const bounceAxis = (position: number, velocity: number, size: number): [number, number] => {
  if (position < 0) {
    return [-position, Math.abs(velocity)];
  }

  if (position > size) {
    return [2 * size - position, -Math.abs(velocity)];
  }

  return [position, velocity];
};

/**
 * @Description Moves a point by its velocity and bounces it off the walls of a square world
 * @param movement current position and velocity
 * @param elapsedSeconds
 * @param size world side length
 */
export const moveWithinBounds = ({ position, velocity }: IMovement, elapsedSeconds: number, size: number): IMovement => {
  const [x, velocityX] = bounceAxis(position.x + velocity.x * elapsedSeconds, velocity.x, size);
  const [y, velocityY] = bounceAxis(position.y + velocity.y * elapsedSeconds, velocity.y, size);

  return { position: { x, y }, velocity: { x: velocityX, y: velocityY } };
};
