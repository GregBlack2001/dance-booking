/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    console.error('Error:', err);
  
    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
  
    // Check content type
    const isApiRequest = req.originalUrl.startsWith('/api');
  
    if (isApiRequest) {
      // API response
      return res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
      });
    }
  
    // HTML response
    if (statusCode === 404) {
      return res.status(404).render('404', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist'
      });
    }
  
    if (statusCode === 403) {
      return res.status(403).render('403', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page'
      });
    }
  
    // Default error page
    res.status(statusCode).render('error', {
      title: 'Error',
      message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  };
  
  module.exports = errorHandler;