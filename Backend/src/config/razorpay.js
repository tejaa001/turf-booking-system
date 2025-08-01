import Razorpay from 'razorpay';
import config from './env.js';

// The config/env.js file already validates that these keys are present.
const razorpayInstance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;