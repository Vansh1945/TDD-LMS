const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', require('./routes/auth-routes'));
app.use('/api/users', require('./routes/user-routes'));
app.use('/api/chapters', require('./routes/chapter-routes'));
app.use('/api/courses', require('./routes/course-routes'));
app.use('/api/progress', require('./routes/progress-routes'));
app.use('/api/certificates', require('./routes/certificate-routes'));
app.use('/api/student', require('./routes/student-routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Unstop LMS API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
