import React from 'react';
import { listData } from '../../lib/dummydata';
import './listPage.scss';
import Filter from '../../components/filter/filter';
import Card from '../../components/card/card';
import Map from '../../components/map/map';

// Definicja interfejsu dla obiektów w `listData`
interface ListItem {
  id: string | number;
  img: string;
  title: string;
  address: string;
  price: number;
  bedroom: number;
  bathroom: number;
}

const ListPage: React.FC = () => {
  // Typowanie danych na podstawie interfejsu
  const data: ListItem[] = listData;

  return (
    <div className="listPage">
      <div className="listContainer">
        <div className="wrapper">
          <Filter />
          {data.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
      <div className="mapContainer">
        <Map items={data} />
      </div>
    </div>
  );
};

export default ListPage;
