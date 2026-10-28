import { createContext } from 'react';
import type { IServices } from '@/types/services';

export const ServicesContext = createContext<IServices | null>(null);
