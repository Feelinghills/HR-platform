export const getCategoryColor = (category) => {
  switch(category) {
    case 'Soft Skills': return '#dbeafe';
    case 'Backend': return '#d1fae5';
    case 'Database': return '#fef3c7';
    case 'Frontend': return '#fce7f3';
    case 'DevOps': return '#e0e7ff';
    case 'Data': return '#e0f2fe';
    default: return '#f1f5f9';
  }
};

export const getCategoryTextColor = (category) => {
  switch(category) {
    case 'Soft Skills': return '#1d4ed8';
    case 'Backend': return '#065f46';
    case 'Database': return '#92400e';
    case 'Frontend': return '#9d174d';
    case 'DevOps': return '#3730a3';
    case 'Data': return '#0369a1';
    default: return '#475569';
  }
};
