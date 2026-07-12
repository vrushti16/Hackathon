import { toast } from 'react-hot-toast';

export const handleApiError = (error, fallbackMessage = 'An unexpected error occurred') => {
  let message = fallbackMessage;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
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
    // The request was made but no response was received
    message = 'Network error. Please check your connection and try again.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message || fallbackMessage;
  }

  // Only log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Always show user-friendly message
  toast.error(message);
  
  return message;
};
