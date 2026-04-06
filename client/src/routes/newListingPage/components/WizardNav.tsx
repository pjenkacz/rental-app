import React from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import styles from './WizardNav.module.scss';

interface WizardNavProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
}

const WizardNav: React.FC<WizardNavProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className={styles.nav}>
      <div className={styles.inner}>
        {!isFirstStep ? (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} />
            Wróć
          </button>
        ) : (
          <div />
        )}

        {!isLastStep && (
          <button
            type="button"
            className={styles.nextBtn}
            onClick={onNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Ładowanie...
              </>
            ) : (
              <>
                Dalej
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardNav;
