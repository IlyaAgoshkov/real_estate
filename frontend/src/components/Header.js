import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';
import { FaPhoneAlt } from 'react-icons/fa';
import { FaLocationArrow } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">

        <button className="mobile-menu-button" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo" />
        </Link>


        <div className="desktop-right">
          <nav className="desktop-nav">
            <Link to="/model" className="nav-link">Наша модель</Link>
          </nav>
          <div className="header-info">
            <div className="phone-block">
              <span className="phone-icon"><FaPhoneAlt /></span>
              <span className="phone-number"><b>8 999 999 99 99</b></span>
            </div>
            <div className="location-block">
              <FaLocationArrow className="location-icon" />
              <span className="location-city">Краснодар</span>
            </div>
          </div>
          <div className="desktop-auth">
            {isAuthenticated ? (
              <>
                {username && <span className="username-display">Привет, {username}!</span>}
                <button onClick={logout} className="nav-button">Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Войти</Link>
                <Link to="/register" className="nav-button">Регистрация</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Phone Number (visible only on mobile) */}
        <div className="mobile-phone-number">
          <span className="phone-icon"><FaPhoneAlt /></span>
          <span className="phone-number"><b>8 999 999 99 99</b></span>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">Меню</h2>
          <button className="mobile-menu-close" onClick={toggleMenu}>
            <FaTimes />
          </button>
        </div>
        <nav className="mobile-nav">
          <Link to="/model" className="mobile-nav-link" onClick={toggleMenu}>
            Наша модель
          </Link>
          {isAuthenticated ? (
            <>
              {username && <span className="mobile-username-display">Привет, {username}!</span>}
              <button onClick={() => { logout(); toggleMenu(); }} className="mobile-nav-button">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={toggleMenu}>
                Войти
              </Link>
              <Link to="/register" className="mobile-nav-button" onClick={toggleMenu}>
                Регистрация
              </Link>
            </>
          )}
        </nav>

        <div className="location-block">
          <FaLocationArrow className="location-icon" />
          <span className="location-city">Краснодар</span>
        </div>
      </div>
    </header>
  );
}

export default Header; 