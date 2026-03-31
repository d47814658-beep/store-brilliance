export const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
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
