import React from 'react';
import { Check } from 'lucide-react';
import { STEP_LABELS } from '../wizardTypes';
import styles from './WizardStepper.module.scss';

interface WizardStepperProps {
  currentStep: number;
  highestVisitedStep: number;
  onStepClick: (step: number) => void;
}

const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  highestVisitedStep,
  onStepClick,
}) => {
  return (
    <nav className={styles.stepper} aria-label="Kroki formularza">
      {STEP_LABELS.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = index <= highestVisitedStep && index !== currentStep;

        return (
          <React.Fragment key={index}>
            <div
              className={[
                styles.step,
                isActive ? styles.active : '',
                isCompleted ? styles.completed : '',
                isClickable ? styles.clickable : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => isClickable && onStepClick(index)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  onStepClick(index);
                }
              }}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Krok ${index + 1}: ${label}`}
            >
              <div className={styles.circle}>
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={styles.label}>{label}</span>
            </div>

            {index < STEP_LABELS.length - 1 && (
              <div
                className={[
                  styles.connector,
                  index < currentStep ? styles.connectorDone : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default WizardStepper;
