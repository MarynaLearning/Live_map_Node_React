import { useState } from 'react';
import { DEFAULT_SELECTED_DEVICE_ID } from '@/app/constants';

/**
 * @Description Which device the live sensor panel shows; shared by the map and the chart
 */
export const useDeviceSelection = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(DEFAULT_SELECTED_DEVICE_ID);

  return { selectedDeviceId, selectDevice:setSelectedDeviceId };
};
