const sqlite = require('sqlite3');
const {Website} = require('../model/WebsiteModel');

// open the database
const db = new sqlite.Database('cms.sqlite', (err) => {
    if (err) throw err;
});

// Update the name of the website
exports.updateWebsiteName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE website SET name = ? WHERE id = 1';
    db.run(sql, [name], function(err) {
      if (err)
        reject(err);
      else 
        resolve(this.changes);
    });
  });
};
// get the name of the website
exports.getWebsiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM website WHERE id = 1';
    db.get(sql, [], function(err, row) {
      if (err)
        reject(err);
      else{
        const website = new Website(row.id, row.name);
        resolve(website);
      } 
        
    });
  });
};

