/**
 * @Description Reads a numeric env variable, falling back when it is missing or not a number
 * @param env
 * @param key
 * @param fallback
 */
export const readNumberEnv = (env: NodeJS.ProcessEnv, key: string, fallback: number): number => {
  const raw = env[key];

  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }

  const value = Number(raw);

  return Number.isFinite(value) ? value : fallback;
};

/**
 * @Description Reads a boolean env variable ("true" / "1" are true), falling back when it is missing
 * @param env
 * @param key
 * @param fallback
 */
export const readBooleanEnv = (env: NodeJS.ProcessEnv, key: string, fallback: boolean): boolean => {
  const raw = env[key];

  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }

  return raw === 'true' || raw === '1';
};
