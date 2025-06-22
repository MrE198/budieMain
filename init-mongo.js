db = db.getSiblingDB('budie');

db.createUser({
  user: 'budie',
  pwd: 'budie_password',
  roles: [
    {
      role: 'readWrite',
      db: 'budie'
    }
  ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('events');
db.createCollection('reminders');
db.createCollection('integrations');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'integrations.google.id': 1 });
db.tasks.createIndex({ userId: 1, status: 1 });
db.tasks.createIndex({ userId: 1, dueDate: 1 });
db.events.createIndex({ userId: 1, startTime: 1 });
db.reminders.createIndex({ userId: 1, time: 1, status: 1 });