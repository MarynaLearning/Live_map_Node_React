import { useContext } from 'react';
import { SERVICES_MISSING_ERROR, ServicesContext } from '@/context';
import type { IServices } from '@/types/services';

/**
 * @Description Returns the app services injected in index.tsx
 */
export const useServices = (): IServices => {
  const services = useContext(ServicesContext);

  if (services === null) {
    throw new Error(SERVICES_MISSING_ERROR);
  }

  return services;
};
