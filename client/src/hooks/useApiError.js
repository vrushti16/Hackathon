import { useCallback } from 'react';
import { useFleet } from '../context/FleetContext';

export const useApiError = () => {
  const { addToast } = useFleet();

  const handleApiError = useCallback((error, fallbackMessage = 'An unexpected error occurred') => {
    let message = fallbackMessage;

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 422:
          message = 'Invalid data provided. Please check your inputs.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
        case 503:
          message = 'Server is currently unavailable. We are working on it.';
          break;
        default:
          message = error.response.data?.message || fallbackMessage;
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection and try again.';
    } else {
      message = error.message || fallbackMessage;
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }

    if (addToast) {
      addToast(message, 'danger');
    }

    return message;
  }, [addToast]);

  return { handleApiError };
};
