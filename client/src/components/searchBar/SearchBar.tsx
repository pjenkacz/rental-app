import React, { useState } from 'react';
import './searchBar.scss';

const types = ["buy", "rent"];

interface Query {
  type: string;
  location: string;
  minPrice: number;
  maxPrice: number;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<Query>({
    type: "buy",
    location: "",
    minPrice: 0,
    maxPrice: 0,
  });

  const switchType = (val: string) => {
    setQuery((prev) => ({ ...prev, type: val }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuery((prev) => ({
      ...prev,
      [name]: name === "minPrice" || name === "maxPrice" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="searchBar">
      <div className="type">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => switchType(type)}
            className={query.type === type ? "active" : ""}
          >
            {type}
          </button>
        ))}
      </div>
      <form action="">
        <input
          type="text"
          name="location"
          placeholder="City Location"
          value={query.location}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="minPrice"
          min={0}
          placeholder="Min Price"
          value={query.minPrice}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="maxPrice"
          min={0}
          placeholder="Max Price"
          value={query.maxPrice}
          onChange={handleInputChange}
        />
        <button>
          <img src="/search.png" alt="search" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
