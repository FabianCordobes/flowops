
export const colors = {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#EFF6FF',
  
    background: '#F6F8FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
  
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',
  
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
  
    success: '#15803D',
    successSoft: '#DCFCE7',
  
    warning: '#A16207',
    warningSoft: '#FEF3C7',
  
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
  
    info: '#1D4ED8',
    infoSoft: '#DBEAFE',
  
    transparent: 'transparent',
  } as const;
  
  export const statusColors = {
    NEW: {
      text: '#475569',
      background: '#F1F5F9',
      dot: '#64748B',
    },
    ASSIGNED: {
      text: '#1D4ED8',
      background: '#DBEAFE',
      dot: '#2563EB',
    },
    IN_PROGRESS: {
      text: '#0369A1',
      background: '#E0F2FE',
      dot: '#0284C7',
    },
    IN_REVIEW: {
      text: '#92400E',
      background: '#FEF3C7',
      dot: '#D97706',
    },
    COMPLETED: {
      text: '#166534',
      background: '#DCFCE7',
      dot: '#16A34A',
    },
  } as const;
  
  export const priorityColors = {
    LOW: {
      text: '#475569',
      background: '#F1F5F9',
    },
    MEDIUM: {
      text: '#1D4ED8',
      background: '#DBEAFE',
    },
    HIGH: {
      text: '#92400E',
      background: '#FEF3C7',
    },
    URGENT: {
      text: '#B91C1C',
      background: '#FEE2E2',
    },
  } as const;
  