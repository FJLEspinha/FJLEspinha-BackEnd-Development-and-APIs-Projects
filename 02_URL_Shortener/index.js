require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});



const urlDB = {};
let shortURLCounter = 1;

function isValidUrl(url) {

  return new Promise((resolve) => {
    const hostname = new URL(url).hostname;

    dns.lookup(hostname, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });

  });
}


app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;


  try {
    const isValid = await isValidUrl(url);

    if (!isValid) return res.json({ error: 'invalid url' });

    const shortURL = shortURLCounter++;
    urlDB[shortURL] = url;

    res.json({
      original_url: url,
      short_url: shortURL
    });
  } catch (error) {
    res.status(500).json({ error: 'Error in server' })
  }

});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDB[shortUrl];

  if (originalUrl) res.redirect(originalUrl);
  else res.status(404).json({ error: 'No short URL found for the given input' });

});