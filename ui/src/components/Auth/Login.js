import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login === 'admin' && password === 'admin') {
      onLogin('Администратор', 'admin', 'admin');
    } else if (login === 'hr' && password === 'hr') {
      onLogin('HR', 'hr', 'hr');
    } else if (login === 'reshala' && password === 'reshala') {
      onLogin('Согласующий', 'reshala', 'reshala');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <img src="/logo.png" alt="Логотип" className="login-logo" />
        <span className="login-title">HR-platform</span>
      </div>
      <div className="login-container">
        <h1>Технические собеседования</h1>
        <h2>Авторизация</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Вход</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;