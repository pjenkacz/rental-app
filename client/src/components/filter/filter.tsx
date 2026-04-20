import React, { useState, useEffect, useRef } from 'react';
import './filter.scss';
import type { ListingFilters } from '../../hooks/useListings';

const PRICE_MAX = 5_000_000;
const PRICE_STEP = 10_000;

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  return `$${value / 1_000}K`;
}

interface FilterProps {
  onSearch: (filters: ListingFilters) => void;
  activeCity?: string;
}

const Filter: React.FC<FilterProps> = ({ onSearch, activeCity }) => {
  const [city, setCity] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  const handleSearch = () => {
    const filters: ListingFilters = {};
    if (city.trim()) filters.city = city.trim();
    if (listingType) filters.listingType = listingType as 'buy' | 'rent';
    if (minPrice !== null) filters.minPrice = minPrice;
    if (maxPrice !== null) filters.maxPrice = maxPrice;
    if (bedrooms !== null) filters.bedrooms = bedrooms;
    onSearch(filters);
    setOpenDropdown(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const Chevron = () => (
    <svg className="filter__chevron" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="filter" ref={filterRef}>
      <h1 className="filter__title">
        {activeCity
          ? <>Results for <span className="filter__city">{activeCity}</span></>
          : 'Browse listings'}
      </h1>

      <div className="filter__bar">
        {/* Location */}
        <div className="filter__field filter__field--grow">
          <span className="filter__label">Location</span>
          <input
            className="filter__input"
            type="text"
            placeholder="City or area"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="filter__sep" />

        {/* Type */}
        <div className="filter__field filter__field--drop">
          <span className="filter__label">Type</span>
          <button
            type="button"
            className={`filter__trigger${openDropdown === 'type' ? ' filter__trigger--open' : ''}`}
            onClick={(e) => toggleDropdown('type', e)}
          >
            <span>{listingType === 'buy' ? 'Buy' : listingType === 'rent' ? 'Rent' : 'Any'}</span>
            <Chevron />
          </button>
          {openDropdown === 'type' && (
            <div className="filter__dropdown filter__dropdown--sm">
              <button className={`filter__option${listingType === '' ? ' filter__option--active' : ''}`} onClick={() => { setListingType(''); setOpenDropdown(null); }}>Any</button>
              <button className={`filter__option${listingType === 'buy' ? ' filter__option--active' : ''}`} onClick={() => { setListingType('buy'); setOpenDropdown(null); }}>Buy</button>
              <button className={`filter__option${listingType === 'rent' ? ' filter__option--active' : ''}`} onClick={() => { setListingType('rent'); setOpenDropdown(null); }}>Rent</button>
            </div>
          )}
        </div>

        <div className="filter__sep" />

        {/* Property */}
        <div className="filter__field filter__field--drop">
          <span className="filter__label">Property</span>
          <button
            type="button"
            className={`filter__trigger${openDropdown === 'property' ? ' filter__trigger--open' : ''}`}
            onClick={(e) => toggleDropdown('property', e)}
          >
            <span>{propertyType
              ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
              : 'Any'}
            </span>
            <Chevron />
          </button>
          {openDropdown === 'property' && (
            <div className="filter__dropdown filter__dropdown--sm">
              {(['', 'apartment', 'house', 'condo', 'land']).map((val) => (
                <button
                  key={val}
                  className={`filter__option${propertyType === val ? ' filter__option--active' : ''}`}
                  onClick={() => { setPropertyType(val); setOpenDropdown(null); }}
                >
                  {val === '' ? 'Any' : val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filter__sep" />

        {/* Min Price */}
        <div className="filter__field filter__field--drop">
          <span className="filter__label">Min Price</span>
          <button
            type="button"
            className={`filter__trigger${openDropdown === 'minPrice' ? ' filter__trigger--open' : ''}`}
            onClick={(e) => toggleDropdown('minPrice', e)}
          >
            <span>{minPrice !== null ? formatPrice(minPrice) : 'No min'}</span>
            <Chevron />
          </button>
          {openDropdown === 'minPrice' && (
            <div className="filter__price-panel">
              <input
                type="number"
                className="filter__price-number"
                min={0}
                max={PRICE_MAX}
                step={PRICE_STEP}
                placeholder="0"
                value={minPrice ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Math.min(PRICE_MAX, Math.max(0, Number(e.target.value)));
                  setMinPrice(v);
                }}
              />
              <input
                type="range"
                className="filter__slider"
                min={0}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={minPrice ?? 0}
                onChange={(e) => setMinPrice(Number(e.target.value) === 0 ? null : Number(e.target.value))}
                style={{ '--pct': `${((minPrice ?? 0) / PRICE_MAX) * 100}%` } as React.CSSProperties}
              />
              <div className="filter__price-range-labels">
                <span>$0</span>
                <span>$5M</span>
              </div>
              <button
                className="filter__price-clear"
                onClick={() => { setMinPrice(null); setOpenDropdown(null); }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="filter__sep" />

        {/* Max Price */}
        <div className="filter__field filter__field--drop">
          <span className="filter__label">Max Price</span>
          <button
            type="button"
            className={`filter__trigger${openDropdown === 'maxPrice' ? ' filter__trigger--open' : ''}`}
            onClick={(e) => toggleDropdown('maxPrice', e)}
          >
            <span>{maxPrice !== null ? formatPrice(maxPrice) : 'No max'}</span>
            <Chevron />
          </button>
          {openDropdown === 'maxPrice' && (
            <div className="filter__price-panel">
              <input
                type="number"
                className="filter__price-number"
                min={0}
                max={PRICE_MAX}
                step={PRICE_STEP}
                placeholder="5,000,000"
                value={maxPrice ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Math.min(PRICE_MAX, Math.max(0, Number(e.target.value)));
                  setMaxPrice(v);
                }}
              />
              <input
                type="range"
                className="filter__slider"
                min={0}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxPrice ?? PRICE_MAX}
                onChange={(e) => setMaxPrice(Number(e.target.value) === PRICE_MAX ? null : Number(e.target.value))}
                style={{ '--pct': `${((maxPrice ?? PRICE_MAX) / PRICE_MAX) * 100}%` } as React.CSSProperties}
              />
              <div className="filter__price-range-labels">
                <span>$0</span>
                <span>$5M</span>
              </div>
              <button
                className="filter__price-clear"
                onClick={() => { setMaxPrice(null); setOpenDropdown(null); }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="filter__sep" />

        {/* Bedrooms */}
        <div className="filter__field filter__field--drop">
          <span className="filter__label">Bedrooms</span>
          <button
            type="button"
            className={`filter__trigger${openDropdown === 'bedrooms' ? ' filter__trigger--open' : ''}`}
            onClick={(e) => toggleDropdown('bedrooms', e)}
          >
            <span>{bedrooms !== null ? `${bedrooms} bed${bedrooms > 1 ? 's' : ''}` : 'Any'}</span>
            <Chevron />
          </button>
          {openDropdown === 'bedrooms' && (
            <div className="filter__dropdown filter__dropdown--sm">
              <button className="filter__option filter__option--clear" onClick={() => { setBedrooms(null); setOpenDropdown(null); }}>
                Any
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`filter__option${bedrooms === n ? ' filter__option--active' : ''}`}
                  onClick={() => { setBedrooms(n); setOpenDropdown(null); }}
                >
                  {n} bedroom{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button className="filter__btn" onClick={handleSearch} aria-label="Search">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Filter;
