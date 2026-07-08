import React from 'react';
import './Dashboard.css';

function Dashboard({ userRole, candidates, onAddCandidate, onSelectCandidate }) {
  const getButtons = () => {
    if (userRole === 'reshala') {
      return ['Список кандидатов', 'Список собеседований', 'Ожидают решения'];
    }
    const btns = ['Добавить кандидата', 'Запланировать собеседование', 'Создать вакансию', 'Просмотр действий'];
    if (userRole === 'admin') btns.push('Пользователи');
    return btns;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Главная</h1>
        <div className="stats-card">
          <span>Сегодня назначено собеседований: <strong>2</strong></span>
        </div>
      </div>

      <div className="actions-section">
        {getButtons().map((label, idx) => (
          <button
            key={idx}
            className="action-btn"
            onClick={() => {
              if (label === 'Добавить кандидата') {
                onAddCandidate();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="candidates-section">
        <h2>Список кандидатов</h2>
        {candidates.map((candidate, idx) => (
          <div key={idx} className="candidate-item">
            <div>
              <h3>{candidate.name}</h3>
              <p>Вакансия: {candidate.vacancy}</p>
            </div>
            <button
              className="candidate-link"
              onClick={() => onSelectCandidate(candidate)}
            >
              Перейти к карточке →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;