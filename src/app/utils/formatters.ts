export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    return `₹${amount}`;
  }
}

export function formatCompactNumber(number: number): string {
  if (number === 0) return '₹0';
  const isNegative = number < 0;
  const absNum = Math.abs(number);
  let formatted: string;
  if (absNum >= 10000000) formatted = `₹${(absNum / 10000000).toFixed(1)}Cr`;
  else if (absNum >= 100000) formatted = `₹${(absNum / 100000).toFixed(1)}L`;
  else if (absNum >= 1000) formatted = `₹${(absNum / 1000).toFixed(0)}k`;
  else formatted = `₹${absNum}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatDate(dateString: string, format: 'short' | 'medium' = 'medium'): string {
  try {
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
}
