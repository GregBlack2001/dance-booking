// Main JavaScript file for the Dance Class Booking application

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap tooltips
    initTooltips();
    
    // Initialize delete buttons for admin
    initDeleteButtons();
    
    // Highlight the current nav item
    highlightCurrentNav();
    
    // Initialize auto-dismissing alerts
    initAlertDismiss();
  });
  
  /**
   * Initialize Bootstrap tooltips
   */
  function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  /**
   * Handle admin delete functionalities
   */
  function initDeleteButtons() {
    // Course delete buttons
    const courseDeleteBtns = document.querySelectorAll('.course-delete-btn');
    courseDeleteBtns.forEach(btn => {
      btn.addEventListener('click', handleCourseDelete);
    });
    
    // Class delete buttons
    const classDeleteBtns = document.querySelectorAll('.class-delete-btn');
    classDeleteBtns.forEach(btn => {
      btn.addEventListener('click', handleClassDelete);
    });
    
    // Admin toggle buttons
    const adminToggleBtns = document.querySelectorAll('.admin-toggle-btn');
    adminToggleBtns.forEach(btn => {
      btn.addEventListener('click', handleAdminToggle);
    });
  }
  
  /**
   * Handle course deletion
   */
  async function handleCourseDelete(e) {
    e.preventDefault();
    
    const courseId = this.dataset.courseId;
    const courseName = this.dataset.courseName;
    
    if (!confirm(`Are you sure you want to delete the course "${courseName}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the course from the DOM
        const courseElement = document.getElementById(`course-${courseId}`);
        if (courseElement) {
          courseElement.remove();
        }
        
        // Show success message
        showAlert('success', `Course "${courseName}" has been deleted successfully.`);
      } else {
        showAlert('danger', data.message || 'Failed to delete course.');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showAlert('danger', 'An error occurred while deleting the course.');
    }
  }
  
  /**
   * Handle class deletion
   */
  async function handleClassDelete(e) {
    e.preventDefault();
    
    const classId = this.dataset.classId;
    const className = this.dataset.className;
    
    if (!confirm(`Are you sure you want to delete the class "${className}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/admin/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the class from the DOM
        const classElement = document.getElementById(`class-${classId}`);
        if (classElement) {
          classElement.remove();
        }
        
        // Show success message
        showAlert('success', `Class "${className}" has been deleted successfully.`);
      } else {
        showAlert('danger', data.message || 'Failed to delete class.');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      showAlert('danger', 'An error occurred while deleting the class.');
    }
  }
  
  /**
   * Handle admin toggle
   */
  async function handleAdminToggle(e) {
    e.preventDefault();
    
    const userId = this.dataset.userId;
    const userName = this.dataset.userName;
    
    try {
      const response = await fetch(`/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update button text
        this.textContent = data.role === 'admin' ? 'Remove Admin' : 'Make Admin';
        
        // Update user role badge
        const roleBadge = document.querySelector(`#user-${userId} .role-badge`);
        if (roleBadge) {
          roleBadge.textContent = data.role;
          roleBadge.className = `role-badge badge ${data.role === 'admin' ? 'bg-danger' : 'bg-primary'}`;
        }
        
        // Show success message
        showAlert('success', data.message);
      } else {
        showAlert('danger', data.message || 'Failed to update user role.');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showAlert('danger', 'An error occurred while updating user role.');
    }
  }
  
  /**
   * Highlight the current nav item based on URL
   */
  function highlightCurrentNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || 
          (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      }
    });
  }
  
  /**
   * Initialize auto-dismissing alerts
   */
  function initAlertDismiss() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    
    alerts.forEach(alert => {
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }, 5000); // Auto-dismiss after 5 seconds
    });
  }
  
  /**
   * Show an alert to the user
   */
  function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    
    // Set alert content
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find the alert container or create one
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alert-container';
      alertContainer.className = 'container mt-3';
      
      // Insert at the top of the main content
      const mainContent = document.querySelector('main');
      mainContent.insertBefore(alertContainer, mainContent.firstChild);
    }
    
    // Add the alert to the container
    alertContainer.appendChild(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }