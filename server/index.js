'use strict';
const { Page, Block } = require('./model/PageModel');
const { Website } = require('./model/WebsiteModel');

const express = require('express');
const morgan = require('morgan');//simplifies the process of logging requests to your application
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const dao = require('./dao/pageblock-dao')
const userDao = require('./dao/user-dao')
const adminDao = require('./dao/admin-dao')

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');// username and password, strat for authentication
const session = require('express-session');

// init express
const app = new express();
const port = 3001;


// set up middlewares
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true//cuzwe need to handle and accept cookies from other domains
}
app.use(cors(corsOptions));

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password)
  if (!user)
    return cb(null, false, 'Incorrect username or password.');

  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {//next is a middleware, you can copy and paste this in your 
  if (req.isAuthenticated()) {           //app(it's always the same), in orders to protect a function
    return next();// call the next method
  }
  return res.status(401).json({ error: 'Not authorized' });
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(passport.authenticate('session'));

const checkPageOwnership = async (req, res, next) => {
  const pageId = req.params.id;
  const page = await dao.getPage(pageId);

  if (!page) {
    return res.status(404).json({ error: 'Page not found.' });
  }

  // Allow the admin to update any page
  if (req.user.role === 'admin') {
    return next();
  }

  // If user is not admin, they can only update their own pages
  if (page.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  return next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Permission denied. User is not an admin.' });
  }
};
const checkBlockOwnership = async (req, res, next) => {
  const {id, blockId} = req.params;
  const block = await dao.getBlock(id ,blockId);


  const page = await dao.getPage(block.pageId);

  if (!page) {
    return res.status(404).json({ error: 'Page not found.' });
  }

  // Allow the admin to update any block
  if (req.user.role === 'admin') {
    return next();
  }

  // If user is not admin, they can only update their own blocks
  if (page.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  return next();
};



/* ROUTES */

/*---------------------------------------------PAGES--------------------------------------------- */

// GET /api/pages
// Purpose: retrieves all pages from the database
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await dao.listPages();
    res.status(200).json(pages);
  } catch (err) {
    res.status(500).json({ error: 'Database error during the retrieval of pages' });
  }
});
// GET /api/pages/:id
// Purpose: retrieves a specific page from the database by its id
app.get('/api/pages/:id', async (req, res) => {
  const pageId = req.params.id;
  try {
    const page = await dao.getPage(pageId);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
    } else {
      res.status(200).json(page);
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error during the retrieval of the page' });
  }
});


app.post('/api/pages', isLoggedIn, [
  check('title').notEmpty(),
  check('authorId').optional(),
  check('creationDate').notEmpty().isDate({ format: 'YYYY-MM-DD', strictMode: true }),
  check('publicationDate').optional({ nullable: true ,checkFalsy: true}).isDate({ format: 'YYYY-MM-DD', strictMode: true })
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let newPage = req.body;
  if (!newPage.authorId) {
    newPage.authorId = req.user.id;
  }
  try {
    // Check if authorId exists in database
    const authorExists = await userDao.checkIfAuthorExists(newPage.authorId);
    if (!authorExists) {
      return res.status(404).json({ error: 'Invalid authorId.' });
    }
    const id = await dao.createPage(newPage);
    res.status(201).json({id:id});
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: 'Impossible to create the page.' });
  }
});

app.put('/api/pages/:id', isLoggedIn, checkPageOwnership, [
  check('title').notEmpty(),
  check('publicationDate').optional({ nullable: true }).isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('Invalid publication date')
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const newPageData = req.body;
  const pageId = req.params.id;
  try {
    // Get current page data
    const currentPage = await dao.getPage(pageId);
    // Check if the user is admin
    if (req.user.role === 'admin') {
      // If admin, allow changing authorId
      newPageData.authorId = newPageData.authorId || currentPage.authorId;
    } else {
      // If not admin, use existing authorId
      newPageData.authorId = currentPage.authorId;
    }
    newPageData.creationDate = currentPage.creationDate;

    const result = await dao.updatePage(pageId, newPageData);
    if (result !== 0) { // If the operation is successful, SQLite returns the number of affected rows.
      res.status(200).end();
    } else {
      res.status(404).json({ error: 'Page not found.' });
    }

  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ 'error': `Impossible to update the #${pageId}.` });
  }
});

app.delete('/api/pages/:id',isLoggedIn,checkPageOwnership , async (req, res) => {
  const pageId = req.params.id;
  try {
    const result = await dao.deletePage(pageId);
    if (result > 0) { // If the operation is successful, SQLite returns the number of affected rows.
      res.status(200).end();
    } else {
      res.status(404).json({ error: 'Page not found.' });
    }

  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(500).json({ error: `Impossible to delete the page #${pageId}.` });
  }
});


/*---------------------------------------------BLOCK--------------------------------------------- */
// To get all blocks of a page
app.get('/api/pages/:id/blocks', async (req, res) => {
  try {
    const blocks = await dao.listBlocksByPageId(req.params.id);
    res.json(blocks);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(500).json({ error: 'Cannot retrieve the blocks.' });
  }
});

