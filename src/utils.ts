import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: any): string {
  if (!date) return '';
  // Handle Firestore Timestamp
  if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString('pt-BR');
  }
  // Handle Date object
  if (date instanceof Date) {
    return date.toLocaleDateString('pt-BR');
  }
  // Handle string fallback
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  return String(date);
}
