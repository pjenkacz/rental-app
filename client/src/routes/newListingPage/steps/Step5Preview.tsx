import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Pencil, Loader2, CheckCircle } from 'lucide-react';
import type { WizardFormData, UploadedImage } from '../wizardTypes';
import { PROPERTY_TYPE_LABELS, AMENITY_LABELS } from '../wizardTypes';
import styles from './Steps.module.scss';

interface Step5PreviewProps {
  images: UploadedImage[];
  onGoToStep: (step: number) => void;
  onPublish: () => Promise<string | null>;
}

type PublishState = 'idle' | 'publishing' | 'success';

const Step5Preview: React.FC<Step5PreviewProps> = ({
  images,
  onGoToStep,
  onPublish,
}) => {
  const { watch } = useFormContext<WizardFormData>();
  const data = watch();
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (publishState !== 'success') return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) clearInterval(interval);
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [publishState]);

  const handlePublish = async () => {
    setPublishState('publishing');
    const newId = await onPublish();
    if (newId) {
      setPublishState('success');
    } else {
      setPublishState('idle');
    }
  };

  if (publishState === 'success') {
    return (
      <div className={styles.step}>
        <div className={styles.successState}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h1 className={styles.successTitle}>Ogłoszenie opublikowane!</h1>
          <p className={styles.successRedirect}>
            Przekierowanie za {countdown}s...
          </p>
        </div>
      </div>
    );
  }

  const successImages = images.filter((img) => img.status === 'success');

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Podgląd ogłoszenia</h1>
        <p className={styles.stepSubtitle}>
          Sprawdź wszystkie informacje przed publikacją
        </p>
      </div>

      <div className={styles.fields}>
        {/* Section 1 — Basic Info */}
        <div className={styles.previewSection}>
          <div className={styles.previewSectionHeader}>
            <h2 className={styles.previewSectionTitle}>Podstawowe info</h2>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => onGoToStep(0)}
            >
              <Pencil size={12} />
              Edytuj
            </button>
          </div>
          <div className={styles.previewSectionBody}>
            <dl>
              <div className={styles.previewRow}>
                <dt>Tytuł</dt>
                <dd>{data.title || '—'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Rodzaj oferty</dt>
                <dd>{data.listingType === 'rent' ? 'Wynajem' : 'Sprzedaż'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Typ</dt>
                <dd>{data.propertyType ? PROPERTY_TYPE_LABELS[data.propertyType] : '—'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Cena</dt>
                <dd>{data.price ? `$${Number(data.price).toLocaleString()}` : '—'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Opis</dt>
                <dd>{data.description || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Section 2 — Details */}
        <div className={styles.previewSection}>
          <div className={styles.previewSectionHeader}>
            <h2 className={styles.previewSectionTitle}>Szczegóły</h2>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => onGoToStep(1)}
            >
              <Pencil size={12} />
              Edytuj
            </button>
          </div>
          <div className={styles.previewSectionBody}>
            <dl>
              <div className={styles.previewRow}>
                <dt>Sypialnie</dt>
                <dd>{data.bedrooms ?? 0}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Łazienki</dt>
                <dd>{data.bathrooms ?? 0}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Powierzchnia</dt>
                <dd>{data.area ? `${data.area} m²` : '—'}</dd>
              </div>
              {data.floor !== undefined && data.floor !== null && (
                <div className={styles.previewRow}>
                  <dt>Piętro</dt>
                  <dd>{data.floor}</dd>
                </div>
              )}
              <div className={styles.previewRow}>
                <dt>Udogodnienia</dt>
                <dd>
                  {data.amenities?.length
                    ? data.amenities.map((a) => AMENITY_LABELS[a]).join(', ')
                    : 'Brak'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Section 3 — Location */}
        <div className={styles.previewSection}>
          <div className={styles.previewSectionHeader}>
            <h2 className={styles.previewSectionTitle}>Lokalizacja</h2>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => onGoToStep(2)}
            >
              <Pencil size={12} />
              Edytuj
            </button>
          </div>
          <div className={styles.previewSectionBody}>
            <dl>
              <div className={styles.previewRow}>
                <dt>Adres</dt>
                <dd>{data.address || '—'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Miasto</dt>
                <dd>{data.city || '—'}</dd>
              </div>
              <div className={styles.previewRow}>
                <dt>Kraj</dt>
                <dd>{data.country || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Section 4 — Photos */}
        <div className={styles.previewSection}>
          <div className={styles.previewSectionHeader}>
            <h2 className={styles.previewSectionTitle}>
              Zdjęcia ({successImages.length})
            </h2>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => onGoToStep(3)}
            >
              <Pencil size={12} />
              Edytuj
            </button>
          </div>
          {successImages.length > 0 ? (
            <div className={styles.previewPhotos}>
              {successImages.slice(0, 6).map((img) => (
                <img
                  key={img.localId}
                  src={img.localPreview || img.url}
                  alt="Zdjęcie ogłoszenia"
                  className={styles.previewPhotoThumb}
                />
              ))}
              {successImages.length > 6 && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: '#78716C',
                  }}
                >
                  +{successImages.length - 6} więcej
                </span>
              )}
            </div>
          ) : (
            <div className={styles.previewSectionBody}>
              <p style={{ color: '#78716C', fontSize: '0.875rem', margin: 0 }}>
                Brak zdjęć
              </p>
            </div>
          )}
        </div>

        {/* Publish button */}
        <button
          type="button"
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={publishState === 'publishing'}
        >
          {publishState === 'publishing' ? (
            <>
              <Loader2 size={18} className={styles.publishSpinner} />
              Publikowanie...
            </>
          ) : (
            'Publikuj ogłoszenie'
          )}
        </button>
      </div>
    </div>
  );
};

export default Step5Preview;
