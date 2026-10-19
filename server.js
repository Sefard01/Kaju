const express = express = require('express');
const QRCode = require('qrcode');

const app = express();

// Middleware JSON data reading ke liye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express performance boost
app.disable('x-powered-by');

// Health Check Endpoint (Render check karne ke liye)
app.get('/', (req, res) => {
  res.json({ status: 'API Active', message: 'QR Code Generator Engine Running' });
});

/**
 * 1. GET API: Direct URL pass karke image paane ke liye
 * Example: https://your-render-url.onrender.com/api/qr?url=https://google.com
 */
app.get('/api/qr', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Please enter target URL in query (?url=...)' });
    }

    // High performance stream karke PNG generate karna
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Render pe caching for fast speed

    QRCode.toFileStream(res, url, {
      errorCorrectionLevel: 'M',
      type: 'png',
      margin: 2,
      width: 400
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 2. POST API: Base64 QR Image & Data ke liye (Frontend/App Integration ke liye)
 * Body: { "url": "https://google.com" }
 */
app.post('/api/qr', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required in request body' });
    }

    // Base64 QR Code generate karna
    const qrImageBase64 = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400
    });

    return res.status(200).json({
      success: true,
      targetUrl: url,
      qrImage: qrImageBase64
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Production Port (Render dwara dynamically diya jata hai)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
