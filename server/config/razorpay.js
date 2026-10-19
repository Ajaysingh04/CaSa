const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (
    key_id &&
    key_secret &&
    !key_id.includes('placeholder') &&
    !key_secret.includes('placeholder')
  ) {
    if (!razorpayInstance) {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret
      });
      console.log('💳 [Razorpay Initialized]: Live / Test Gateway Ready');
    }
    return razorpayInstance;
  }

  return null;
};

module.exports = { getRazorpayInstance };
