/**
 * Utility functions for environment detection
 */

/**
 * Checks if the application is running in a local development environment
 * @returns {boolean} True if running on localhost
 */
// export const isLocalDevelopment = (): boolean => {
//   const hostname = window.location.hostname;
//   return hostname === 'localhost' || hostname === '127.0.0.1';
// };

/**
 * Checks if authentication should be bypassed based on the environment variable
 * @returns {boolean} True if authentication should be bypassed
 */
export const shouldBypassAuth = (): boolean => {
  return import.meta.env.VITE_BYPASS_AUTH === 'true';
};
