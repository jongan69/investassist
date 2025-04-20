/**
 * Checks if the input is a JSON array of objects
 * @param data - The data to check
 * @returns boolean indicating if the data is a JSON array of objects
 */
export function isJsonArrayOfObjects(data: unknown): boolean {
  // Check if data is an array
  if (!Array.isArray(data)) {
    return false;
  }

  // Check if array is empty
  if (data.length === 0) {
    return false;
  }

  // Check if all elements are objects
  return data.every((item) => {
    return (
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      Object.keys(item).length > 0
    );
  });
}
