import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ toggleSidebar, username, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        <button className="burger-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => navigate('/dashboard')}>
          <img src="/logo.png" alt="Логотип" className="logo-img" />
          <span className="logo-text">HR-platform</span>
        </div>
      </div>
      <div className="header-right">
        <button className="avatar-btn">
          {username ? username.charAt(0).toUpperCase() : 'П'}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}

export default Header;