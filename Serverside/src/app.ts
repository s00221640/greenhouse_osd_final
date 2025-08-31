import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import plantRoutes from './routes/plantRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); 
  }

  express.json()(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true })(req, res, next);
  });
});

app.use('/users', userRoutes);
app.use('/plants', plantRoutes);
app.use('/admin', adminRoutes);

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

app.get('/', (req, res) => {
  res.send('Welcome to the Greenhouse App!');
});

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
