/**
 * Tailwind CSS Class Name Merger Utility
 * 
 * Merges Tailwind classes while handling conflicts correctly
 * Uses clsx and tailwind-merge
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
