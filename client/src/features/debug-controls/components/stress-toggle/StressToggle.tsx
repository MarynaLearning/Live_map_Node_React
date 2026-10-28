import { Toggle } from '@/components';
import { DEBUG_TEXT } from '@/features/debug-controls/constants';
import { useStressMode } from '@/features/debug-controls/hooks/use-stress-mode';
import { RequestError } from '@/features/debug-controls/components/request-error/RequestError';
import styles from './StressToggle.module.css';

export const StressToggle = () => {
  const stress = useStressMode();

  return (
    <div className={styles.stressToggle}>
      <Toggle label={DEBUG_TEXT.STRESS} checked={stress.isStressMode} disabled={stress.isBusy} onChange={stress.toggleStressMode} />
      <RequestError text={stress.errorText} />
    </div>
  );
};
