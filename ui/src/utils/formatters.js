export const formatDate = (isoString) => {
  if (!isoString) return '—';
  try { return new Date(isoString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return isoString; }
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  try { return new Date(isoString).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return isoString; }
};

export const formatPhone = (phone) => {
  if (!phone) return '—';
  const p = phone.replace(/\D/g, '');
  if (p.length <= 1) return '+' + p;
  if (p.length <= 4) return '+' + p.slice(0,1) + ' (' + p.slice(1) + ')';
  if (p.length <= 7) return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4);
  return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4,7) + '-' + p.slice(7,9) + '-' + p.slice(9);
};
