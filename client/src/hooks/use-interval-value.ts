import { useEffect, useRef, useState } from 'react';

/**
 * @Description Re-reads a value at a fixed rate, so fast-changing data reaches React at a few Hz instead of the message rate
 * @param readValue
 * @param intervalMs
 * @param resetKey
 */
export const useIntervalValue = <TValue>(readValue: () => TValue, intervalMs: number, resetKey: string = ''): TValue => {
  const readValueRef = useRef(readValue);
  const [value, setValue] = useState<TValue>(readValue);

  useEffect(() => {
    readValueRef.current = readValue;
  });

  useEffect(() => {
    const refreshValue = () => {
      setValue(() => readValueRef.current());
    };

    refreshValue();

    const timer = setInterval(refreshValue, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [intervalMs, resetKey]);

  return value;
};
