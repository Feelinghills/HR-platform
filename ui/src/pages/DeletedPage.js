import React, { useState, useEffect } from 'react';
import api, { mapCandidateFromApi, mapInterviewFromApi } from '../api';
import SearchFilter from '../components/SearchFilter';

export default function DeletedPage({ hasPermission }) {
  const [deletedItems, setDeletedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDeleted = async () => {
    setLoading(true);
    try {
      const [candidates, interviews, vacancies, competencies, users] = await Promise.all([
        api.getDeletedCandidates().catch(() => []),
        api.getDeletedInterviews().catch(() => []),
        api.getDeletedVacancies().catch(() => []),
        api.getDeletedCompetencies().catch(() => []),
        api.getDeletedUsers().catch(() => []),
      ]);
      const mappedCandidates = (candidates || []).map(c => ({
        ...mapCandidateFromApi(c),
        deletedAt: c.deletedAt,
        deletedReason: c.deletedReason,
        category: 'Кандидат',
      }));
      const mappedInterviews = (interviews || []).map(i => ({
        id: i.id,
        name: i.candidateName || 'Без имени',
        category: 'Собеседование',
        deletedAt: i.deletedAt,
        deletedReason: i.deletedReason,
        details: `${i.vacancyTitle || ''} — ${i.interviewerName || ''}`,
        raw: mapInterviewFromApi(i),
      }));
      const mappedVacancies = (vacancies || []).map(v => ({
        id: v.id,
        name: v.title,
        category: 'Вакансия',
        deletedAt: v.deletedAt,
        deletedReason: v.deletedReason,
        details: v.description || '',
      }));
      const mappedCompetencies = (competencies || []).map(c => ({
        id: c.id,
        name: c.name,
        category: 'Компетенция',
        deletedAt: c.deletedAt,
        deletedReason: c.deletedReason,
        details: `${c.category || ''} — ${c.maxScore || 5} баллов`,
      }));
      const mappedUsers = (users || []).map(u => ({
        id: u.id,
        name: u.fullName,
        category: 'Пользователь',
        deletedAt: null,
        deletedReason: null,
        details: `${u.email || ''} — ${u.role || ''}`,
      }));
      setDeletedItems([...mappedCandidates, ...mappedInterviews, ...mappedVacancies, ...mappedCompetencies, ...mappedUsers].sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || '')));
    } catch (err) {
      console.error('Failed to load deleted items:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadDeleted(); }, []);

  const filteredItems = deletedItems.filter(item => {
    const matchesSearch = !searchQuery ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.phone && item.phone.includes(searchQuery)) ||
      (item.details && item.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(item.category);
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dt; }
  };

  const handleRestore = async (item) => {
    if (!window.confirm(`Восстановить "${item.name}"?`)) return;
    try {
      if (item.category === 'Кандидат') {
        await api.restoreCandidate(item.id);
      } else if (item.category === 'Собеседование') {
        await api.restoreInterview(item.id);
      } else if (item.category === 'Вакансия') {
        await api.restoreVacancy(item.id);
      } else if (item.category === 'Компетенция') {
        await api.restoreCompetency(item.id);
      } else if (item.category === 'Пользователь') {
        await api.restoreUser(item.id);
      }
      setDeletedItems(prev => prev.filter(i => i.id !== item.id || i.category !== item.category));
    } catch (err) {
      alert('Ошибка восстановления: ' + err.message);
    }
  };

  const CATEGORY_COLORS = {
    'Кандидат': { bg: '#dbeafe', text: '#1d4ed8' },
    'Собеседование': { bg: '#e9d5ff', text: '#7c3aed' },
    'Вакансия': { bg: '#fce7f3', text: '#be185d' },
    'Компетенция': { bg: '#d1fae5', text: '#065f46' },
    'Пользователь': { bg: '#fef3c7', text: '#92400e' },
  };

  const CATEGORIES = ['Кандидат', 'Собеседование', 'Вакансия', 'Компетенция', 'Пользователь'];

  if (!hasPermission('deleted.view')) {
    return <div style={{ padding: '24px', color: '#6A7787' }}>Нет доступа к просмотру удалённых</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Удалённое</h1>
        <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {deletedItems.length}</span>
      </div>
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Поиск по имени, телефону или деталям..."
        filters={[
          { key: 'category', type: 'select', label: 'Категория', options: CATEGORIES },
        ]}
        activeFilters={{ category: categoryFilter }}
        setFilter={(key, val) => { if (key === 'category') setCategoryFilter(val); }}
        clearAllFilters={() => { setCategoryFilter([]); setSearchQuery(''); }}
        totalCount={deletedItems.length}
        filteredCount={filteredItems.length}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6A7787' }}>Загрузка...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6A7787' }}>Удалённых элементов нет</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <div key={`${item.category}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#171D24', borderRadius: '12px', borderLeft: '3px solid #4E1717' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{item.name}</h3>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: catColor.bg, color: catColor.text }}>{item.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {item.phone && <span style={{ fontSize: '13px', color: '#6A7787' }}>{item.phone}</span>}
                    {item.details && <span style={{ fontSize: '13px', color: '#6A7787' }}>{item.details}</span>}
                    {item.deletedAt && <span style={{ fontSize: '12px', color: '#4E1717' }}>Удалено: {formatDate(item.deletedAt)}</span>}
                    {item.deletedReason && <span style={{ fontSize: '12px', color: '#6A7787' }}>Причина: {item.deletedReason}</span>}
                  </div>
                </div>
                {hasPermission('deleted.restore') && (
                  <button onClick={() => handleRestore(item)} style={{ padding: '8px 20px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Восстановить</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
