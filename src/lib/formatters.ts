export const formatCFA = (amount: number): string => {
  return (amount || 0).toLocaleString('en-US').replace(/,/g, ' ') + ' FCFA';
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Porto-Novo',
  }).format(new Date(date));
};

export const formatDateShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeZone: 'Africa/Porto-Novo',
  }).format(new Date(date));
};
