// MongoDB initialization script
// This script creates the application database and user

// Switch to the application database
db = db.getSiblingDB('web-scraping-auth');

// Create application user with read/write permissions
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'web-scraping-auth',
    },
  ],
});

// Create initial collections with proper indexes
db.createCollection('users');
db.createCollection('blacklistedtokens');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.blacklistedtokens.createIndex({ token: 1 }, { unique: true });
db.blacklistedtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Database initialization completed successfully!');
