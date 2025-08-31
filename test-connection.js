// Test Connection Script
// Run this to verify all services are working

const { createClient } = require('redis');
const { Pool } = require('pg');

async function testConnections() {
  console.log('🔍 Testing service connections...\n');

  // Test Redis
  console.log('1. Testing Redis connection...');
  try {
    const redis = createClient({ url: 'redis://localhost:6379' });
    await redis.connect();
    console.log('✅ Redis: Connected successfully');
    await redis.disconnect();
  } catch (error) {
    console.log('❌ Redis: Connection failed -', error.message);
  }

  // Test PostgreSQL
  console.log('\n2. Testing PostgreSQL connection...');
  try {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'exness_trade',
      user: 'postgres',
      password: 'password',
    });
    
    const client = await pool.connect();
    console.log('✅ PostgreSQL: Connected successfully');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL: Query test passed');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.log('❌ PostgreSQL: Connection failed -', error.message);
  }

  // Test HTTP endpoints
  console.log('\n3. Testing HTTP endpoints...');
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API: Health check passed');
      console.log('   Status:', data.status);
      console.log('   Redis:', data.services.redis);
    } else {
      console.log('❌ Backend API: Health check failed');
    }
  } catch (error) {
    console.log('❌ Backend API: Connection failed -', error.message);
  }

  console.log('\n🎯 Connection test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure Docker Desktop is running');
  console.log('2. Run: docker-compose up -d');
  console.log('3. Run: pnpm install');
  console.log('4. Start services: .\\start-trading-app.ps1');
}

// Run the test
testConnections().catch(console.error);
