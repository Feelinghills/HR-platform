import React, { useState, useRef, useEffect } from 'react';

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  placeholder = 'Поиск...',
  filters = [],
  activeFilters = {},
  setFilter,
  clearAllFilters,
  totalCount = 0,
  filteredCount = null,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasActiveFilters = Object.entries(activeFilters).some(([k, v]) => {
    if (k === 'sort' || k === 'sortFrom' || k === 'sortTo') return false;
    if (Array.isArray(v)) return v.length > 0;
    return v && v !== 'Все' && v !== '' && v !== 'newest';
  });

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: hasActiveFilters ? '#333F50' : '#171D24',
            border: hasActiveFilters ? '1px solid #3b82f6' : '1px solid #6A7787',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', position: 'relative',
          }}
          onMouseEnter={(e) => { if (!hasActiveFilters) e.currentTarget.style.borderColor = '#ffffff'; }}
          onMouseLeave={(e) => { if (!hasActiveFilters) e.currentTarget.style.borderColor = '#6A7787'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="16" y2="12" />
            <line x1="4" y1="18" x2="12" y2="18" />
          </svg>
          {hasActiveFilters && (
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
          )}
        </button>
        {showFilters && (
          <div style={{
            position: 'absolute', top: '52px', left: 0, background: '#171D24',
            border: '1px solid #6A7787', borderRadius: '12px', padding: '16px',
            minWidth: '300px', maxHeight: '80vh', overflowY: 'auto',
            zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Фильтры</span>
              {hasActiveFilters && (
                <button onClick={() => { clearAllFilters(); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>
                  Сбросить все
                </button>
              )}
            </div>
            {filters.map((filter) => (
              <div key={filter.key} style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#6A7787', display: 'block', marginBottom: '6px', fontWeight: '600' }}>{filter.label}</label>
                {filter.type === 'select' ? (
                  <MultiSelect
                    options={filter.options}
                    selected={activeFilters[filter.key] || []}
                    onChange={(vals) => setFilter(filter.key, vals)}
                  />
                ) : filter.type === 'date' ? (
                  <DateRange
                    from={activeFilters[filter.key + 'From'] || ''}
                    to={activeFilters[filter.key + 'To'] || ''}
                    onFromChange={(v) => setFilter(filter.key + 'From', v)}
                    onToChange={(v) => setFilter(filter.key + 'To', v)}
                  />
                ) : filter.type === 'sort' ? (
                  <SingleSelect
                    options={filter.options.map(o => o.label)}
                    optionValues={filter.options.map(o => o.value)}
                    selected={activeFilters[filter.key] && activeFilters[filter.key].length > 0 ? activeFilters[filter.key][0] : (filter.options[0] ? filter.options[0].value : '')}
                    onChange={(val) => setFilter(filter.key, [val])}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6A7787" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 16px 10px 42px',
            background: '#171D24', border: '1px solid #6A7787',
            borderRadius: '10px', color: '#ffffff', fontSize: '14px',
            outline: 'none', boxSizing: 'border-box', height: '44px',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#6A7787', cursor: 'pointer',
              fontSize: '16px', padding: '4px',
            }}
          >✕</button>
        )}
      </div>
      {filteredCount !== null && (
        <span style={{ fontSize: '14px', color: '#6A7787', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {filteredCount} из {totalCount}
        </span>
      )}
    </div>
  );
}

function MultiSelect({ options, selected = [], onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  const allSelected = options.length > 0 && selected.length === options.length;
  return (
    <div>
      <div
        onClick={() => allSelected ? onChange([]) : onChange([...options])}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px',
          cursor: 'pointer', marginBottom: '4px',
        }}
      >
        <div style={{
          width: '16px', height: '16px', borderRadius: '4px',
          border: '2px solid ' + (allSelected ? '#ffffff' : '#6A7787'),
          background: allSelected ? '#333F50' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#ffffff', flexShrink: 0,
        }}>
          {allSelected && '✓'}
        </div>
        <span style={{ fontSize: '14px', color: '#6A7787', fontWeight: '600' }}>Все</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <div key={opt} onClick={() => toggle(opt)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px',
              borderRadius: '4px', cursor: 'pointer',
              background: isSelected ? 'rgba(51,63,80,0.4)' : 'transparent',
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '4px',
                border: '2px solid ' + (isSelected ? '#ffffff' : '#6A7787'),
                background: isSelected ? '#4A5A70' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#ffffff', flexShrink: 0,
              }}>
                {isSelected && '✓'}
              </div>
              <span style={{ fontSize: '14px', color: '#ffffff' }}>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SingleSelect({ options, optionValues, selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {options.map((opt, i) => {
        const val = optionValues ? optionValues[i] : opt;
        const isSelected = selected === val;
        return (
          <div key={val} onClick={() => onChange(val)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px',
            borderRadius: '4px', cursor: 'pointer',
            background: isSelected ? 'rgba(51,63,80,0.4)' : 'transparent',
          }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              border: '2px solid ' + (isSelected ? '#ffffff' : '#6A7787'),
              background: isSelected ? '#4A5A70' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />}
            </div>
            <span style={{ fontSize: '14px', color: '#ffffff' }}>{opt}</span>
          </div>
        );
      })}
    </div>
  );
}

function DateRange({ from, to, onFromChange, onToChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            const v = e.target.value;
            if (to && v && v > to) return;
            onFromChange(v);
          }}
          max={to || undefined}
          style={{
            flex: 1, padding: '8px 12px', background: '#11171F',
            border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            const v = e.target.value;
            if (from && v && v < from) return;
            onToChange(v);
          }}
          min={from || undefined}
          style={{
            flex: 1, padding: '8px 12px', background: '#11171F',
            border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: '#6A7787' }}>От</span>
        <span style={{ fontSize: '12px', color: '#6A7787' }}>До</span>
      </div>
    </div>
  );
}
