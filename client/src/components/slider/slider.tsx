import './slider.scss';
import React, { useState } from 'react';

interface SliderProps {
  images: string[];
}

// Jeśli używasz "React.FC", możesz zapisać:
// const Slider: React.FC<SliderProps> = ({ images }) => {
function Slider({ images }: SliderProps) {
  const [imageId, setImageId] = useState<number | null>(null);

  const changeSlide = (direction: "left" | "right") => {
    if (direction === "left") {
      if (imageId === 0) {
        setImageId(images.length - 1);
      } else if (imageId !== null) {
        setImageId(imageId - 1);
      }
    } else if (direction === "right") {
      if (imageId === images.length - 1) {
        setImageId(0);
      } else if (imageId !== null) {
        setImageId(imageId + 1);
      }
    }
  };

  return (
    <div className="slider">
      {imageId !== null && (
        <div className="fullSlider">
          <div className="arrow">
            <img src="arrow.png" alt="" onClick={() => changeSlide("left")} />
          </div>
          <div className="imgContainer">
            <img src={images[imageId]} alt="" />
          </div>
          <div className="arrow">
            <img
              src="arrow.png"
              alt=""
              className="right"
              onClick={() => changeSlide("right")}
            />
          </div>
          <div className="close" onClick={() => setImageId(null)}>
            X
          </div>
        </div>
      )}
      <div className="big">
        <img src={images[0]} alt="" onClick={() => setImageId(0)} />
      </div>
      <div className="small">
        {images.slice(1).map((image, index) => (
          <img
            src={image}
            alt=""
            key={index}
            onClick={() => setImageId(index + 1)}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
