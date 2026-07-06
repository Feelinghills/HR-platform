import React from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, onClose, menuItems, currentPage, onPageChange }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <aside className="sidebar">
        <button className="sidebar-close" onClick={onClose}>
          ✕
        </button>
        <div className="sidebar-header">
          <h2>Меню</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${currentPage === item.path ? 'active' : ''}`}
              onClick={() => onPageChange(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">v1.0.0</div>
      </aside>
    </>
  );
}

export default Sidebar;