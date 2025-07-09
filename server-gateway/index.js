const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.use('/api/movies', async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `http://catalog:5001${req.originalUrl}`,
    data: req.body,
  });
  res.json(response.data);
});

app.use('/api/payments', async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `http://payments:5002${req.originalUrl}`,
    data: req.body,
  });
  res.json(response.data);
});

app.use('/api/recommendations', async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `http://recommendations:5003${req.originalUrl}`,
    data: req.body,
  });
  res.json(response.data);
});

app.listen(5000, () => console.log('Gateway on :5000'));