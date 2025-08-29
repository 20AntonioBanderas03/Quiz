// src/components/Header.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { AuthContext } from '../context/context';
import { useContext } from 'react';

export default function Header() {
  const location = useLocation();

  const {isAuth, setIsAuth} = useContext(AuthContext);

  // Проверяем, залогинен ли пользователь
  const isLoggedIn = sessionStorage.getItem('isAuth') === 'true';

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
    sessionStorage.setItem("isAuth", false);
    setIsAuth(false);
  };

  return (
    <header style={{ padding: '20px 0', marginBottom: '30px' }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <Logo />
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn">
            Выйти из аккаунта
          </button>
        ) : (
          <Link to={location.pathname === '/login' ? '/' : '/login'} className="btn">
            {location.pathname === '/login' ? 'Регистрация' : 'Войти'}
          </Link>
        )}
      </div>
    </header>
  );
}