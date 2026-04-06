import React from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './NumberStepper.module.scss';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 20,
}) => {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.btn}
        onClick={decrement}
        disabled={value <= min}
        aria-label="Zmniejsz"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.btn}
        onClick={increment}
        disabled={value >= max}
        aria-label="Zwiększ"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default NumberStepper;
