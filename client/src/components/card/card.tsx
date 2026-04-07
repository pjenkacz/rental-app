import './card.scss';
import React from 'react';
import { Link } from 'react-router-dom';

export interface CardItem {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  listingType: 'buy' | 'rent';
  propertyType: 'apartment' | 'house' | 'condo' | 'land';
  images: { url: string; order?: number }[];
}

interface CardProps {
  item: CardItem;
  onChat?: () => void;
}

const Card: React.FC<CardProps> = ({ item, onChat }) => {
  const coverImage = item.images[0]?.url ?? '';

  return (
    <div className="card">
      <div className="imageContainer">
        <Link to={`/listings/${item.id}`}>
          <img src={coverImage} alt={item.title} className="cardImage" />
        </Link>
      </div>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/listings/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}, {item.city}</span>
        </p>
        <p className="price">
          <span>$ {item.price.toLocaleString()}</span>
        </p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedrooms} bedroom{item.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathrooms} bathroom{item.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="Save" />
            </div>
            <div className="icon" onClick={onChat} role={onChat ? 'button' : undefined}>
              <img src="/chat.png" alt="Chat" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
