'use strict';

const { db } = require('../db');
const crypto = require('crypto');
const {User} = require('../model/UserModel');

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.username, role: row.role};
        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.username, name: row.name};
        resolve(user);
      }
    });
  });
};

exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users ';
    db.all(sql, [], (err, rows) => {
      if (err) { 
        reject(err); 
      } else {
        const users = rows.map((u)=> new User(u.id, u.username, u.role));
        resolve(users);
      }
    });
  });
};


exports.checkIfAuthorExists = (authorId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) FROM users WHERE id = ?';
    db.get(sql, [authorId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row['COUNT(*)'] > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};