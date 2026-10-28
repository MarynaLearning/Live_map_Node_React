import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useServices } from '@/hooks/use-services';
import type { IPoint } from '@/types/device';
import { calculateRenderDelay, easeRenderDelay } from '@/utils/render-delay';
import { ConnectionStatus } from '@/websocket';
import type { IDeviceView } from '@/features/live-map/types';
import { syncCanvasSize } from '@/features/live-map/utils/canvas-size';
import { buildDeviceViews } from '@/features/live-map/utils/device-view';
import { drawMap } from '@/features/live-map/utils/draw-map';
import { findDeviceAt } from '@/features/live-map/utils/hit-test';
import { computeViewport } from '@/features/live-map/utils/viewport';

const readCanvasPoint = (event: MouseEvent<HTMLCanvasElement>): IPoint => {
  const bounds = event.currentTarget.getBoundingClientRect();

  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
};

/**
 * @Description Draws the map on every animation frame straight from the store,
 * with a render delay that follows the subscribed maxHz;
 * tracks the device under the mouse (hover ring + pointer cursor) and maps clicks to devices
 * @param selectedDeviceId
 * @param onSelectDevice
 */
export const useMapRenderer = (selectedDeviceId: string, onSelectDevice: (deviceId: string) => void) => {
  const { frameLoop, deviceStore, wsClient, subscription } = useServices();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedDeviceIdRef = useRef(selectedDeviceId);
  const drawnViewsRef = useRef<IDeviceView[]>([]);
  const mousePointRef = useRef<IPoint | null>(null);
  const [isOverDevice, setOverDevice] = useState(false);

  useEffect(() => {
    selectedDeviceIdRef.current = selectedDeviceId;
  }, [selectedDeviceId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    let renderDelayMs = calculateRenderDelay(subscription.getSubscription().maxHz);
    let previousTimestamp: number | null = null;

    // Dots move under a still mouse too, so hover is re-checked every frame against the last drawn positions.
    const findHoveredDevice = (): string | null => {
      const mousePoint = mousePointRef.current;

      return mousePoint === null ? null : findDeviceAt(drawnViewsRef.current, mousePoint.x, mousePoint.y);
    };

    return frameLoop.subscribe((timestamp) => {
      const targetDelayMs = calculateRenderDelay(subscription.getSubscription().maxHz);

      renderDelayMs = easeRenderDelay(renderDelayMs, targetDelayMs, timestamp - (previousTimestamp ?? timestamp));
      previousTimestamp = timestamp;

      const hoveredDeviceId = findHoveredDevice();
      const size = syncCanvasSize(canvas, window.devicePixelRatio || 1);
      const viewport = computeViewport(size);
      const isConnectionOpen = wsClient.getConnectionState().status === ConnectionStatus.OPEN;
      const devices = buildDeviceViews({
        devices: deviceStore.getDevices(),
        now: timestamp,
        renderDelayMs,
        isConnectionOpen,
        viewport,
        selectedDeviceId: selectedDeviceIdRef.current,
        hoveredDeviceId,
      });

      drawnViewsRef.current = devices;
      drawMap(context, { size, viewport, devices, isConnectionOpen });
      setOverDevice(hoveredDeviceId !== null);
    });
  }, [frameLoop, deviceStore, wsClient, subscription]);

  const handleCanvasMouseMove = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    mousePointRef.current = readCanvasPoint(event);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    mousePointRef.current = null;
  }, []);

  const handleCanvasClick = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      const point = readCanvasPoint(event);
      const deviceId = findDeviceAt(drawnViewsRef.current, point.x, point.y);

      if (deviceId !== null) {
        onSelectDevice(deviceId);
      }
    },
    [onSelectDevice],
  );

  return { canvasRef, isOverDevice, handleCanvasClick, handleCanvasMouseMove, handleCanvasMouseLeave };
};
