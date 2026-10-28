import { ConnectionBadge, ConnectionBanner } from '@/features/connection-status';
import { DebugControls } from '@/features/debug-controls';
import { DevicePanel } from '@/features/device-panel';
import { DiagnosticsOverlay } from '@/features/diagnostics-overlay';
import { LiveMap } from '@/features/live-map';
import styles from './App.module.css';
import { APP_TITLE } from './constants';
import { useDeviceSelection } from './hooks/use-device-selection';

export const App = () => {
  const { selectedDeviceId, selectDevice } = useDeviceSelection();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>{APP_TITLE}</h1>
        <ConnectionBadge />
      </header>
      <main className={styles.layout}>
        <section className={styles.mapArea}>
          <LiveMap selectedDeviceId={selectedDeviceId} onSelectDevice={selectDevice}>
            <ConnectionBanner />
            <DiagnosticsOverlay />
          </LiveMap>
        </section>
        <aside className={styles.sidebar}>
          <DevicePanel deviceId={selectedDeviceId} />
          <DebugControls />
        </aside>
      </main>
    </div>
  );
};
