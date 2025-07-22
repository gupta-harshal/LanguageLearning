import express from 'express';
import router from './routes/index'
const app= express();

app.use(express.json());
app.use('/api/v1', router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});