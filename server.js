const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: [
    '*',
    'https://gsl-python.azurewebsites.net',
  ],
  credentials: true,
};

app.use(cors(corsOptions));

const port = process.env.PORT || 3030;
app.get('/extract', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';
  const headers = {
    'User-Agent': userAgent,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.google.com/'
  };

  try {
    const response = await axios.get(url, { headers });
    const html = response.data;
    const $ = cheerio.load(html);

    let textElements = [];

    $('p, span, li').each((i, element) => {
      const text = $(element).text().trim();
      if (text.length > 20) {
        textElements.push(text);
      }
    });

    res.send(textElements.join(' '));
  } catch (error) {
    console.error(`Error fetching URL: ${error}`);
    res.status(500).send('Error fetching URL');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
