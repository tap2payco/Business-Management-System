
require('dotenv').config();
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'undefined');
