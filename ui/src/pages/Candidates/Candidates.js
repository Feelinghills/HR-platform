import React, { useState } from 'react';
import './Candidates.css';

function Candidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const candidates = [
    { id: 1, name: 'Иванов Иван Иванович', phone: '89991234567', vacancy: 'Senior разработчик', createdAt: '2025-01-15' },
    { id: 2, name: 'Сергеев Сергей Сергеевич', phone: '89998765432', vacancy: 'Middle аналитик', createdAt: '2025-02-10' },
    { id: 3, name: 'Петров Петр Петрович', phone: '89991234568', vacancy: 'Junior Java разработчик', createdAt: '2025-03-01' },
  ];

  const getFilteredCandidates = () => {
    let filtered = candidates.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.vacancy.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabet':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return filtered;
  };

  const filteredCandidates = getFilteredCandidates();

  return (
    <div className="candidates-page">
      <div className="candidates-header">
        <div className="candidates-title">
          <h1>Кандидаты</h1>
          <span className="candidates-count">Всего: {candidates.length}</span>
        </div>
        <button className="add-candidate-btn">Добавить кандидата</button>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
            Фильтр ▼
          </button>
        </div>
        {showSortMenu && (
          <div className="sort-menu">
            <button className={sortOption === 'newest' ? 'active' : ''} onClick={() => { setSortOption('newest'); setShowSortMenu(false); }}>
              Сначала новые
            </button>
            <button className={sortOption === 'oldest' ? 'active' : ''} onClick={() => { setSortOption('oldest'); setShowSortMenu(false); }}>
              Сначала старые
            </button>
            <button className={sortOption === 'alphabet' ? 'active' : ''} onClick={() => { setSortOption('alphabet'); setShowSortMenu(false); }}>
              По алфавиту
            </button>
          </div>
        )}
      </div>

      <div className="candidates-list">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <div className="candidate-info">
              <h3 className="candidate-name">{candidate.name}</h3>
              <p className="candidate-phone">{candidate.phone}</p>
              <p className="candidate-vacancy">{candidate.vacancy}</p>
            </div>
            <button className="candidate-card-link">Перейти к карточке</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Candidates;  // ← ЭТО ВАЖНО!