import React from 'react';
import './list.scss';
import Card from "../card/card";
import { listData } from "../../lib/dummydata";

// Typ danych dla listy
interface ListItem {
  id: string | number;
  img: string;
  title: string;
  address: string;
  price: number;
  bedroom: number;
  bathroom: number;
}

const List: React.FC = () => {
  return (
    <div className="list">
      {listData.map((item: ListItem) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
};

export default List;