// To create a block for a page, missing the check for the existent of the page
app.post('/api/pages/:id/blocks', isLoggedIn, checkPageOwnership, [
  check('type').isIn(['header', 'paragraph', 'image']),
  check('content').notEmpty(),
  check('orders').isInt({ min: 0 }).notEmpty()
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let newBlock = req.body;
  newBlock.pageId = req.params.id;  // Ensure the block is linked to the correct page

  try {
    // Check if the page exists
    const pages = await dao.getPage(newBlock.pageId);
    // Get all blocks for the page, sorted by their "orders" property
    let blocks = await dao.listBlocksByPageId(newBlock.pageId);
    //console.log("blocks: ",blocks);
    // Check that the "orders" value is sequential and not higher than blocks.length + 1
    if (newBlock.orders < 1 || newBlock.orders > blocks.length + 1) {
      return res.status(400).json({ error: 'Invalid "orders" value. Must be between 1 and the number of blocks + 1.' });
    }
    
    // Find the block with the same orders value
    let sameOrderBlock = blocks.find(block => block.orders === newBlock.orders);
    
    if (sameOrderBlock) {
      // If a block with the same orders value exists, increment the orders of all the blocks that have orders value equal to or greater than the provided orders value
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].orders >= newBlock.orders) {
          blocks[i].orders++;
          await dao.updateBlock(blocks[i].id, blocks[i]);
        }
      }
    }
    
    // Now it's safe to insert the new block
    const id = await dao.createBlock(newBlock);
    res.status(201).location(id).end();
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: e.message });
  }
});


// To update a block
app.put('/api/pages/:id/blocks/:blockId', isLoggedIn, checkBlockOwnership, [
  check('type').isIn(['header', 'paragraph', 'image']),
  check('content').notEmpty(),
  check('orders').isInt({ min: 0 }).notEmpty()
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const updatedBlockData = req.body;
    updatedBlockData.pageId = req.params.id;  // Ensure the block is linked to the correct page

    const oldBlock = await dao.getBlock(updatedBlockData.pageId, req.params.blockId);
    const blocks = await dao.listBlocksByPageId(updatedBlockData.pageId);
    // If the "orders" value is changed
    if(oldBlock.orders !== updatedBlockData.orders) {
      // If the new orders value is greater than the old one
      if(oldBlock.orders < updatedBlockData.orders) {
        // Decrease the "orders" of each block that was between the old and the new position by 1
        for(let i = oldBlock.orders; i < updatedBlockData.orders; i++) {
          blocks[i].orders--;
          await dao.updateBlock(blocks[i].id, blocks[i]);
        }
      } else {
        // If the new orders value is less than the old one
        // Increase the "orders" of each block that was between the old and the new position by 1
        for(let i = updatedBlockData.orders - 1; i < oldBlock.orders - 1; i++) {
          blocks[i].orders++;
          console.log('Updating block id: ', blocks[i].id, ' New orders value: ', blocks[i].orders); // logging block id and new orders value
          await dao.updateBlock(blocks[i].id, blocks[i]);
        }
      }
    }

    const result = await dao.updateBlock(req.params.blockId, updatedBlockData);
    if (result !== 1) {  // if the update operation was not successful, return a 500 response
      return res.status(500).json({ error: 'An error occurred while updating the block.' });
    }
    res.status(200).end();
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: 'An error occurred while updating the block.' });
  }
});


app.delete('/api/pages/:id/blocks/:blockId', isLoggedIn, checkBlockOwnership, async (req, res) => {
  try {
    const result = await dao.deleteBlock(req.params.blockId);
    if (result !== 1) {  // if the delete operation was not successful, return a 500 response
      return res.status(500).json({ error: 'An error occurred while deleting the block.' });
    }
    res.status(200).end();
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: 'An error occurred while deleting the block.' });
  }
});

/*---------------------------------------------SESSION--------------------------------------------- */

/* If we aren't interested in sending error messages... */
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {//this is when we submit the login form that will bring us to /api/session ans then to 'local'
  // req.user contains the authenticated user, we send all the user info back
  res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});







/*---------------------------------------------WEBSITE--------------------------------------------- */
// GET /api/website/name
app.get('/api/websitename', async (req, res) => {
  try {
    const website = await adminDao.getWebsiteName();
    if (website.error) {
      res.status(404).json(website);
    } else {
      res.status(200).json(website);
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error during the retrieval of the page' });
  }
});

app.put('/api/websitename', isLoggedIn, isAdmin, [
  check('name').notEmpty()
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const newName = req.body.name;
  try {
    const result = await adminDao.updateWebsiteName(newName);
    if (result) {
      res.status(200).end();
    } else {
      res.status(404).json({ error: 'Website not found.' });
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: `Impossible to update the website name.` });
  }
});

/*---------------------------------------------USER--------------------------------------------- */
app.get('/api/users/:id/pages', isLoggedIn, async (req, res) => {
  const userId = req.params.id;
  try {
    const pages = await dao.listPagesOf(userId);
    res.status(200).json(pages);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(500).json({ error: `Impossible to list the pages of user #${userId}.` });
  }
});
app.get('/api/users/:id',async(req,res)=>{
  const userId = req.params.id;
  try {
    const user = await userDao.getUserById(userId);
    if(user.error) {
      res.status(404).json({ error: `User with id #${userId} not found.` });
    } else {
      res.status(200).json(user);}
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(500).json({ error: `Impossible retireve the user #${userId}.` });
    
  }
});
app.get('/api/users', async (req, res) => {
  try {
      const users = await userDao.getAllUsers();
      res.status(200).json(users);
  } catch (err) {
      console.error(`ERROR: ${err.message}`);
      res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});


/*---------------------------------------------IMAGE--------------------------------------------- */

app.get('/api/images', async (req, res) => {
  try {
    const images = await dao.listImages();
    res.status(200).json(images);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    res.status(500).json({ error: 'Server error while trying to retrieve images.' });
  }
});

// GET /api/pages/:id
// Purpose: retrieves a specific image from the database by its id
app.get('/api/images/:id', async (req, res) => {
  const imageId = req.params.id;
  try {
    const image = await dao.getImage(imageId);
    if (image.error) {
      res.status(404).json(image);
    } else {
      res.status(200).json(image);
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error during the retrieval of the page' });
  }
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
