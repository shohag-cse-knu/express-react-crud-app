const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Routes
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
/*
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
*/

app.post(
  '/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
  ],
  async (req, res) => {

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation error",
        errors: errors.array()
      });
    }

    const { name, email } = req.body;

    try {
      // Check if email already exists
      const emailCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(422).json({
          message: "Email already exists"
        });
      }

      // Insert user
      const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );

      return res.json({
        message: "User Created Successfully!!",
        user: result.rows[0]
      });

    } catch (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Something goes wrong while adding a user!!"
      });
    }
  }
);


app.put(
  '/users/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
  ],
  async (req, res) => {

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation error",
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email } = req.body;

    try {
      // Check if email already exists
      const emailCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id <> $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(422).json({
          message: "Email already exists"
        });
      }

      // Update user
      const result = await pool.query(
        'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *',
        [name, email, id]
      );

      return res.json({
        message: "User Updated Successfully!!",
        user: result.rows[0]
      });

    } catch (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Something goes wrong while adding a user!!"
      });
    }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(port, async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', res.rows[0]);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
  console.log(`Server running on port ${port}`);
});
