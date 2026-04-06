import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import WizardStepper from './components/WizardStepper';
import WizardNav from './components/WizardNav';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Details from './steps/Step2Details';
import Step3Location from './steps/Step3Location';
import Step4Photos from './steps/Step4Photos';
import Step5Preview from './steps/Step5Preview';

import { useWizardDraft } from './useWizardDraft';
import type { WizardFormData, UploadedImage } from './wizardTypes';
import { STEP_FIELDS } from './wizardTypes';
import { apiClient } from '../../lib/apiClient';

import styles from './NewListingPage.module.scss';

// ── Zod schema ────────────────────────────────────────────────────────────────
const wizardSchema = z.object({
  title: z.string().min(5, 'Tytuł musi mieć min. 5 znaków'),
  listingType: z.enum(['rent', 'buy']),
  propertyType: z.enum(['apartment', 'house', 'condo', 'land']),
  price: z.number({ invalid_type_error: 'Podaj cenę' }).positive('Cena musi być dodatnia'),
  description: z
    .string()
    .min(20, 'Opis musi mieć min. 20 znaków'),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  area: z.number({ invalid_type_error: 'Podaj powierzchnię' }).positive('Powierzchnia musi być dodatnia'),
  floor: z.number().int().optional(),
  amenities: z.array(z.enum(['parking', 'balkon', 'klimatyzacja', 'piwnica'])).default([]),
  address: z.string().min(3, 'Podaj adres'),
  city: z.string().min(2, 'Podaj miasto'),
  country: z.string().default('Polska'),
  latitude: z.number({ invalid_type_error: 'Geokodowanie wymagane' }).optional(),
  longitude: z.number({ invalid_type_error: 'Geokodowanie wymagane' }).optional(),
});

// ── Step validation schemas (subsets) ────────────────────────────────────────
const stepSchemas: Record<number, z.ZodTypeAny> = {
  0: wizardSchema.pick({ title: true, listingType: true, propertyType: true, price: true, description: true }),
  1: wizardSchema.pick({ bedrooms: true, bathrooms: true, area: true }),
  2: z.object({
    address: z.string().min(3, 'Podaj adres'),
    city: z.string().min(2, 'Podaj miasto'),
    country: z.string().default('Polska'),
    latitude: z
      .number({ invalid_type_error: 'Geokodowanie wymagane' })
      .refine((v) => v !== undefined, 'Adres musi zostać zweryfikowany na mapie'),
    longitude: z
      .number({ invalid_type_error: 'Geokodowanie wymagane' })
      .refine((v) => v !== undefined, 'Adres musi zostać zweryfikowany na mapie'),
  }),
};

const TOTAL_STEPS = 5;

const stepVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ── Component ─────────────────────────────────────────────────────────────────
const NewListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useWizardDraft();

  const [currentStep, setCurrentStep] = useState(0);
  const [highestVisited, setHighestVisited] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [photosError, setPhotosError] = useState<string | undefined>();
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      listingType: 'rent',
      propertyType: 'apartment',
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      country: 'Polska',
    },
  });

  // ── Draft restore ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasDraft()) setShowDraftModal(true);
  }, [hasDraft]);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (!draft) return;
    methods.reset({ ...methods.getValues(), ...draft.formData });
    setImages(draft.images);
    setCurrentStep(draft.currentStep);
    setHighestVisited(draft.currentStep);
    setShowDraftModal(false);
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftModal(false);
  };

  // ── Navigation blocker ───────────────────────────────────────────────────────
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // ── Step navigation ───────────────────────────────────────────────────────────
  const goToStep = (step: number) => {
    if (step <= highestVisited) {
      saveDraft(methods.getValues(), images, currentStep);
      setCurrentStep(step);
    }
  };

  const handleNext = async () => {
    // Validate current step fields
    const stepFields = STEP_FIELDS[currentStep];

    if (stepFields && stepFields.length > 0) {
      const valid = await methods.trigger(stepFields as (keyof WizardFormData)[]);
      if (!valid) return;
    }

    // Step 2: extra validation via step schema
    if (currentStep in stepSchemas) {
      const values = methods.getValues();
      const result = stepSchemas[currentStep].safeParse(values);
      if (!result.success) {
        const issues = result.error.issues;
        issues.forEach((issue) => {
          const field = issue.path[0] as keyof WizardFormData;
          methods.setError(field, { message: issue.message });
        });
        return;
      }
    }

    // Step 3 (index 2): require geocoding
    if (currentStep === 2) {
      const lat = methods.getValues('latitude');
      const lng = methods.getValues('longitude');
      if (!lat || !lng) {
        methods.setError('address', {
          message: 'Wpisz adres i poczekaj na weryfikację lokalizacji',
        });
        return;
      }
    }

    // Step 4 (photos): require at least 1 successful upload
    if (currentStep === 3) {
      const successImages = images.filter((img) => img.status === 'success');
      if (successImages.length === 0) {
        setPhotosError('Dodaj co najmniej 1 zdjęcie przed przejściem dalej');
        return;
      }
      setPhotosError(undefined);
    }

    const nextStep = currentStep + 1;
    saveDraft(methods.getValues(), images, nextStep);
    setIsDirty(true);
    setCurrentStep(nextStep);
    setHighestVisited((prev) => Math.max(prev, nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    saveDraft(methods.getValues(), images, currentStep - 1);
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Publish ───────────────────────────────────────────────────────────────────
  const handlePublish = async (): Promise<string | null> => {
    const valid = await methods.trigger();
    if (!valid) return null;

    const values = methods.getValues();
    const successImages = images.filter((img) => img.status === 'success');

    try {
      const response = await apiClient.post<{ data: { id: string } }>(
        '/api/listings',
        {
          ...values,
          images: successImages.map((img) => ({ url: img.url, order: img.order })),
        }
      );

      const newId = response.data.data.id;
      clearDraft();
      setIsDirty(false);

      // Redirect after countdown (Step5Preview handles countdown UI)
      setTimeout(() => navigate(`/listings/${newId}`), 2500);

      return newId;
    } catch {
      return null;
    }
  };

  // ── Render steps ──────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1BasicInfo />;
      case 1: return <Step2Details />;
      case 2: return <Step3Location />;
      case 3: return <Step4Photos images={images} onChange={setImages} error={photosError} />;
      case 4: return (
        <Step5Preview
          images={images}
          onGoToStep={goToStep}
          onPublish={handlePublish}
        />
      );
      default: return null;
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        {/* Draft restore modal */}
        {showDraftModal && (
          <div className={styles.modalOverlay} role="dialog" aria-modal>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Masz niezapisany szkic</h2>
              <p className={styles.modalText}>
                Znaleźliśmy poprzednio rozpoczęte ogłoszenie. Czy chcesz kontynuować?
              </p>
              <div className={styles.modalActions}>
                <button className={styles.modalSecondary} onClick={discardDraft}>
                  Zacznij od nowa
                </button>
                <button className={styles.modalPrimary} onClick={restoreDraft}>
                  Kontynuuj szkic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation blocker modal */}
        {blocker.state === 'blocked' && (
          <div className={styles.modalOverlay} role="dialog" aria-modal>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Niezapisane zmiany</h2>
              <p className={styles.modalText}>
                Masz niezapisane zmiany w formularzu. Co chcesz zrobić?
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalSecondary}
                  onClick={() => {
                    clearDraft();
                    blocker.proceed();
                  }}
                >
                  Wyjdź bez zapisywania
                </button>
                <button
                  className={styles.modalGhost}
                  onClick={() => blocker.reset()}
                >
                  Zostań
                </button>
                <button
                  className={styles.modalPrimary}
                  onClick={() => {
                    saveDraft(methods.getValues(), images, currentStep);
                    blocker.proceed();
                  }}
                >
                  Zapisz szkic i wyjdź
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stepper */}
        <WizardStepper
          currentStep={currentStep}
          highestVisitedStep={highestVisited}
          onStepClick={goToStep}
          onExit={() => navigate('/profile/listings')}
        />

        {/* Step content with animation */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav — hidden on step 4 (preview has its own publish btn) */}
        {!isLastStep && (
          <WizardNav
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default NewListingPage;
