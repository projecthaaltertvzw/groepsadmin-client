const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());

// Dummy database (vervang dit door een echte database zoals MongoDB)
const users = [
  {
    username: 'emiovdp',
    password: bcrypt.hashSync('Kvdp2014', 10),
    role: 'admin',
  },
];

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Ongeldige gebruikersnaam of wachtwoord' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Ongeldige gebruikersnaam of wachtwoord' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ message: 'Succesvol ingelogd', token });
});

// Beschermde route
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Geen token verstrekt' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Toegang verleend', user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Ongeldige token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend draait op http://localhost:${PORT}`);
});
