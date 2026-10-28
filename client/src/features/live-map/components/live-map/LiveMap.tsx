import { classNames } from '@/utils/class-names';
import { MAP_TEXT } from '@/features/live-map/constants';
import { useMapRenderer } from '@/features/live-map/hooks/use-map-renderer';
import type { ILiveMapProps } from '@/features/live-map/types';
import { MapLegend } from '@/features/live-map/components/map-legend/MapLegend';
import styles from './LiveMap.module.css';

export const LiveMap = ({ selectedDeviceId, onSelectDevice, children }: ILiveMapProps) => {
  const map = useMapRenderer(selectedDeviceId, onSelectDevice);

  return (
    <div className={styles.liveMap}>
      <canvas
        ref={map.canvasRef}
        className={classNames(styles.canvas, map.isOverDevice && styles.canvasOverDevice)}
        role="img"
        aria-label={MAP_TEXT.ARIA_LABEL}
        onClick={map.handleCanvasClick}
        onMouseMove={map.handleCanvasMouseMove}
        onMouseLeave={map.handleCanvasMouseLeave}
      />
      {children}
      <MapLegend />
    </div>
  );
};
