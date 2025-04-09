# Dance Class Booking System

A web application for managing dance class bookings. This project is built using the MVC architecture with Node.js, Express, and NeDB.

## Features

- **User Authentication**: Register, login, and user profiles
- **Course Management**: Browse available dance courses
- **Class Booking**: Book and cancel dance classes
- **Admin Dashboard**: Manage courses, classes, and users
- **Responsive Design**: Mobile-friendly interface

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: NeDB (embedded NoSQL database)
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Frontend**: Bootstrap 5, Mustache templates
- **Testing**: Jest for unit/integration tests, Cypress for E2E tests

## Project Structure

```
dance-class-booking/
├── models/            # Database models
├── controllers/       # Controller logic
├── routes/            # Express routes
├── middleware/        # Custom middleware
├── views/             # Mustache templates
├── public/            # Static files (CSS, JS, images)
├── config/            # Configuration files
├── utils/             # Utility functions
├── __tests__/         # Jest tests
├── cypress/           # Cypress e2e tests
└── scripts/           # Utility scripts
```

## Setup Instructions

### Prerequisites

- Node.js 14.x or higher
- npm

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd dance-class-booking
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h
   COOKIE_SECRET=your_secure_cookie_secret
   DB_PATH=./data
   ```

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Default Users

After seeding the database, you can log in with the following credentials:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

- **Regular User**:
  - Email: user@example.com
  - Password: user123

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run Jest tests
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests in headless mode
- `npm run seed` - Seed the database with initial data

## MVC Architecture

This application follows the Model-View-Controller (MVC) architecture:

- **Models**: Define data structures and handle database operations
- **Views**: Mustache templates for rendering HTML
- **Controllers**: Handle business logic and process requests

## Security Features

- Password hashing with bcrypt
- JWT authentication with secure cookies
- CSRF protection
- Input validation
- XSS protection with Helmet
- Secure HTTP headers

## Testing

### Unit and Integration Tests

Run Jest tests with:
```
npm test
```

### End-to-End Tests

Run Cypress tests with:
```
npm run cypress:open
```

## License

This project is licensed under the ISC License.

## Coursework Project

This is a coursework project for a Web Application Development module.