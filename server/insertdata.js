'use strict';

const { db } = require('./db');
const crypto = require('crypto');

const insertUser = (email, password, username, role) => {
    const salt = crypto.randomBytes(8).toString('hex');
    const hashedPassword = crypto.scryptSync(password, salt, 32).toString('hex');
    
    const sql = 'INSERT INTO users (email, password, salt, username, role) VALUES (?, ?, ?, ?, ?)';
    const values = [email, hashedPassword, salt, username, role];
  
    db.run(sql, values, (err) => {
      if (err) throw err;
      console.log(`User ${email} inserted successfully.`);
    });
  };

insertUser('admin@gmail.com', 'adminadmin', 'Admin', 'admin');
insertUser('user1@gmail.com', 'user1user1', 'User1', 'user');
insertUser('user2@gmail.com', 'user2user2', 'User2', 'user');
insertUser('user3@gmail.com', 'user3user3', 'User3', 'user');

const deleteAllUsers = () => {
    const sql = 'DELETE FROM users';
    
    db.run(sql, (err) => {
      if (err) throw err;
      console.log('All users deleted successfully.');
    });
  };
  
//deleteAllUsers();