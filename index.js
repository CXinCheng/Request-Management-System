const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('Initial Request Management Set Up');
});

app.listen(3000, () => console.log('Server running on port 3000'));