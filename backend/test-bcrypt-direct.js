const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    const password = 'password123';
    
    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);
    
    // Compare the password
    const isValid = await bcrypt.compare(password, hash);
    console.log('Comparison result:', isValid);
    
    // Test with wrong password
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    console.log('Wrong password result:', isInvalid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt();