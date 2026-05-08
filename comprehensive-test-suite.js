#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST SUITE FOR ARK PROTOCOL ADDRESS GENERATION
 * 
 * This test suite covers:
 * 1. SDK initialization and module availability
 * 2. Server info fetching and validation
 * 3. Public key format handling (compressed vs x-only)
 * 4. Address generation with different key formats
 * 5. Error handling and edge cases
 * 6. Browser bundle functionality
 * 7. Manual vs automatic address generation
 * 8. Different network configurations
 */

const fs = require('fs');
const vm = require('vm');
const { TextEncoder, TextDecoder } = require('util');
const crypto = require('crypto');

console.log('🔍 COMPREHENSIVE ARK PROTOCOL TEST SUITE');
console.log('='.repeat(80));

let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`\n📝 Test ${testResults.total}: ${testName}`);
    console.log('-'.repeat(60));
    
    try {
        const result = testFunction();
        if (result === true) {
            testResults.passed++;
            console.log(`✅ PASS: ${testName}`);
        } else {
            testResults.failed++;
            console.log(`❌ FAIL: ${testName} - ${result}`);
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ERROR: ${testName} - ${error.message}`);
        console.log(`   Stack: ${error.stack.split('\n')[1]}`);
    }
}

async function runAsyncTest(testName, testFunction) {
    testResults.total++;
    console.log(`\n📝 Test ${testResults.total}: ${testName}`);
    console.log('-'.repeat(60));
    
    try {
        const result = await testFunction();
        if (result === true) {
            testResults.passed++;
            console.log(`✅ PASS: ${testName}`);
        } else {
            testResults.failed++;
            console.log(`❌ FAIL: ${testName} - ${result}`);
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ERROR: ${testName} - ${error.message}`);
        console.log(`   Stack: ${error.stack.split('\n')[1]}`);
    }
}

// Test data - known good values from our previous successful tests
const TEST_DATA = {
    nsecKey1: {
        nsec: 'nsec12ngue0y6wtx0f2hhzl6ssxndmc02hqxryuavtfzgs72lt08kz3msvs6fnd',
        privKeyHex: 'fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d',
        pubKeyCompressed: '02fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d',
        pubKeyXOnly: 'fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d',
        expectedAddress: 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nmr7aax9rt24j6nygp6rsmdgqnqk3ld5qpnymcyfp0n46w63vt6twj24hvy',
        expectedVtxoKey: '8fdde98a35aab2d4c880e870db500982d1fb6800cc9bc11217ceba76a2c5e96e'
    },
    nsecKey2: {
        nsec: 'nsec1kk0aks7njd72wy2adjrc4qqx4dd5alzjpuvmku8urnx8ljqrwusqzus34y',
        privKeyHex: 'b59fdb43d3937ca7115d6c878a8006ab5b4efc520f19bb70fc1ccc7fc8037720',
        pubKeyXOnly: '123958369d3740a6cd7da98877bb6d4bdb00199aad81b7915de663bec2c617a2',
        expectedAddress: 'tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nm8e5wfwmqqrm6yt30d2quacr9t3svg4qk6q7a5jewvp7yjep0z2gtpj3fd',
        expectedVtxoKey: '9f34725db0007bd11717b540e77032ae30622a0b681eed2597303e24b2178948'
    },
    serverInfo: {
        url: 'https://mutinynet.arkade.sh',
        expectedSignerPubkey: '03fa73c6e4876ffb2dfc961d763cca9abc73d4b88efcb8f5e7ff92dc55e9aa553d',
        expectedSignerPubkeyXOnly: 'fa73c6e4876ffb2dfc961d763cca9abc73d4b88efcb8f5e7ff92dc55e9aa553d',
        expectedExitDelay: 172544,
        expectedNetwork: 'mutinynet'
    }
};

// Helper functions
function bech32Decode(str) {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const BECH32_CONST = 1;
    
    if (str.length < 8 || str.length > 90) return null;
    
    const pos = str.lastIndexOf('1');
    if (pos < 1 || pos + 7 > str.length) return null;
    
    const hrp = str.slice(0, pos);
    const data = str.slice(pos + 1);
    
    const decoded = [];
    for (let i = 0; i < data.length; i++) {
        const v = CHARSET.indexOf(data[i]);
        if (v === -1) return null;
        decoded.push(v);
    }
    
    // Simple validation - just check we can decode
    return decoded.length >= 6 ? { hrp, data: decoded } : null;
}

function hexToPrivateKey(hex) {
    if (hex.length !== 64) throw new Error('Private key must be 64 hex characters');
    return Buffer.from(hex, 'hex');
}

// ================================================================================
// TEST 1: Node.js SDK Module Loading
// ================================================================================
runTest('Node.js SDK module loading', () => {
    console.log('Loading SDK wrapper...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    console.log('Checking exported functions...');
    const requiredFunctions = [
        'generateArkProtocolAddress',
        'generateArkProtocolAddressManual', 
        'decodeArkAddress',
        'fetchServerInfo'
    ];
    
    for (const func of requiredFunctions) {
        if (typeof wrapper[func] !== 'function') {
            return `Missing function: ${func}`;
        }
        console.log(`✓ ${func} available`);
    }
    
    console.log('Checking SDK modules...');
    const requiredModules = ['DefaultVtxo', 'ArkAddress', 'RestArkProvider'];
    for (const module of requiredModules) {
        if (!wrapper[module]) {
            return `Missing module: ${module}`;
        }
        console.log(`✓ ${module} available`);
    }
    
    // Check DefaultVtxo.Script specifically
    if (typeof wrapper.DefaultVtxo?.Script !== 'function') {
        return 'DefaultVtxo.Script is not a function';
    }
    console.log('✓ DefaultVtxo.Script available');
    
    return true;
});

// ================================================================================
// MAIN TEST EXECUTION FUNCTION
// ================================================================================
async function runAllTests() {

// ================================================================================
// TEST 2: Server Info Fetching
// ================================================================================
await runAsyncTest('Server info fetching', async () => {
    console.log('Loading SDK wrapper...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    console.log(`Fetching server info from ${TEST_DATA.serverInfo.url}...`);
    const serverInfo = await wrapper.fetchServerInfo(TEST_DATA.serverInfo.url);
    
    // Convert BigInt to string for logging
    console.log('Server info received:');
    console.log(`- signerPubkey: ${serverInfo.signerPubkey}`);
    console.log(`- unilateralExitDelay: ${serverInfo.unilateralExitDelay.toString()}`);
    console.log(`- network: ${serverInfo.network}`);
    
    // Validate server info structure
    if (!serverInfo.signerPubkey) return 'Missing signerPubkey';
    if (!serverInfo.unilateralExitDelay) return 'Missing unilateralExitDelay';
    if (!serverInfo.network) return 'Missing network';
    
    // Validate expected values
    if (serverInfo.signerPubkey !== TEST_DATA.serverInfo.expectedSignerPubkey) {
        return `Unexpected signerPubkey: got ${serverInfo.signerPubkey}, expected ${TEST_DATA.serverInfo.expectedSignerPubkey}`;
    }
    
    if (Number(serverInfo.unilateralExitDelay) !== TEST_DATA.serverInfo.expectedExitDelay) {
        return `Unexpected exit delay: got ${serverInfo.unilateralExitDelay}, expected ${TEST_DATA.serverInfo.expectedExitDelay}`;
    }
    
    console.log('✓ Server info validation passed');
    return true;
});

// ================================================================================
// TEST 3: nsec Key Decoding
// ================================================================================
runTest('nsec key decoding', () => {
    console.log('Testing nsec key decoding...');
    
    const testKeys = [TEST_DATA.nsecKey1.nsec, TEST_DATA.nsecKey2.nsec];
    const expectedPrivKeys = [TEST_DATA.nsecKey1.privKeyHex, TEST_DATA.nsecKey2.privKeyHex];
    
    for (let i = 0; i < testKeys.length; i++) {
        const nsec = testKeys[i];
        const expectedPrivKey = expectedPrivKeys[i];
        
        console.log(`Testing nsec: ${nsec}`);
        
        // Decode nsec using bech32
        const decoded = bech32Decode(nsec);
        if (!decoded) return `Failed to bech32 decode ${nsec}`;
        if (decoded.hrp !== 'nsec') return `Wrong HRP: expected 'nsec', got '${decoded.hrp}'`;
        
        console.log(`✓ nsec ${i+1} decoded successfully`);
    }
    
    return true;
});

// ================================================================================
// TEST 4: Public Key Format Conversion
// ================================================================================
runTest('Public key format conversion', () => {
    console.log('Testing public key format conversion...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    // Test with both compressed and x-only keys
    const testCases = [
        {
            name: 'nsecKey1 compressed to x-only',
            input: TEST_DATA.nsecKey1.pubKeyCompressed,
            expected: TEST_DATA.nsecKey1.pubKeyXOnly
        },
        {
            name: 'nsecKey1 x-only unchanged',
            input: TEST_DATA.nsecKey1.pubKeyXOnly,
            expected: TEST_DATA.nsecKey1.pubKeyXOnly
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`Testing: ${testCase.name}`);
        
        // Test the conversion by calling the manual function
        try {
            const result = wrapper.generateArkProtocolAddressManual(
                testCase.input,
                TEST_DATA.serverInfo.expectedSignerPubkeyXOnly,
                TEST_DATA.serverInfo.expectedExitDelay,
                'testnet'
            );
            
            if (!result.success) {
                return `${testCase.name} failed: ${result.error}`;
            }
            
            console.log(`✓ ${testCase.name} - conversion successful`);
            
        } catch (error) {
            return `${testCase.name} threw error: ${error.message}`;
        }
    }
    
    return true;
});

// ================================================================================
// TEST 5: Address Generation - Manual Method
// ================================================================================
runTest('Address generation - manual method', () => {
    console.log('Testing manual address generation...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    const testCases = [TEST_DATA.nsecKey1, TEST_DATA.nsecKey2];
    
    for (const testCase of testCases) {
        console.log(`Testing key: ${testCase.nsec}`);
        
        const result = wrapper.generateArkProtocolAddressManual(
            testCase.pubKeyXOnly,
            TEST_DATA.serverInfo.expectedSignerPubkeyXOnly,
            TEST_DATA.serverInfo.expectedExitDelay,
            'testnet'
        );
        
        if (!result.success) {
            return `Manual generation failed for ${testCase.nsec}: ${result.error}`;
        }
        
        console.log(`Generated address: ${result.address}`);
        console.log(`Expected address:  ${testCase.expectedAddress}`);
        console.log(`Generated VTXO:    ${result.vtxoKey}`);
        console.log(`Expected VTXO:     ${testCase.expectedVtxoKey}`);
        
        if (result.address !== testCase.expectedAddress) {
            return `Address mismatch for ${testCase.nsec}`;
        }
        
        if (result.vtxoKey !== testCase.expectedVtxoKey) {
            return `VTXO key mismatch for ${testCase.nsec}`;
        }
        
        console.log(`✓ Manual generation success for ${testCase.nsec}`);
    }
    
    return true;
});

// ================================================================================
// TEST 6: Address Generation - Automatic Method (with server fetch)
// ================================================================================
await runAsyncTest('Address generation - automatic method', async () => {
    console.log('Testing automatic address generation with server fetch...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    const testCases = [TEST_DATA.nsecKey1, TEST_DATA.nsecKey2];
    
    for (const testCase of testCases) {
        console.log(`Testing key: ${testCase.nsec}`);
        
        const result = await wrapper.generateArkProtocolAddress(
            testCase.pubKeyXOnly,
            TEST_DATA.serverInfo.url,
            'testnet'
        );
        
        if (!result.success) {
            return `Automatic generation failed for ${testCase.nsec}: ${result.error}`;
        }
        
        console.log(`Generated address: ${result.address}`);
        console.log(`Expected address:  ${testCase.expectedAddress}`);
        
        if (result.address !== testCase.expectedAddress) {
            return `Address mismatch for ${testCase.nsec}`;
        }
        
        if (result.vtxoKey !== testCase.expectedVtxoKey) {
            return `VTXO key mismatch for ${testCase.nsec}`;
        }
        
        console.log(`✓ Automatic generation success for ${testCase.nsec}`);
    }
    
    return true;
});

// ================================================================================
// TEST 7: Webpack Bundle Testing
// ================================================================================
runTest('Webpack bundle functionality', () => {
    console.log('Testing webpack bundle...');
    
    // Check if bundle exists
    if (!fs.existsSync('src/js/ark-sdk-bundle.js')) {
        return 'Webpack bundle file not found';
    }
    
    const bundleCode = fs.readFileSync('src/js/ark-sdk-bundle.js', 'utf8');
    console.log(`Bundle size: ${bundleCode.length} characters`);
    
    // Create test environment
    const context = {
        window: {},
        console: console,
        Buffer: Buffer,
        process: process,
        global: global,
        TextEncoder: TextEncoder,
        TextDecoder: TextDecoder,
        crypto: crypto
    };
    
    vm.createContext(context);
    
    // Execute bundle
    try {
        vm.runInContext(bundleCode, context);
    } catch (error) {
        return `Bundle execution failed: ${error.message}`;
    }
    
    // Check UMD export
    if (!context.ArkSDK) {
        return 'ArkSDK not available in context after bundle execution';
    }
    
    const requiredKeys = ['DefaultVtxo', 'ArkAddress', 'RestArkProvider'];
    for (const key of requiredKeys) {
        if (!context.ArkSDK[key]) {
            return `Missing ${key} in ArkSDK`;
        }
    }
    
    // Check DefaultVtxo.Script
    if (typeof context.ArkSDK.DefaultVtxo?.Script !== 'function') {
        return 'DefaultVtxo.Script not available as function';
    }
    
    console.log('✓ Webpack bundle test passed');
    return true;
});

// ================================================================================
// TEST 8: Error Handling
// ================================================================================
runTest('Error handling', () => {
    console.log('Testing error handling...');
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    // Test invalid pubkey lengths
    const errorTests = [
        {
            name: 'Invalid pubkey length (too short)',
            pubkey: 'invalid',
            shouldFail: true
        },
        {
            name: 'Invalid pubkey length (too long)', 
            pubkey: 'fa0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496dextra',
            shouldFail: true
        },
        {
            name: 'Invalid hex characters',
            pubkey: 'ga0d588d1afebe820db2f2cf503050ef0ca55e8ea8c4098fa7961c91959a496d',
            shouldFail: true
        }
    ];
    
    for (const test of errorTests) {
        console.log(`Testing: ${test.name}`);
        
        try {
            const result = wrapper.generateArkProtocolAddressManual(
                test.pubkey,
                TEST_DATA.serverInfo.expectedSignerPubkeyXOnly,
                TEST_DATA.serverInfo.expectedExitDelay,
                'testnet'
            );
            
            if (test.shouldFail && result.success) {
                return `${test.name} should have failed but succeeded`;
            }
            
            if (test.shouldFail && !result.success) {
                console.log(`✓ ${test.name} correctly failed: ${result.error}`);
            }
            
        } catch (error) {
            if (test.shouldFail) {
                console.log(`✓ ${test.name} correctly threw error: ${error.message}`);
            } else {
                return `${test.name} should not have thrown: ${error.message}`;
            }
        }
    }
    
    return true;
});

// ================================================================================
// TEST 9: File Structure Verification
// ================================================================================
runTest('File structure verification', () => {
    console.log('Verifying file structure...');
    
    const requiredFiles = [
        'src/index.html',
        'src/js/ark-sdk-wrapper.js',
        'src/js/ark-sdk-bundle.js',
        'webpack.config.js',
        'webpack-entry.js',
        'package.json'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            return `Required file missing: ${file}`;
        }
        console.log(`✓ ${file} exists`);
    }
    
    // Check HTML file contains required elements
    const htmlContent = fs.readFileSync('src/index.html', 'utf8');
    const requiredElements = [
        'ark-protocol-address',
        'ark-result-vtxo-key', 
        'ark-server-pubkey',
        'ark-exit-delay',
        'BTC - Bitcoin Ark Testnet'
    ];
    
    for (const element of requiredElements) {
        if (!htmlContent.includes(element)) {
            return `HTML missing required element: ${element}`;
        }
        console.log(`✓ HTML contains ${element}`);
    }
    
    return true;
});

// ================================================================================
// TEST 10: Network Configuration
// ================================================================================
runTest('Network configuration', () => {
    console.log('Testing network configuration...');
    
    const wrapper = require('./src/js/ark-sdk-wrapper.js');
    
    // Test mainnet vs testnet HRP
    const testCases = [
        {
            network: 'mainnet',
            expectedHrpPrefix: 'ark1'  // Should start with ark1
        },
        {
            network: 'testnet',
            expectedHrpPrefix: 'tark1'  // Should start with tark1
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`Testing ${testCase.network} network...`);
        
        const result = wrapper.generateArkProtocolAddressManual(
            TEST_DATA.nsecKey1.pubKeyXOnly,
            TEST_DATA.serverInfo.expectedSignerPubkeyXOnly,
            TEST_DATA.serverInfo.expectedExitDelay,
            testCase.network
        );
        
        if (!result.success) {
            return `Network test failed for ${testCase.network}: ${result.error}`;
        }
        
        if (!result.address.startsWith(testCase.expectedHrpPrefix)) {
            return `Wrong address prefix for ${testCase.network}: got ${result.address.substring(0, 5)}, expected ${testCase.expectedHrpPrefix}`;
        }
        
        console.log(`✓ ${testCase.network} generates correct address prefix: ${result.address.substring(0, 10)}...`);
    }
    
    return true;
});

// ================================================================================
// RESULTS SUMMARY
// ================================================================================
console.log('\n' + '='.repeat(80));
console.log('🏁 COMPREHENSIVE TEST RESULTS');
console.log('='.repeat(80));

console.log(`Total tests run: ${testResults.total}`);
console.log(`Tests passed: ${testResults.passed} ✅`);
console.log(`Tests failed: ${testResults.failed} ❌`);

const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
console.log(`Success rate: ${successRate}%`);

if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The system is working correctly.');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please review the failures above.`);
    process.exit(1);
}

} // End of runAllTests function

// Execute all tests
runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
});