import React, { useState } from 'react';
import './AddCandidateModal.css';

function AddCandidateModal({ isOpen, onClose, onAdd, vacancies }) {
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    phone: '',
    vacancy: '',
    city: '',
    education: '',
    experience: '',
    previousJob: '',
    skills: ''
  });
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация телефона
    if (!validatePhone(newCandidate.phone)) {
      setPhoneError('Введите корректный номер телефона (10-15 цифр)');
      return;
    }
    setPhoneError('');

    onAdd(newCandidate);
    setNewCandidate({
      name: '',
      phone: '',
      vacancy: '',
      city: '',
      education: '',
      experience: '',
      previousJob: '',
      skills: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новый кандидат</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ФИО *</label>
            <input
              type="text"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
              placeholder="Иванов Иван Иванович"
              required
              pattern="^[А-Яа-яЁёA-Za-z]+\s[А-Яа-яЁёA-Za-z]+\s?[А-Яа-яЁёA-Za-z]*$"
              title="Введите минимум два слова (Имя Фамилия)"
            />
          </div>

          <div className="form-group">
            <label>Номер телефона *</label>
            <input
              type="tel"
              value={newCandidate.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setNewCandidate({ ...newCandidate, phone: value });
                setPhoneError('');
              }}
              placeholder="89991234567"
              required
            />
            {phoneError && <p className="error-text">{phoneError}</p>}
          </div>

          <div className="form-group">
            <label>Вакансия *</label>
            <select
              value={newCandidate.vacancy}
              onChange={(e) => setNewCandidate({ ...newCandidate, vacancy: e.target.value })}
              required
            >
              <option value="">Выберите вакансию</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy} value={vacancy}>{vacancy}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Город *</label>
            <input
              type="text"
              value={newCandidate.city}
              onChange={(e) => setNewCandidate({ ...newCandidate, city: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Образование *</label>
            <input
              type="text"
              value={newCandidate.education}
              onChange={(e) => setNewCandidate({ ...newCandidate, education: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Опыт работы *</label>
            <input
              type="text"
              value={newCandidate.experience}
              onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Предыдущее место работы</label>
            <input
              type="text"
              value={newCandidate.previousJob}
              onChange={(e) => setNewCandidate({ ...newCandidate, previousJob: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Навыки (через запятую)</label>
            <input
              type="text"
              value={newCandidate.skills}
              onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
              placeholder="Например: Python, SQL, Java"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-add">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCandidateModal;