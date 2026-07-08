import React from 'react';
import { formatDate } from '../utils/formatters';

export default function ArchivePage({ candidates, interviews, competencies, handleArchiveCandidate, handleUnarchiveInterview, handleArchiveCompetency }) {
  const archivedCandidates = candidates.filter(c => c.isArchived);
  const archivedInterviews = interviews.filter(i => i.isArchived);
  const archivedCompetencies = competencies.filter(c => c.isArchived);
  const totalCount = archivedCandidates.length + archivedInterviews.length + archivedCompetencies.length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Архив</h1>
          <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего в архиве: {totalCount}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Кандидаты в архиве ({archivedCandidates.length})</h2>
          {archivedCandidates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {archivedCandidates.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                  <div><span style={{ color: '#ffffff', fontWeight: '500' }}>{c.name}</span><span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{c.vacancy}</span></div>
                  <button onClick={() => handleArchiveCandidate(c.id)} style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Разархивировать</button>
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных кандидатов</p>}
        </div>
        <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Собеседования в архиве ({archivedInterviews.length})</h2>
          {archivedInterviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {archivedInterviews.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                  <div><span style={{ color: '#ffffff', fontWeight: '500' }}>{i.candidateName}</span><span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{formatDate(i.date)}</span><span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{i.status}</span></div>
                  <button onClick={() => handleUnarchiveInterview(i.id)} style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Разархивировать</button>
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных собеседований</p>}
        </div>
        <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Компетенции в архиве ({archivedCompetencies.length})</h2>
          {archivedCompetencies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {archivedCompetencies.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                  <div><span style={{ color: '#ffffff', fontWeight: '500' }}>{c.name}</span><span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{c.category}</span><span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>до {c.maxScore} баллов</span></div>
                  <button onClick={() => handleArchiveCompetency(c.id)} style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Разархивировать</button>
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных компетенций</p>}
        </div>
      </div>
    </div>
  );
}
