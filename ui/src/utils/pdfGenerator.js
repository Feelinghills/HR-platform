import { formatPhone, formatDate, formatDateTime } from './formatters';

export const generatePDF = (type, interview, candidates) => {
  const candidate = candidates.find(c => c.id === interview.candidateId);
  const currentDate = new Date().toLocaleDateString('ru-RU');
  let content = '', title = '';
  switch(type) {
    case 'Карточка кандидата':
      title = 'КАРТОЧКА КАНДИДАТА';
      content = `ФИО: ${candidate ? candidate.name : 'Не указано'}\nТелефон: ${candidate ? formatPhone(candidate.phone) : 'Не указано'}\nГород: ${candidate ? candidate.city : 'Не указано'}\nВакансия: ${interview.vacancy}\nОпыт работы: ${candidate ? candidate.experience : 'Не указано'}\nОбразование: ${candidate ? candidate.education : 'Не указано'}\nПредыдущее место работы: ${candidate ? candidate.previousJob : 'Не указано'}\nНавыки: ${candidate && candidate.skills ? candidate.skills.join(', ') : 'Не указаны'}`;
      break;
    case 'Протокол собеседования':
      title = 'ПРОТОКОЛ СОБЕСЕДОВАНИЯ';
      content = `Кандидат: ${interview.candidateName}\nВакансия: ${interview.vacancy}\nИнтервьюер: ${interview.interviewer}\nДата: ${interview.date}\nВремя: ${interview.time}\nСтатус: ${interview.status}\nРешение: ${interview.decision || 'Ожидается'}\nКомментарии: ${interview.comments || 'Нет комментариев'}`;
      break;
    case 'Письмо о решении':
      title = 'ПИСЬМО О РЕШЕНИИ';
      const decisionText = interview.decision === 'Принят' ? 'Поздравляем! Вы приняты.' : interview.decision === 'Отказан' ? 'К сожалению, мы вынуждены отказать.' : 'Решение ещё не принято.';
      content = `Дата: ${currentDate}\nКандидат: ${interview.candidateName}\nВакансия: ${interview.vacancy}\nРешение: ${interview.decision || 'Ожидается'}\n${decisionText}`;
      break;
    default: return;
  }
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:Arial;padding:40px;max-width:700px;margin:0 auto;color:#1e293b} h1{text-align:center;font-size:24px;border-bottom:2px solid #1e293b;padding-bottom:12px;margin-bottom:24px;text-transform:uppercase;letter-spacing:1px} .header{text-align:center;font-size:14px;color:#64748b;margin-bottom:32px} .row{display:flex;padding:10px 0;border-bottom:1px solid #e2e8f0} .label{font-weight:600;width:180px;flex-shrink:0;color:#475569} .value{color:#0f172a} .footer{margin-top:40px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px} .signature{margin-top:32px;display:flex;justify-content:space-between;font-size:14px} .signature-line{border-top:1px solid #1e293b;width:200px;padding-top:4px} .decision-box{margin-top:20px;padding:16px;background:${interview.decision === 'Принят' ? '#dcfce7' : interview.decision === 'Отказан' ? '#fee2e2' : '#fef9c3'};border-radius:8px;text-align:center;font-weight:600;font-size:18px} .company-name{text-align:center;font-size:18px;font-weight:700;color:#1e293b;margin-bottom:8px}
      </style></head><body>
      <div class="company-name">HR-platform</div><h1>${title}</h1><div class="header">Дата генерации: ${currentDate}</div>
      ${content.split('\n').filter(line => line.trim()).map(line => {
        const [label, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (label && value) return `<div class="row"><span class="label">${label.trim()}:</span><span class="value">${value}</span></div>`;
        return '';
      }).join('')}
      ${type === 'Письмо о решении' ? `<div class="decision-box">${interview.decision === 'Принят' ? 'ПРИНЯТ' : interview.decision === 'Отказан' ? 'ОТКАЗАН' : 'ОЖИДАЕТ РЕШЕНИЯ'}</div>` : ''}
      <div class="signature"><div><span>Подпись: </span><span class="signature-line">&nbsp;</span></div><div><span>Дата: </span><span class="signature-line">&nbsp;</span></div></div>
      <div class="footer">Документ сгенерирован в системе HR-platform</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  } else {
    alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
  }
};
