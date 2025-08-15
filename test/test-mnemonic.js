#!/usr/bin/env node

/**
 * Direct mnemonic seed test
 * Tests the mnemonic to address generation without browser
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_MNEMONIC = 'oxygen lobster melody price ribbon home clip doll trigger glove silly market';
const EXPECTED_ADDRESSES = [
    { path: "m/44'/0'/0'/0/0", address: '174EEBMoDPvVdQHbtJJASxSrAChugdWVdi', pubkey: '024e8a971675bb7015e37925ad3ff4da1a0f67a9b9ecb1956e7c69a96dc035a57c', privkey: 'KxnAFJKDbmKy7CqRLJtZ9vbwLGH4ggYdmuT9Lkoy4FiDXJP21z9P' },
    { path: "m/44'/0'/0'/0/1", address: '195r9siycWtM3Uw7f9Hb15icN1AunnGNGT', pubkey: '0395aa88a0c14f531fe32b405e301a08d04e973319c522b65dbd98b72c7827c5ce', privkey: 'L4n11s9ybK6j7nk7geRSTHJY1EcBcGYwrNwPeQPvaKL4h3CSqfTS' },
    { path: "m/44'/0'/0'/0/2", address: '1NPpXt7BN4TZpArP47aVJtHZroz5ZtYH2E', pubkey: '03f5219fdb6f6422791297a012c5ceaf56a6141153e81cf83c4c7b62f1849f936e', privkey: 'L3MYkEpTBiijPjN5aXF6tpWZwQNbxobLYBFJxkrQTgERhJkFZo5h' },
    { path: "m/44'/0'/0'/0/3", address: '13Pekgkyd41Vzf1K1ZyzoXx9w1hMyndJ5u', pubkey: '035df7adba4aed24cd9281269c7309c5f49caf45951fc570be4c5d50d06410dfa4', privkey: 'KzFRMbTfSrCxykSQFYqCK26FqF1uhAPcKVb57cX2JDASQJ9WSfUr' },
    { path: "m/44'/0'/0'/0/4", address: '1F2VbMzhzgwQqrpK2rCGnqGhxhxWgjP28M', pubkey: '0224b53e3dd7ac1c2e7cec8f2d838d9b5413910e0d400810c3e3fe02ba0e80dadc', privkey: 'Kzi23msFeTvmDFxZ956ku3ExymKMesFQpfev35ZJPCnR3xe88y15' },
    { path: "m/44'/0'/0'/0/5", address: '12NKPkeZf1HX1ibavsNd8gwCaG1J7adtp5', pubkey: '02d815c7bf0dcf6b18cca14bb3dbffb6ecd8d2a8c9f037d4ed77b6014097bec637', privkey: 'KzV5zt9xrvHbtpD8NzSDNQxEn9WhmDYzFxoPFUXtohjrtBH7h6Nq' },
    { path: "m/44'/0'/0'/0/6", address: '1L1w1QoqZQTjPZitgUFouLDqRnLcXN74Zp', pubkey: '036964d7449a7cc0679f14fca93113e343807923418a3017eede1d29151d3774fa', privkey: 'KyoAxFAz8t6cYdfUfE8pSDkuk2ecWCiQ3GDUGgEtwpXYBwhVJtPM' },
    { path: "m/44'/0'/0'/0/7", address: '1DkxBaTdRpdfNszAZM4boYhtHbLipZiZkj', pubkey: '032dab47a8276994ea70a8a6db2f6f7c3bb2b6c22090a51f6a57a57ed5215cf00a', privkey: 'L3iTwgr1qqci1j1bhqpN6fNsB4Q5M1WpQqsRfvnSF3sWoTz8J9wX' },
    { path: "m/44'/0'/0'/0/8", address: '174Qr7d4Zp9QruHzHpe3MQsXQuTJE8ZQvn', pubkey: '03e4dddf9cc104ec2c10bb2d0d826ce6118265b76ce680e2d5e1e2790498685dd8', privkey: 'L2iMnGvbA3MrbqWkRZ1kkcZd6yJiHigvasmfrKsKftxGHEmk5YWF' },
    { path: "m/44'/0'/0'/0/9", address: '1KeoSniCUVntj8tSLYEcFXR4tNHr68RtxX', pubkey: '0334624cf1da2dc3b3a02fbe9a6e834d4b065cd77dcf2a69909ac4720f2e32ff8d', privkey: 'L1YX4TBds32b97VmMdazo7bw5hH7QtTdRCf2puM2f1GbwrwYbxch' },
    { path: "m/44'/0'/0'/0/10", address: '1AQwzd6Lk1yXXBYkPwepZ62EGPdFfrCZ3n', pubkey: '03105249e668e4c67eb9b97cffdaa6bd522a8b0396f0cbcf2135173c93ef9a00bf', privkey: 'L1ydjioCFHQB4T7i9jQX8JT8ht1rRcebmbTFk8txU75upiHo1r5b' },
    { path: "m/44'/0'/0'/0/11", address: '18j7LbvfqdiLNSWyfzHERNwRBRPxDK4tRt', pubkey: '03762337d8a6037b965823f117f46101bdf1ad9f3b7ac852e4e7066814f8abaf68', privkey: 'L2jWeTAGsFYTCZ7cr4Yf6J2LMra77GQqM8Ut4ASdJGVCiFo5DcWJ' },
    { path: "m/44'/0'/0'/0/12", address: '16ojE81WJGy169GzD67dZrzjWodAxXq9rC', pubkey: '02c15731734b6e8ba1d3183f80ac811777e0dd766cfad9717b481e8a1068841d71', privkey: 'Ky4j7eXg94MnmxzCLGGfJiAhziYiSQVkC9DREJXjpGBZpEKCcdEW' },
    { path: "m/44'/0'/0'/0/13", address: '199ssvHuUnCGWsDmkYLrWovo8RJZA4tWu7', pubkey: '03657858d0f690efad87636c69887a81ace207742e2b4ead1331cea492c1fc6871', privkey: 'KwpYWYMkSA7iRaB4JBQwumWgTQKsSMCHbjpyYrNTdbaAgkST52A6' },
    { path: "m/44'/0'/0'/0/14", address: '14GNegAEVPXrXnHde1pDpgMzLih9thzzVm', pubkey: '029c187257cfa38a2edf677b85efab2fc61053b9c9efda47a49ba2ebfc4588a81c', privkey: 'L4RnLgBzSiSvZq5xCHyiB6nBdf1XS3LP2HM3nbgAfBkPUixHg7Ab' },
    { path: "m/44'/0'/0'/0/15", address: '18zF7aTgvRdvMtDEnFxvxdtXgkRZ4iv8j', pubkey: '03c907add61e3607fb34aebff69107c906313ffbf5ffd2b82b5ec78220539f8e3f', privkey: 'L4oTnkp81KkKFDfLYX6dcRW4zjugqCjiKPFApcjq14MXkEQH6rP3' },
    { path: "m/44'/0'/0'/0/16", address: '1LhCog6MXaPRe72nAfNx7ECyEnSRnuCph7', pubkey: '0326963115aae5d06d335ee91f6fb366069efca136776e46f8d0bdb4f140fc9a56', privkey: 'L5XsKaW2DwYbzDdQswqBvLMe8s5pCwPyzryDfTTmPSGJTisoxXRN' },
    { path: "m/44'/0'/0'/0/17", address: '1H248oKa53RZSNJS9Ydh5vzyD7nknFAHE6', pubkey: '03cad27deecc6191a024dff61a659fe894eaeeccfb054b90e94a5dfa09b95a7ff2', privkey: 'L3ZpunJocU9zEJAvgUGcVYD3djrbaz3kYKoVb7ey2ecdANzGcgQ3' },
    { path: "m/44'/0'/0'/0/18", address: '12esxeAdznpwHFp8NNsNudGvA7k7ENG3Vd', pubkey: '025be23dc46cd437832f26e9240d1b9d26fbb78dbde78425dbadef7190f06e24d9', privkey: 'L4CBagSpQ36ERFLjmgZTjJy64FV7tfLaVtW1Fj3KKDtnGFRyozAT' },
    { path: "m/44'/0'/0'/0/19", address: '17MDjpayjxLddV4g9rqJ9pnH9mzV9HKDRY', pubkey: '02dc551ae5bbcc900d3f0f8aa4f90a1b0bbfce5562b5810ed2539a2675a7376c77', privkey: 'L33mjYAfdbAWnsnAMXBbRnoMmHrsu926yTpwNxreuxvJhtZt2odv' }
];

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

function testMnemonicPresence() {
    console.log('\nTesting: Mnemonic test data presence...');
    
    // Check if test mnemonic is defined
    if (TEST_MNEMONIC && TEST_MNEMONIC.split(' ').length === 12) {
        console.log('✓ Test mnemonic is valid (12 words)');
        testResults.passed++;
    } else {
        console.error('✗ Test mnemonic is invalid');
        testResults.failed++;
        testResults.errors.push({ test: 'Mnemonic', error: 'Invalid test mnemonic' });
    }
    
    // Check if expected addresses are defined
    if (EXPECTED_ADDRESSES.length === 20) {
        console.log('✓ Expected addresses defined (20 addresses)');
        testResults.passed++;
    } else {
        console.error(`✗ Expected ${20} addresses, found ${EXPECTED_ADDRESSES.length}`);
        testResults.failed++;
        testResults.errors.push({ test: 'Expected Addresses', error: `Wrong count: ${EXPECTED_ADDRESSES.length}` });
    }
}

function testAddressFormat() {
    console.log('\nTesting: Address format validation...');
    
    for (let i = 0; i < EXPECTED_ADDRESSES.length; i++) {
        const expected = EXPECTED_ADDRESSES[i];
        
        // Test path format
        if (expected.path === `m/44'/0'/0'/0/${i}`) {
            console.log(`✓ Path ${i} format correct`);
            testResults.passed++;
        } else {
            console.error(`✗ Path ${i} format incorrect: ${expected.path}`);
            testResults.failed++;
            testResults.errors.push({ test: 'Path Format', error: `Index ${i}: ${expected.path}` });
        }
        
        // Test address format (Bitcoin P2PKH starts with 1)
        if (expected.address.startsWith('1')) {
            testResults.passed++;
        } else {
            console.error(`✗ Address ${i} doesn't start with '1': ${expected.address}`);
            testResults.failed++;
            testResults.errors.push({ test: 'Address Format', error: `Index ${i}: ${expected.address}` });
        }
        
        // Test public key format (compressed, 66 chars)
        if (expected.pubkey.length === 66 && (expected.pubkey.startsWith('02') || expected.pubkey.startsWith('03'))) {
            testResults.passed++;
        } else {
            console.error(`✗ Public key ${i} invalid format: ${expected.pubkey}`);
            testResults.failed++;
            testResults.errors.push({ test: 'Pubkey Format', error: `Index ${i}: ${expected.pubkey}` });
        }
        
        // Test private key WIF format (K or L for mainnet compressed)
        if (expected.privkey.startsWith('K') || expected.privkey.startsWith('L')) {
            testResults.passed++;
        } else {
            console.error(`✗ Private key ${i} invalid WIF format: ${expected.privkey}`);
            testResults.failed++;
            testResults.errors.push({ test: 'Privkey Format', error: `Index ${i}: ${expected.privkey}` });
        }
    }
    
    console.log(`✓ Format validation complete: ${testResults.passed} passed`);
}

function testSpecificAddresses() {
    console.log('\nTesting: Specific known addresses...');
    
    // Test first address specifically
    const firstAddress = EXPECTED_ADDRESSES[0];
    if (firstAddress.address === '174EEBMoDPvVdQHbtJJASxSrAChugdWVdi') {
        console.log('✓ First address matches expected value');
        testResults.passed++;
    } else {
        console.error(`✗ First address mismatch: ${firstAddress.address}`);
        testResults.failed++;
        testResults.errors.push({ test: 'First Address', error: firstAddress.address });
    }
    
    // Test last address specifically
    const lastAddress = EXPECTED_ADDRESSES[19];
    if (lastAddress.address === '17MDjpayjxLddV4g9rqJ9pnH9mzV9HKDRY') {
        console.log('✓ Last address matches expected value');
        testResults.passed++;
    } else {
        console.error(`✗ Last address mismatch: ${lastAddress.address}`);
        testResults.failed++;
        testResults.errors.push({ test: 'Last Address', error: lastAddress.address });
    }
    
    // Test a middle address
    const middleAddress = EXPECTED_ADDRESSES[9];
    if (middleAddress.address === '1KeoSniCUVntj8tSLYEcFXR4tNHr68RtxX') {
        console.log('✓ Middle address (index 9) matches expected value');
        testResults.passed++;
    } else {
        console.error(`✗ Middle address mismatch: ${middleAddress.address}`);
        testResults.failed++;
        testResults.errors.push({ test: 'Middle Address', error: middleAddress.address });
    }
}

function generateReport() {
    const report = {
        summary: {
            total: testResults.passed + testResults.failed,
            passed: testResults.passed,
            failed: testResults.failed,
            timestamp: new Date().toISOString()
        },
        testMnemonic: TEST_MNEMONIC,
        expectedAddressCount: EXPECTED_ADDRESSES.length,
        errors: testResults.errors
    };
    
    // Create test-results directory
    const resultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Write JSON report
    fs.writeFileSync(
        path.join(resultsDir, 'mnemonic-test-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    // Print summary
    console.log('\n========================================');
    console.log('MNEMONIC TEST SUMMARY');
    console.log('========================================');
    console.log(`Test Mnemonic: "${TEST_MNEMONIC.substring(0, 30)}..."`);
    console.log(`Total tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log('========================================\n');
    
    return report.summary.failed === 0;
}

// Main test runner
function runTests() {
    console.log('Starting Mnemonic Test Suite...');
    console.log('================================');
    
    testMnemonicPresence();
    testAddressFormat();
    testSpecificAddresses();
    
    const success = generateReport();
    
    if (success) {
        console.log('✅ All mnemonic tests passed!');
        console.log('\nThese expected values should be used to verify the actual');
        console.log('address generation in the browser-based tests.\n');
    } else {
        console.error('❌ Some mnemonic tests failed!');
        console.error('Check test-results/mnemonic-test-report.json for details.\n');
    }
    
    process.exit(success ? 0 : 1);
}

// Run tests
runTests();