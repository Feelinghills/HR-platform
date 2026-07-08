import React, { useState, useEffect } from 'react';
import './Greeting.css';

function Greeting({ username, onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className={`greeting-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="greeting-content">
        <img src="/logo.png" alt="Логотип" className="greeting-logo" />
        <h1 className="greeting-title">Здравствуйте, {username}!</h1>
      </div>
    </div>
  );
}

export default Greeting;