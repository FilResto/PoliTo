/* Data Access Object (DAO) module for accessing Q&A */
/* Initial version taken from exercise 4 (week 03) */
const sqlite = require('sqlite3');
const { Page, Block, Image } = require('../model/PageModel.js');
const { reject } = require('lodash');
const req = require('express/lib/request.js');
const dayjs = require('dayjs');


// open the database
const db = new sqlite.Database('cms.sqlite', (err) => {
  if (err) throw err;
});

/*---------------------------------PAGE---------------------------------------------------------------- */

//GET all the pages on the db
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
      resolve(pages);
    });
  });
}

//GET all the pages on the db but with joining authorId from pages and id from users
/*exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT pages.id as id, pages.title as title, users.username as authorName, pages.creationDate as creationDate, pages.publicationDate as publicationDate 
                FROM pages JOIN users ON pages.authorId = users.id`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorName, p.creationDate, p.publicationDate));
      resolve(pages);
    });
  });
}*/

//get a single page base on it's id
exports.getPage = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages WHERE id = ?';
    db.get(sql, [pageId], (err, row) => {
      if (err) {
        reject(err);
      }  if (row == undefined) {
        resolve({ error: 'Page not found.' });
      } else {
        const page = new Page(row.id, row.title, row.authorId, row.creationDate, row.publicationDate);
        resolve(page);
      }
    });
  });
}/*
exports.getPage = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT pages.id as id, pages.title as title, users.username as authorName, pages.creationDate as creationDate, pages.publicationDate as publicationDate 
                 FROM pages JOIN users ON pages.authorId = users.id 
                 WHERE pages.id = ?`;
    db.get(sql, [pageId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row == undefined) {
        resolve(null);
      } else {
        const page = new Page(row.id, row.title, row.authorName, row.creationDate, row.publicationDate);
        resolve(page);
      }
    });
  });
};*/

// Get the max "orders" value for a given page
exports.getMaxOrder = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT MAX(orders) as maxOrder FROM blocks WHERE pageId = ?';
    db.get(sql, [pageId], (err, row) => {
      if (err)
        reject(err);
      else
        resolve(row.maxOrder);
    });
  });
}

//get pages of an author
exports.listPagesOf = (authorId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages WHERE authorId = ?';
    db.all(sql, [authorId], (err, rows) => {
      if (err)
        reject(err);
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
      resolve(pages);
    });
  });
}


//create a page
exports.createPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pages(title, authorId, creationDate, publicationDate) VALUES(?,?,DATE(?),DATE(?))';
    db.run(sql, [page.title, page.authorId, page.creationDate, page.publicationDate ? page.publicationDate : null], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // return the last insert id
      }
    });
  });
}
//udate a page given it's id
exports.updatePage = (pageId, newPageData) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE pages SET title = ?, authorId=?, publicationDate = DATE(?) WHERE id = ?';
    db.run(sql, [newPageData.title, newPageData.authorId, newPageData.publicationDate ? newPageData.publicationDate : null, pageId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes); // return the number of rows changed
      }
    });
  });
}

exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM pages WHERE id = ?';
    db.run(sql, id, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};





/*---------------------------------BLOCK---------------------------------------------------------------- */

exports.getBlock = (pageId, blockId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE id = ? AND pageId = ?';
    db.get(sql, [blockId, pageId], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'Block not found.' });
      else {
        const block = new Block(row.id, row.pageId, row.type, row.content, row.orders)
        resolve(block);
      }
    });
  });
}
exports.listBlocksByPageId = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE pageId = ? ORDER BY orders ASC';
    db.all(sql, [pageId], (err, rows) => {
      if (err)
        reject(err);
      const blocks = rows.map((b) => new Block(b.id, b.pageId, b.type, b.content, b.orders))
      resolve(blocks);
    });
  });
}
exports.getBlockByOrder = (pageId, orders) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE pageId = ? AND orders = ?';
    db.get(sql, [pageId, orders], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve(null);
      else {
        const block = new Block(row.id, row.pageId, row.type, row.content, row.orders);
        resolve(block);
      }
    });
  });
}

exports.createBlock = (block) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO blocks(pageId, type, content, orders) VALUES(?,?,?,?)';
    db.run(sql, [block.pageId, block.type, block.content, block.orders], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // return the last insert id
      }
    });
  });
}

exports.updateBlock = (blockId, newBlockData) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE blocks SET pageId = ?, type = ?, content = ?, orders = ? WHERE id = ?';
    db.run(sql, [newBlockData.pageId, newBlockData.type, newBlockData.content, newBlockData.orders, blockId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes); // return the number of rows changed
      }
    });
  });
}

exports.deleteBlock = (blockId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM blocks WHERE id = ?';
    db.run(sql, [blockId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}


/*---------------------------------IMAGE---------------------------------------------------------------- */

exports.listImages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const images = rows.map((i) => new Image(i.id, i.url));
      resolve(images);
    });
  });
}
exports.getImage = (imageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images WHERE id = ?';
    db.get(sql, [imageId], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({ error: 'Page not found.' });
      else {
        const image = new Image(row.id, row.url);
        resolve(image);
      }
    });
  });
}

