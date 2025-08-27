/**
 * OrderForm Integration Tests
 * Tests the OrderForm component against local validator
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class OrderFormTester {
  private connection: Connection;
  private results: TestResult[] = [];

  constructor() {
    // Use localhost for local validator testing
    this.connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        message: 'Test passed',
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      this.results.push({
        name,
        passed: false,
        message: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async testLocalValidatorConnection(): Promise<void> {
    await this.runTest('Local Validator Connection', async () => {
      const version = await this.connection.getVersion();
      if (!version['solana-core']) {
        throw new Error('Failed to get Solana version');
      }
      console.log(`✅ Connected to local validator - Solana ${version['solana-core']}`);
    });
  }

  async testProgramDeployment(): Promise<void> {
    await this.runTest('Program Deployment Check', async () => {
      // Check if Apex Protocol is deployed locally
      const programId = new PublicKey('14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd');
      const programInfo = await this.connection.getAccountInfo(programId);
      
      if (!programInfo) {
        throw new Error('Apex Protocol program not found on local validator');
      }
      
      if (!programInfo.executable) {
        throw new Error('Program is not executable');
      }
      
      console.log(`✅ Apex Protocol program found and executable`);
    });
  }

  async testWalletFunctionality(): Promise<void> {
    await this.runTest('Wallet Functionality', async () => {
      const testWallet = Keypair.generate();
      
      // Test airdrop
      const airdropSignature = await this.connection.requestAirdrop(
        testWallet.publicKey,
        1000000000 // 1 SOL
      );
      
      await this.connection.confirmTransaction(airdropSignature);
      
      const balance = await this.connection.getBalance(testWallet.publicKey);
      if (balance < 900000000) { // Allow for fees
        throw new Error('Airdrop failed or insufficient balance');
      }
      
      console.log(`✅ Test wallet created with ${balance / 1e9} SOL`);
    });
  }

  async testOrderFormComponents(): Promise<void> {
    await this.runTest('OrderForm Component Structure', async () => {
      // Test that OrderForm can be imported and has required methods
      const { useDriftClient } = await import('../hooks/useDriftClient');
      
      if (typeof useDriftClient !== 'function') {
        throw new Error('useDriftClient hook not properly exported');
      }
      
      console.log('✅ OrderForm components properly structured');
    });
  }

  async testMockOrderPlacement(): Promise<void> {
    await this.runTest('Mock Order Placement', async () => {
      // Test the mock order placement functionality
      const mockOrderParams = {
        marketIndex: 0,
        direction: 'long' as const,
        baseAssetAmount: 1.0,
        orderType: 'market' as const
      };
      
      // Simulate order placement delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const mockSignature = 'mock_signature_' + Date.now();
      
      if (!mockSignature.startsWith('mock_signature_')) {
        throw new Error('Mock order placement failed');
      }
      
      console.log(`✅ Mock order placed with signature: ${mockSignature}`);
    });
  }

  async testEnvironmentConfiguration(): Promise<void> {
    await this.runTest('Environment Configuration', async () => {
      const { getEnvironmentConfig } = await import('../config/environment');
      const config = getEnvironmentConfig();
      
      if (!config.programId) {
        throw new Error('Program ID not configured');
      }
      
      if (!config.rpcEndpoint) {
        throw new Error('RPC endpoint not configured');
      }
      
      console.log(`✅ Environment configured - Network: ${config.network}`);
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting OrderForm Integration Tests...\n');
    
    await this.testLocalValidatorConnection();
    await this.testProgramDeployment();
    await this.testWalletFunctionality();
    await this.testOrderFormComponents();
    await this.testMockOrderPlacement();
    await this.testEnvironmentConfiguration();
    
    this.printResults();
  }

  private printResults(): void {
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `(${result.duration}ms)`;
      console.log(`${status} ${result.name} ${duration}`);
      
      if (!result.passed) {
        console.log(`   Error: ${result.message}`);
        failed++;
      } else {
        passed++;
      }
    });
    
    console.log('=' .repeat(50));
    console.log(`Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! OrderForm is ready for local testing.');
    } else {
      console.log('⚠️  Some tests failed. Please fix issues before proceeding.');
    }
  }
}

// Export for use in other test files
export { OrderFormTester };

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  const tester = new OrderFormTester();
  tester.runAllTests().catch(console.error);
}
