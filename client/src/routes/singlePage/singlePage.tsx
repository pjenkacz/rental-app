import React from 'react';
import './singlePage.scss';
import Slider from '../../components/slider/slider';
import { singlePostData, userData } from '../../lib/dummydata';
import Map from '../../components/map/map.jsx';
import '../../responsive.scss';

// Interfejs dla `singlePostData`
interface SinglePost {
  id: string | number;
  title: string;
  address: string;
  price: number;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
}

// Interfejs dla `userData`
interface User {
  id: string | number;
  name: string;
  img: string;
}

const SinglePage: React.FC = () => {
  // Typowanie danych
  const post: SinglePost = singlePostData;
  const user: User = userData;

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={user.img} alt="User" />
                <span>{user.name}</span>
              </div>
            </div>
            <div className="bottom">{post.description}</div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                <p>Renter is responsible</p>
              </div>
            </div>
            <div className="feature">
              <img src="pet.png" alt="" />
              <div className="featureText">
                <span>Pets Policy</span>
                <p>Pets allowed</p>
              </div>
            </div>
            <div className="feature">
              <img src="fee.png" alt="" />
              <div className="featureText">
                <span>Property Fees</span>
                <p>Gimme 3x income</p>
              </div>
            </div>
          </div>
          <p className="title">Size </p>
          <div className="sizes">
            <div className="size">
              <img src="size.png" alt="" />
              <span>80 m^2</span>
            </div>
            <div className="size">
              <img src="bed.png" alt="" />
              <span>2 beds</span>
            </div>
            <div className="size">
              <img src="bath.png" alt="" />
              <span>1 bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>100m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="bus.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>700m right</p>
              </div>
            </div>
            <div className="feature">
              <img src="restaurant.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>1200m left</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button>
              <img src="./chat.png" alt="" />
              Send a Message
            </button>
            <button>
              <img src="./save.png" alt="" />
              Save the place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
