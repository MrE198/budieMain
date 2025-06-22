require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('JWT')));