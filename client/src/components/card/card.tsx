import './card.scss';
import React from 'react';
import { Link } from 'react-router-dom';

// Typ dla obiektu `item`
interface CardItem {
  id: string | number;
  img: string;
  title: string;
  address: string;
  price: number;
  bedroom: number;
  bathroom: number;
}

interface CardProps {
  item: CardItem;
}

const Card: React.FC<CardProps> = ({ item }) => {
  return (
    <div className="card">
      <div className="imageContainer">
        <Link to={`/${item.id}`}>
          <img src={item.img} alt="fota" className="cardImage" />
        </Link>
      </div>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">
          <span>$ {item.price}</span>
        </p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedrooms</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathrooms</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
