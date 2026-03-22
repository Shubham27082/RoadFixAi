const bcrypt = require('bcryptjs');

async function testBcryptSimple() {
  try {
    console.log('🧪 Testing bcrypt directly...\n');

    const password = 'test123';
    console.log(`Original password: ${password}`);

    // Hash the password
    const hash = await bcrypt.hash(password, 12);
    console.log(`Generated hash: ${hash}`);

    // Compare the password
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Comparison result: ${isValid}`);

    // Test with wrong password
    const wrongPassword = 'wrong123';
    const isWrong = await bcrypt.compare(wrongPassword, hash);
    console.log(`Wrong password test: ${isWrong}`);

    console.log('\n✅ bcrypt is working correctly!');

  } catch (error) {
    console.error('❌ bcrypt test failed:', error);
  }
}

testBcryptSimple();