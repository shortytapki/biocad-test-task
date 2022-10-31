import express from 'express';
import path from 'path';

const PORT = 3000;

const __dirname = path.resolve();

const app = express();
app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/html', 'main.html'));
});

app.get('/:page', (req, res) => {
  const { page } = req.params;

  if (page !== 'analytics') {
    res.sendFile(path.resolve(__dirname, 'public/html', 'error.html'));
    return;
  } else {
    res.sendFile(path.resolve(__dirname, 'public/html', 'analytics.html'));
    return;
  }
});

console.log(`Server is running on port: ${PORT}`);
app.listen(PORT);
