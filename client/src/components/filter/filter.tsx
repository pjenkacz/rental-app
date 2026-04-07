import React, { useState, useEffect, useRef } from 'react';
import './filter.scss';
import type { ListingFilters } from '../../hooks/useListings';

const PRICE_OPTIONS = [
  100_000, 250_000, 400_000, 500_000, 700_000, 850_000,
  1_000_000, 1_150_000, 1_300_000, 1_500_000, 2_000_000,
  2_500_000, 7_500_000, 15_000_000,
];

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
        <div className="filter__field">
          <span className="filter__label">Type</span>
          <select className="filter__select" value={listingType} onChange={(e) => setListingType(e.target.value)}>
            <option value="">Any</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div className="filter__sep" />

        {/* Property */}
        <div className="filter__field">
          <span className="filter__label">Property</span>
          <select className="filter__select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Any</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
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
            <div className="filter__dropdown">
              <button className="filter__option filter__option--clear" onClick={() => { setMinPrice(null); setOpenDropdown(null); }}>
                No minimum
              </button>
              {PRICE_OPTIONS.map(p => (
                <button
                  key={p}
                  className={`filter__option${minPrice === p ? ' filter__option--active' : ''}`}
                  onClick={() => { setMinPrice(p); setOpenDropdown(null); }}
                >
                  ${p.toLocaleString()}
                </button>
              ))}
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
            <div className="filter__dropdown">
              <button className="filter__option filter__option--clear" onClick={() => { setMaxPrice(null); setOpenDropdown(null); }}>
                No maximum
              </button>
              {PRICE_OPTIONS.map(p => (
                <button
                  key={p}
                  className={`filter__option${maxPrice === p ? ' filter__option--active' : ''}`}
                  onClick={() => { setMaxPrice(p); setOpenDropdown(null); }}
                >
                  ${p.toLocaleString()}
                </button>
              ))}
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
