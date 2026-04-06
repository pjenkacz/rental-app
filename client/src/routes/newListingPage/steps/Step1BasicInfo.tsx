import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Home, Building2, Landmark, Trees } from 'lucide-react';
import FormField from '../components/FormField';
import type { WizardFormData, ListingType, PropertyType } from '../wizardTypes';
import styles from './Steps.module.scss';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'rent', label: 'Wynajem' },
  { value: 'buy', label: 'Sprzedaż' },
];

const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'apartment', label: 'Mieszkanie', icon: <Building2 size={24} strokeWidth={1.5} /> },
  { value: 'house', label: 'Dom', icon: <Home size={24} strokeWidth={1.5} /> },
  { value: 'condo', label: 'Apartament', icon: <Landmark size={24} strokeWidth={1.5} /> },
  { value: 'land', label: 'Działka', icon: <Trees size={24} strokeWidth={1.5} /> },
];

const Step1BasicInfo: React.FC = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WizardFormData>();

  const listingType = watch('listingType');
  const propertyType = watch('propertyType');

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Podstawowe informacje</h1>
        <p className={styles.stepSubtitle}>
          Powiedz nam czego dotyczy Twoje ogłoszenie
        </p>
      </div>

      <div className={styles.fields}>
        {/* Listing type toggle */}
        <div className={styles.fieldGroup}>
          <span className={styles.groupLabel}>Rodzaj oferty</span>
          <div className={styles.pillToggle}>
            {LISTING_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={[
                  styles.pillBtn,
                  listingType === type.value ? styles.pillActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setValue('listingType', type.value, { shouldValidate: true })}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property type cards */}
        <div className={styles.fieldGroup}>
          <span className={styles.groupLabel}>Typ nieruchomości</span>
          {errors.propertyType && (
            <p className={styles.groupError} role="alert">
              ⚠ Wybierz typ nieruchomości
            </p>
          )}
          <div className={styles.propertyGrid}>
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                className={[
                  styles.propertyCard,
                  propertyType === pt.value ? styles.propertyCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() =>
                  setValue('propertyType', pt.value, { shouldValidate: true })
                }
              >
                <span className={styles.propertyIcon}>{pt.icon}</span>
                <span className={styles.propertyLabel}>{pt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <FormField
          label="Tytuł ogłoszenia"
          htmlFor="title"
          error={errors.title?.message}
        >
          <input
            id="title"
            type="text"
            placeholder="np. Przytulne mieszkanie w centrum Warszawy"
            {...register('title')}
          />
        </FormField>

        {/* Price */}
        <FormField
          label="Cena (USD)"
          htmlFor="price"
          error={errors.price?.message}
        >
          <input
            id="price"
            type="number"
            min={0}
            placeholder="np. 2500"
            {...register('price', { valueAsNumber: true })}
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Opis"
          htmlFor="description"
          error={errors.description?.message}
          hint="Opisz nieruchomość — lokalizację, stan, zalety. Min. 20 znaków."
        >
          <textarea
            id="description"
            placeholder="Opisz swoją nieruchomość..."
            rows={4}
            {...register('description')}
          />
        </FormField>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
