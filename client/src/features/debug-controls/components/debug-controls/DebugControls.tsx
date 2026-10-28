import { Panel } from '@/components';
import { DEBUG_TEXT } from '@/features/debug-controls/constants';
import { ConnectionButtons } from '@/features/debug-controls/components/connection-buttons/ConnectionButtons';
import { HzSlider } from '@/features/debug-controls/components/hz-slider/HzSlider';
import { StressToggle } from '@/features/debug-controls/components/stress-toggle/StressToggle';

export const DebugControls = () => (
  <Panel title={DEBUG_TEXT.TITLE}>
    <ConnectionButtons />
    <StressToggle />
    <HzSlider />
  </Panel>
);
