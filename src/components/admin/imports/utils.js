export const getStatusColor = (status) => {
  switch (status) {
    case 'NEW': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', label: 'Nuevo' };
    case 'MODIFIED': return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a', label: 'Cambio' };
    case 'UNCHANGED': return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'Intacto' };
    case 'ALERT': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Alerta / Quarantena' };
    default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'Info' };
  }
};
