/**
 * Extracts a user-friendly message from an Axios error or unknown error.
 * @param {unknown} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};

/**
 * Returns the HTTP status code from an Axios error, or undefined.
 * @param {unknown} error
 * @returns {number|undefined}
 */
export const getStatusCode = (error) => error?.response?.status;
