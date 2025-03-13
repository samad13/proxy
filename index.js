



const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = 3007;

// Ignore SSL errors
const agent = new https.Agent({ rejectUnauthorized: false });

// Proxy route for '/altphone'
app.get('/altphone', async (req, res) => {
  const targetUrl = 'https://altmobile.altbank.ng/altphone';
  
  try {
    // First, fetch cookies with a HEAD request to check if login is required
    const initialResponse = await axios.head(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      },
      httpsAgent: agent,
      maxRedirects: 5,
    });

    const setCookies = initialResponse.headers['set-cookie'];
    console.log('Cookies received:', setCookies);

    // Now fetch the actual content using the same cookies
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Cookie': setCookies ? setCookies.join('; ') : '',
      },
      httpsAgent: agent,
      maxRedirects: 5,
      withCredentials: true,
    });

    // Send back the response body
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching target URL:', error.message);
    res.status(500).send(`Failed to fetch URL: ${error.message}`);
  }
});

// Proxy route for dynamic paths (optional)
app.get('/proxy/*', async (req, res) => {
  const targetUrl = req.params[0]; 
  
  if (!targetUrl) {
    return res.status(400).send('Target URL is required');
  }

  try {
    const fullUrl = `https://${targetUrl}`;

    const initialResponse = await axios.head(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      },
      httpsAgent: agent,
      maxRedirects: 5,
    });

    const setCookies = initialResponse.headers['set-cookie'];
    console.log('Cookies received:', setCookies);

    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Cookie': setCookies ? setCookies.join('; ') : '',
      },
      httpsAgent: agent,
      maxRedirects: 5,
      withCredentials: true,
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error fetching target URL:', error.message);
    res.status(500).send(`Failed to fetch URL: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running at http://localhost:${PORT}`);
});

