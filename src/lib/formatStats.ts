
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'TZS') => {
  if (amount === null || amount === undefined) {
    return '0.00';
  }
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '0.00';
  }

  // Format with thousand separators: 100,000.00
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(Number(num));
}
