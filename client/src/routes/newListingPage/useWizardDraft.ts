import { useCallback } from 'react';
import type { WizardFormData, UploadedImage } from './wizardTypes';

const DRAFT_KEY = 'listing-wizard-draft';

export interface WizardDraft {
  formData: Partial<WizardFormData>;
  images: UploadedImage[];
  currentStep: number;
  savedAt: string;
}

export const useWizardDraft = () => {
  const saveDraft = useCallback(
    (
      formData: Partial<WizardFormData>,
      images: UploadedImage[],
      currentStep: number
    ) => {
      const draft: WizardDraft = {
        formData,
        // Only persist successfully uploaded images (have a real URL)
        images: images.filter((img) => img.status === 'success'),
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    },
    []
  );

  const loadDraft = useCallback((): WizardDraft | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as WizardDraft) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const hasDraft = useCallback((): boolean => {
    return !!localStorage.getItem(DRAFT_KEY);
  }, []);

  return { saveDraft, loadDraft, clearDraft, hasDraft };
};
