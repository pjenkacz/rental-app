import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>404</h1>
      <p>Strona nie istnieje.</p>
      <Link to="/">Wróć na stronę główną</Link>
    </div>
  );
};

export default NotFoundPage;
