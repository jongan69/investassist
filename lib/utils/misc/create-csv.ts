/**
 * Utility functions for creating CSV data from various data structures
 */

/**
 * Options for CSV conversion
 */
export interface CsvOptions {
  /**
   * The character to use as the delimiter between fields
   * @default ','
   */
  delimiter?: string;
  
  /**
   * The character to use for quoting fields
   * @default '"'
   */
  quote?: string;
  
  /**
   * Whether to include headers in the CSV output
   * @default true
   */
  includeHeaders?: boolean;
  
  /**
   * Custom header names to use instead of object keys
   * @default undefined
   */
  headers?: string[];
  
  /**
   * Whether to escape quotes in the data
   * @default true
   */
  escapeQuotes?: boolean;
}

/**
 * Default options for CSV conversion
 */
const defaultOptions: CsvOptions = {
  delimiter: ',',
  quote: '"',
  includeHeaders: true,
  escapeQuotes: true,
};

/**
 * Escapes a string for CSV format
 * @param value The string to escape
 * @param options CSV options
 * @returns Escaped string
 */
function escapeCsvValue(value: string, options: CsvOptions): string {
  const { quote = '"', escapeQuotes = true } = options;
  
  // If the value contains the delimiter, quotes, or newlines, it needs to be quoted
  const needsQuoting = value.includes(options.delimiter || ',') || 
                       value.includes(quote) || 
                       value.includes('\n') || 
                       value.includes('\r');
  
  if (!needsQuoting) {
    return value;
  }
  
  // Escape quotes by doubling them
  if (escapeQuotes) {
    value = value.replace(new RegExp(quote, 'g'), `${quote}${quote}`);
  }
  
  // Wrap the value in quotes
  return `${quote}${value}${quote}`;
}

/**
 * Converts a value to a string for CSV
 * @param value Any value to convert
 * @param options CSV options
 * @returns String representation for CSV
 */
function valueToString(value: any, options: CsvOptions): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    // Handle arrays and objects more intelligently
    if (Array.isArray(value)) {
      return value.map(item => valueToString(item, options)).join('; ');
    } else if (value instanceof Date) {
      return value.toISOString();
    } else {
      // For objects, try to create a more readable string representation
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Object]';
      }
    }
  }
  
  return escapeCsvValue(String(value), options);
}

/**
 * Converts an array of objects to CSV
 * @param data Array of objects to convert
 * @param options CSV options
 * @returns CSV string
 */
export function objectsToCsv<T extends Record<string, any>>(
  data: T[],
  options: CsvOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  
  if (!data.length) {
    return '';
  }
  
  const rows: string[] = [];
  
  // Get headers from the first object
  const headers = opts.headers || Object.keys(data[0]);
  
  // Add header row if needed
  if (opts.includeHeaders) {
    const headerRow = headers
      .map(header => escapeCsvValue(header, opts))
      .join(opts.delimiter);
    rows.push(headerRow);
  }
  
  // Add data rows
  for (const item of data) {
    const row = headers
      .map(header => valueToString(item[header], opts))
      .join(opts.delimiter);
    rows.push(row);
  }
  
  return rows.join('\n');
}

/**
 * Converts a 2D array to CSV
 * @param data 2D array to convert
 * @param options CSV options
 * @returns CSV string
 */
export function arrayToCsv(
  data: any[][],
  options: CsvOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  
  if (!data.length) {
    return '';
  }
  
  const rows: string[] = [];
  
  // Add data rows
  for (const row of data) {
    const csvRow = row
      .map(cell => valueToString(cell, opts))
      .join(opts.delimiter);
    rows.push(csvRow);
  }
  
  return rows.join('\n');
}

/**
 * Converts data to CSV format
 * @param data Data to convert
 * @param options CSV options
 * @returns CSV string
 */
export function toCsv(
  data: any,
  options: CsvOptions = {}
): string {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Handle different data types
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      return objectsToCsv(data, mergedOptions);
    } else {
      return arrayToCsv([data], mergedOptions);
    }
  } else if (typeof data === 'object' && data !== null) {
    // For a single object, convert it to an array with one item
    return objectsToCsv([data], mergedOptions);
  } else {
    // For primitive values, just convert to string
    return valueToString(data, mergedOptions);
  }
}

/**
 * Downloads data as a CSV file
 * @param data Data to convert to CSV
 * @param filename Name of the file to download
 * @param options CSV options
 */
export function downloadCsv(
  data: any,
  filename: string,
  options: CsvOptions = {}
): void {
  const csv = toCsv(data, options);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // Browser supports download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback for browsers that don't support download attribute
    window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  }
}
