/**
 * @Description Shortens a device id for the map, e.g. device-3 → D3
 * @param deviceId
 */
export const formatDeviceLabel = (deviceId: string): string => {
  const number = deviceId.match(/\d+$/)?.[0];

  return number === undefined ? deviceId : `D${number}`;
};
