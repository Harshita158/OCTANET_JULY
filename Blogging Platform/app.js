const express = require('express');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up sessions
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Serve the static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Serve all-posts.html page
app.get('/all-posts-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/all-posts.html'));
});


// Register Page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/register.html'));
});

// Register a new user
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

// Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error registering user');
    }
    res.redirect('/login');
  });
});

// Login Page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM Users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/post');
    } else {
      res.status(400).send('Incorrect password');
    }
  });
});

// Serve post.html page
app.get('/post', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send('You must be logged in to access this page');
    }
    res.sendFile(path.join(__dirname, 'views/post.html'));
  });
  
// Fetch blog posts for the current user
app.get('/view-blog-posts', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('You must be logged in to view your blog posts');
  }

  const query = 'SELECT * FROM Posts WHERE userId = ?';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.log('Error fetching blog posts:', err);
      return res.status(500).send('Error fetching blog posts');
    }
    res.json(results); // Send the posts as JSON
  });
});

// Fetch all blog posts with usernames
app.get('/all-posts', (req, res) => {
  const query = `
    SELECT Posts.title, Posts.content, Users.username 
    FROM Posts 
    JOIN Users ON Posts.userId = Users.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error fetching posts');
    }
    res.json(results);
  });
});

// Delete a post by ID
app.delete('/delete-post/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('You must be logged in to access this page');
  }

  const postId = req.params.id;
  const query = 'DELETE FROM Posts WHERE id = ? AND userId = ?';

  db.query(query, [postId, req.session.userId], (err, result) => {
    if (err) {
      console.log('Error deleting post:', err);
      return res.status(500).send('Error deleting post');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Post not found or not authorized to delete');
    }

    res.send('Post deleted successfully');
  });
});

  // Handle form submission
  app.post('/add-post', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send('You must be logged in to access this page');
    }
  
    const { title, content } = req.body;
    const query = 'INSERT INTO Posts (title, content, userId) VALUES (?, ?, ?)';
    db.query(query, [title, content, req.session.userId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error adding post');
      }
      res.send('Post added successfully');
    });
  });

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
