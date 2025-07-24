import express from 'express';
import router from './routes/index'
import dotenv from 'dotenv';
const app= express();

dotenv.config();
app.use(express.json());
app.use('/api/v1', router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});