import { Transaction } from '../models/finance.models';

export function exportData(
  data: Transaction[],
  format: 'json' | 'csv',
  filenamePrefix = 'ledger_export'
): void {
  let content = '';
  let mimeType = '';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${timestamp}.${format}`;

  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
  } else {
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'Type', 'Status', 'Note'];
    const rows = data.map((t) =>
      [
        t.id,
        t.date,
        `"${t.merchant.replace(/"/g, '""')}"`,
        t.category,
        t.amount,
        t.type,
        t.status,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(',')
    );
    content = [headers.join(','), ...rows].join('\n');
    mimeType = 'text/csv';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
