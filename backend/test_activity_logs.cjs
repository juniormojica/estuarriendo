const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a valid token to bypass auth
const token = jwt.sign({ userId: '1', userType: 'admin' }, process.env.JWT_SECRET || 'your_super_secret_key_123!@#', { expiresIn: '1h' });

async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/activity-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success!", res.data);
  } catch (err) {
    console.error("Error status:", err.response?.status);
    console.error("Error data:", err.response?.data);
  }
}
test();
