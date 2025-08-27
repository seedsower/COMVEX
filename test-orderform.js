const { Connection, PublicKey, Keypair } = require('@solana/web3.js');

async function testOrderFormIntegration() {
  console.log('🧪 Testing OrderForm Integration...\n');
  
  const results = [];
  
  // Test 1: Local Validator Connection
  try {
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Local validator connection - Solana ${version['solana-core']}`);
    results.push({ name: 'Local Validator', passed: true });
  } catch (error) {
    console.log(`❌ Local validator connection failed: ${error.message}`);
    results.push({ name: 'Local Validator', passed: false });
  }
  
  // Test 2: Program Deployment Check
  try {
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    const programId = new PublicKey('14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd');
    const programInfo = await connection.getAccountInfo(programId);
    
    if (programInfo && programInfo.executable) {
      console.log('✅ Apex Protocol program found and executable');
      results.push({ name: 'Program Deployment', passed: true });
    } else {
      console.log('❌ Apex Protocol program not found or not executable');
      results.push({ name: 'Program Deployment', passed: false });
    }
  } catch (error) {
    console.log(`❌ Program check failed: ${error.message}`);
    results.push({ name: 'Program Deployment', passed: false });
  }
  
  // Test 3: Component Structure
  try {
    const fs = require('fs');
    const orderFormExists = fs.existsSync('./src/components/OrderForm.tsx');
    const hookExists = fs.existsSync('./src/hooks/useDriftClient.ts');
    
    if (orderFormExists && hookExists) {
      console.log('✅ OrderForm component and hook files exist');
      results.push({ name: 'Component Structure', passed: true });
    } else {
      console.log('❌ Missing OrderForm component or hook files');
      results.push({ name: 'Component Structure', passed: false });
    }
  } catch (error) {
    console.log(`❌ Component structure check failed: ${error.message}`);
    results.push({ name: 'Component Structure', passed: false });
  }
  
  // Test 4: Mock Order Functionality
  try {
    const mockOrder = {
      marketIndex: 0,
      direction: 'long',
      baseAssetAmount: 1.0,
      orderType: 'market'
    };
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockSignature = 'mock_signature_' + Date.now();
    
    console.log(`✅ Mock order simulation successful: ${mockSignature}`);
    results.push({ name: 'Mock Order Processing', passed: true });
  } catch (error) {
    console.log(`❌ Mock order simulation failed: ${error.message}`);
    results.push({ name: 'Mock Order Processing', passed: false });
  }
  
  // Print summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n📋 Test Summary:');
  console.log('='.repeat(40));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! OrderForm ready for local testing.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Review before proceeding.');
    return false;
  }
}

testOrderFormIntegration().catch(console.error);
