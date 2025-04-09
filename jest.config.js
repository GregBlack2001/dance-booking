module.exports = {
    // The test environment that will be used for testing
    testEnvironment: 'node',
    
    // The glob patterns Jest uses to detect test files
    testMatch: [
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
    
    // An array of regexp pattern strings that are matched against all test paths
    testPathIgnorePatterns: [
      '/node_modules/',
      '/cypress/'
    ],
    
    // Indicates whether each individual test should be reported during the run
    verbose: true,
    
    // A list of paths to directories that Jest should use to search for files in
    roots: [
      '<rootDir>'
    ],
    
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    
    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',
    
    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/coverage/',
      '/cypress/',
      '/__tests__/'
    ],
    
    // The test timeout in milliseconds
    testTimeout: 30000
  };