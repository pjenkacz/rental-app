import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search, CheckCircle, MapPin } from 'lucide-react';
import FormField from '../components/FormField';
import { useGeocoding } from '../useGeocoding';
import type { WizardFormData } from '../wizardTypes';
import styles from './Steps.module.scss';

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Step3Location: React.FC = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WizardFormData>();

  const { geocode, isLoading, error: geocodeError, clearError } = useGeocoding();
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const address = watch('address');
  const city = watch('city');

  const handleSearch = async () => {
    if (!address?.trim() || !city?.trim()) return;
    setGeocodeSuccess(false);
    clearError();
    const result = await geocode(address.trim(), city.trim());
    if (result) {
      setValue('latitude', result.lat, { shouldValidate: true });
      setValue('longitude', result.lng, { shouldValidate: true });
      setCoords({ lat: result.lat, lng: result.lng });
      setGeocodeSuccess(true);
    } else {
      setValue('latitude', undefined);
      setValue('longitude', undefined);
      setCoords(null);
    }
  };

  const canSearch = !!address?.trim() && !!city?.trim();

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Lokalizacja</h1>
        <p className={styles.stepSubtitle}>
          Adres pojawi się na mapie i w wynikach wyszukiwania
        </p>
      </div>

      <div className={styles.fields}>
        <FormField
          label="Adres"
          htmlFor="address"
          error={errors.address?.message}
          hint="Ulica i numer — np. ul. Marszałkowska 1"
        >
          <input
            id="address"
            type="text"
            placeholder="ul. Marszałkowska 1"
            {...register('address')}
          />
        </FormField>

        <FormField
          label="Miasto"
          htmlFor="city"
          error={errors.city?.message}
        >
          <input
            id="city"
            type="text"
            placeholder="np. Warszawa"
            {...register('city')}
          />
        </FormField>

        <FormField
          label="Kraj"
          htmlFor="country"
          error={errors.country?.message}
          optional
        >
          <input
            id="country"
            type="text"
            placeholder="Polska"
            {...register('country')}
          />
        </FormField>

        {/* Search button */}
        <button
          type="button"
          className={styles.geocodeBtn}
          onClick={handleSearch}
          disabled={!canSearch || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className={styles.publishSpinner} />
              Szukam adresu...
            </>
          ) : (
            <>
              <Search size={15} />
              Weryfikuj adres na mapie
            </>
          )}
        </button>

        {/* Status messages */}
        {geocodeError && !isLoading && (
          <div className={[styles.geocodingStatus, styles.geocodingError].join(' ')}>
            {geocodeError}
          </div>
        )}

        {geocodeSuccess && coords && !isLoading && (
          <div className={[styles.geocodingStatus, styles.geocodingSuccess].join(' ')}>
            <CheckCircle size={15} />
            Adres znaleziony — ogłoszenie pojawi się na mapie
          </div>
        )}

        {!coords && !isLoading && !geocodeError && (
          <div className={styles.geocodingStatus}>
            <MapPin size={15} />
            Wpisz adres i miasto, następnie kliknij &quot;Weryfikuj&quot;
          </div>
        )}

        {/* Map preview — only rendered when we have valid coords */}
        {coords && (
          <div className={styles.mapPreview}>
            <MapContainer
              key={`${coords.lat}-${coords.lng}`}
              center={[coords.lat, coords.lng]}
              zoom={14}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coords.lat, coords.lng]} />
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3Location;
