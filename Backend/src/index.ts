import express from 'express';
import router from './routes/index'
import dotenv from 'dotenv';
const app= express();

dotenv.config();
app.use(express.json());
app.use('/api/v1', router);
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Language Learning Backend API</h1>');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});