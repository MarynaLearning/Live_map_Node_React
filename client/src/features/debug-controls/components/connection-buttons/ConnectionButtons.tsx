import { Button } from '@/components';
import { ButtonVariant } from '@/types/components';
import { DEBUG_TEXT } from '@/features/debug-controls/constants';
import { useConnectionControls } from '@/features/debug-controls/hooks/use-connection-controls';
import { RequestError } from '@/features/debug-controls/components/request-error/RequestError';
import styles from './ConnectionButtons.module.css';

export const ConnectionButtons = () => {
  const controls = useConnectionControls();

  return (
    <div className={styles.connectionButtons}>
      <Button variant={ButtonVariant.DANGER} disabled={controls.isBusy} onClick={controls.dropAllConnections}>
        {DEBUG_TEXT.DROP_ALL}
      </Button>
      <Button onClick={controls.toggleConnection}>{controls.connectionButtonLabel}</Button>
      <RequestError text={controls.errorText} />
    </div>
  );
};
