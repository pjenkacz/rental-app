import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import FormField from '../components/FormField';
import NumberStepper from '../components/NumberStepper';
import AmenityChip from '../components/AmenityChip';
import type { WizardFormData, Amenity } from '../wizardTypes';
import styles from './Steps.module.scss';

const AMENITIES: Amenity[] = ['parking', 'balkon', 'klimatyzacja', 'piwnica'];

const Step2Details: React.FC = () => {
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = useFormContext<WizardFormData>();

  const propertyType = watch('propertyType');
  const showFloor = propertyType === 'apartment' || propertyType === 'condo';
  const amenities = watch('amenities') ?? [];

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Szczegóły nieruchomości</h1>
        <p className={styles.stepSubtitle}>
          Im więcej szczegółów, tym lepiej dopasujemy ofertę do szukających
        </p>
      </div>

      <div className={styles.fields}>
        {/* Bedrooms + Bathrooms */}
        <div className={styles.stepperRow}>
          <div className={styles.stepperItem}>
            <span className={styles.stepperLabel}>Sypialnie</span>
            <Controller
              name="bedrooms"
              control={control}
              render={({ field }) => (
                <NumberStepper
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  min={0}
                  max={20}
                />
              )}
            />
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperLabel}>Łazienki</span>
            <Controller
              name="bathrooms"
              control={control}
              render={({ field }) => (
                <NumberStepper
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  min={0}
                  max={10}
                />
              )}
            />
          </div>
        </div>

        {/* Area */}
        <FormField
          label="Powierzchnia"
          htmlFor="area"
          error={errors.area?.message}
          hint="Podaj w metrach kwadratowych (m²)"
        >
          <input
            id="area"
            type="number"
            min={1}
            placeholder="np. 65"
            {...register('area', { valueAsNumber: true })}
          />
        </FormField>

        {/* Floor — conditional */}
        {showFloor && (
          <FormField
            label="Piętro"
            htmlFor="floor"
            error={errors.floor?.message}
            optional
          >
            <input
              id="floor"
              type="number"
              min={0}
              max={100}
              placeholder="np. 3"
              {...register('floor', { valueAsNumber: true })}
            />
          </FormField>
        )}

        {/* Amenities */}
        <div className={styles.fieldGroup}>
          <span className={styles.groupLabel}>Udogodnienia</span>
          <Controller
            name="amenities"
            control={control}
            render={({ field }) => (
              <div className={styles.amenityRow}>
                {AMENITIES.map((amenity) => (
                  <AmenityChip
                    key={amenity}
                    amenity={amenity}
                    selected={(field.value ?? []).includes(amenity)}
                    onToggle={(a) => {
                      const current: Amenity[] = field.value ?? [];
                      field.onChange(
                        current.includes(a)
                          ? current.filter((x) => x !== a)
                          : [...current, a]
                      );
                    }}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Details;
