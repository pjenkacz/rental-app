import React from 'react';
import PhotoUploader from '../components/PhotoUploader';
import type { UploadedImage } from '../wizardTypes';
import styles from './Steps.module.scss';

interface Step4PhotosProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  error?: string;
}

const Step4Photos: React.FC<Step4PhotosProps> = ({ images, onChange, error }) => {
  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Zdjęcia</h1>
        <p className={styles.stepSubtitle}>
          Dobre zdjęcia to więcej zapytań. Dodaj co najmniej 1 zdjęcie.
        </p>
      </div>

      <div className={styles.fields}>
        <PhotoUploader images={images} onChange={onChange} />

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '0.8rem',
              color: 'var(--color-error)',
              margin: 0,
            }}
            role="alert"
          >
            ⚠ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step4Photos;
