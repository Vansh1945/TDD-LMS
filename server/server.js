const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5173',
  frontendURL = process.env.Frontend_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api/auth', require('./routes/auth-routes'));
app.use('/api/users', require('./routes/user-routes'));
app.use('/api/chapters', require('./routes/chapter-routes'));
app.use('/api/courses', require('./routes/course-routes'));
app.use('/api/progress', require('./routes/progress-routes'));
app.use('/api/certificates', require('./routes/certificate-routes'));


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Unstop LMS API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
