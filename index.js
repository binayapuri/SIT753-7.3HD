

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// serve static frontend files from public/
app.use(express.static(path.join(__dirname, 'public')));

// connect to MongoDB
mongoose
  .connect(
    'mongodb+srv://Binay_admin:binay@binaya.goq6t5f.mongodb.net/?retryWrites=true&w=majority&appName=binaya'
  )
  .then(() => console.log('🔗 MongoDB connected'))
  .catch(err => console.error(err));

// API routes
app.use('/expenses', require('./routes/expensesRoutes'));

// optional: catch-all that sends back index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;        // for Supertest
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}
