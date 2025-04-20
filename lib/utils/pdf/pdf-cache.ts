import { LRUCache } from 'lru-cache';
import { PdfDocument } from './types';

/**
 * Generates a cache key for a PDF document
 * @param pdfData The PDF document data
 * @returns A unique cache key
 */
export function generateCacheKey(pdfData: PdfDocument): string {
  return `${pdfData.documentUrl}-${pdfData.name}-${pdfData.filingYear}-${pdfData.filingType}`;
} 

// Create a cache for processed PDFs to avoid redundant processing
export const pdfCache = new LRUCache<string, PdfDocument>({
  max: 500, // Increased from 100 to 500 items
  ttl: 1000 * 60 * 60 * 24 * 7, // Increased from 24 hours to 7 days
  updateAgeOnGet: true,
});