import React from 'react';
import { Car, TreePine, Wind, Package } from 'lucide-react';
import type { Amenity } from '../wizardTypes';
import { AMENITY_LABELS } from '../wizardTypes';
import styles from './AmenityChip.module.scss';

const AMENITY_ICONS: Record<Amenity, React.ReactNode> = {
  parking: <Car size={16} strokeWidth={2} />,
  balkon: <TreePine size={16} strokeWidth={2} />,
  klimatyzacja: <Wind size={16} strokeWidth={2} />,
  piwnica: <Package size={16} strokeWidth={2} />,
};

interface AmenityChipProps {
  amenity: Amenity;
  selected: boolean;
  onToggle: (amenity: Amenity) => void;
}

const AmenityChip: React.FC<AmenityChipProps> = ({ amenity, selected, onToggle }) => {
  return (
    <button
      type="button"
      className={[styles.chip, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={() => onToggle(amenity)}
      aria-pressed={selected}
    >
      {AMENITY_ICONS[amenity]}
      <span>{AMENITY_LABELS[amenity]}</span>
    </button>
  );
};

export default AmenityChip;
