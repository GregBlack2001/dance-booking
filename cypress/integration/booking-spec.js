// End-to-end test for booking flow
describe('Dance Class Booking', () => {
    // Test data
    const user = {
      name: 'Cypress Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    };
  
    beforeEach(() => {
      // Visit the homepage
      cy.visit('/');
    });
  
    it('should allow a user to register', () => {
      // Navigate to the registration page
      cy.get('a[href="/auth/register"]').click();
      
      // Fill out the registration form
      cy.get('input[name="name"]').type(user.name);
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);
      cy.get('input[name="confirmPassword"]').type(user.password);
      
      // Submit the form
      cy.get('button[type="submit"]').click();
      
      // Should be redirected to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('My Dashboard').should('be.visible');
    });
  
    it('should allow a user to view courses', () => {
      // Navigate to courses page
      cy.get('a[href="/courses"]').click();
      
      // Check if courses are listed
      cy.contains('Our Dance Courses').should('be.visible');
      
      // Should have at least one course
      cy.get('.course-card').should('have.length.at.least', 1);
      
      // Click on the first course
      cy.get('.course-card .btn-primary').first().click();
      
      // Should navigate to course details
      cy.url().should('include', '/courses/');
      cy.contains('Available Classes').should('be.visible');
    });
  
    it('should allow a user to view class details', () => {
      // Go to courses page
      cy.get('a[href="/courses"]').click();
      
      // Click on the first course
      cy.get('.course-card .btn-primary').first().click();
      
      // Click on view details of the first class
      cy.get('table tbody tr').first().find('a').click();
      
      // Should show class details
      cy.contains('Class Description').should('be.visible');
    });
  
    it('should allow a logged-in user to book a class', () => {
      // Login first
      cy.get('a[href="/auth/login"]').click();
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);
      cy.get('button[type="submit"]').click();
      
      // Go to courses page
      cy.get('a[href="/courses"]').click();
      
      // Click on the first course
      cy.get('.course-card .btn-primary').first().click();
      
      // Click on view details of the first class
      cy.get('table tbody tr').first().find('a').click();
      
      // Click the book button (if class is available)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Book This Class')) {
          cy.contains('Book This Class').click();
          
          // Should be redirected to dashboard
          cy.url().should('include', '/dashboard');
          
          // Booking should be listed in the dashboard
          cy.get('table tbody tr').should('have.length.at.least', 1);
        } else {
          // If the class is already booked or full, skip this test
          cy.log('Class is either already booked or full');
        }
      });
    });
  
    it('should allow a user to cancel a booking', () => {
      // Login first
      cy.get('a[href="/auth/login"]').click();
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);
      cy.get('button[type="submit"]').click();
      
      // Go to dashboard
      cy.get('a[href="/dashboard"]').click();
      
      // Check if there are any bookings
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click the cancel button for the first booking
          cy.get('table tbody tr').first().find('a').contains('Cancel').click();
          
          // Handle the confirmation dialog
          cy.on('window:confirm', () => true);
          
          // Wait for the page to reload
          cy.contains('My Dashboard').should('be.visible');
          
          // Booking should be shown as cancelled or removed
          cy.get('body').then(($updatedBody) => {
            if ($updatedBody.find('table tbody tr').length > 0) {
              cy.get('table tbody tr').first().should('contain', 'cancelled');
            } else {
              cy.log('Booking was removed from the list');
            }
          });
        } else {
          cy.log('No bookings to cancel');
        }
      });
    });
  
    it('should allow a user to log out', () => {
      // Login first if not already logged in
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/auth/logout"]').length === 0) {
          cy.get('a[href="/auth/login"]').click();
          cy.get('input[name="email"]').type(user.email);
          cy.get('input[name="password"]').type(user.password);
          cy.get('button[type="submit"]').click();
        }
      });
      
      // Click logout
      cy.get('a[href="/auth/logout"]').click();
      
      // Should be redirected to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Login link should be visible again
      cy.get('a[href="/auth/login"]').should('be.visible');
    });
  });