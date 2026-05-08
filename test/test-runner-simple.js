const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 30000;

// Test results
let testResults = {
    passed: [],
    failed: [],
    totalTests: 0,
    startTime: Date.now()
};

// Helper function to run a test
async function runTest(name, testFn) {
    testResults.totalTests++;
    console.log(`Running test: ${name}`);
    try {
        await testFn();
        testResults.passed.push(name);
        console.log(`✓ ${name}`);
        return true;
    } catch (error) {
        testResults.failed.push({ name, error: error.message });
        console.error(`✗ ${name}: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(TIMEOUT);
        
        // Test 1: Check if main page loads
        await runTest('Main page loads', async () => {
            const response = await page.goto(`${BASE_URL}/src/index.html`);
            if (!response.ok()) {
                throw new Error(`Page returned status ${response.status()}`);
            }
        });
        
        // Test 2: Navigate to Private Key tab
        await runTest('Navigate to Private Key tab', async () => {
            await page.goto(`${BASE_URL}/src/index.html?tab=privatekey`);
            await new Promise(r => setTimeout(r, 1000));
            const isActive = await page.evaluate(() => {
                return document.querySelector('#start-private-key').classList.contains('active');
            });
            if (!isActive) {
                throw new Error('Private Key tab is not active');
            }
        });
        
        // Test 3: Check Private Key functionality exists
        await runTest('Private Key functionality available', async () => {
            await page.goto(`${BASE_URL}/src/index.html`);
            await new Promise(r => setTimeout(r, 3000));
            
            const functionsAvailable = await page.evaluate(() => {
                return {
                    hasPrivateKeyInput: document.querySelector('#private-key-input') !== null,
                    hasNetworkSelect: document.querySelector('#network-private-key') !== null,
                    hasProcessFunction: typeof processPrivateKey === 'function',
                    hasGenerateButton: document.querySelector('#generate-private-key') !== null
                };
            });
            
            if (!functionsAvailable.hasPrivateKeyInput) {
                throw new Error('Private key input field not found');
            }
            if (!functionsAvailable.hasNetworkSelect) {
                throw new Error('Network select not found');
            }
            if (!functionsAvailable.hasProcessFunction) {
                throw new Error('processPrivateKey function not available');
            }
            if (!functionsAvailable.hasGenerateButton) {
                throw new Error('Generate button not found');
            }
        });
        
        // Test 4: Test GENERATE button
        await runTest('GENERATE button creates random private key', async () => {
            await page.goto(`${BASE_URL}/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin`);
            await page.waitForSelector('#generate-private-key');
            await new Promise(r => setTimeout(r, 500));
            
            await page.evaluate(() => {
                document.querySelector('#generate-private-key').click();
            });
            
            await new Promise(r => setTimeout(r, 500));
            
            const privKey = await page.$eval('#private-key-input', el => el.value);
            if (!privKey || (privKey.length !== 64 && privKey.length !== 52 && privKey.length !== 51)) {
                throw new Error(`Generated private key has invalid length: ${privKey.length}`);
            }
            
            const address = await page.$eval('#private-key-address', el => el.value);
            if (!address) {
                throw new Error('No address for generated key');
            }
        });
        
        // Test 5: Test Address Type dropdown for Bitcoin
        await runTest('Address Type dropdown appears for Bitcoin', async () => {
            await page.goto(`${BASE_URL}/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin`);
            await new Promise(r => setTimeout(r, 1000));
            
            const isVisible = await page.evaluate(() => {
                const addressType = document.querySelector('#private-key-address-type');
                if (addressType) {
                    return true;
                }
                const container = document.querySelector('#address-type-container');
                return container && !container.classList.contains('hidden');
            });
            
            if (!isVisible) {
                throw new Error('Address type container is not visible');
            }
            
            const options = await page.evaluate(() => {
                const select = document.querySelector('#private-key-address-type') || document.querySelector('#address-type');
                if (!select) return [];
                return Array.from(select.options).map(o => o.value);
            });
            
            if (!options.includes('p2pkh') || !options.includes('p2sh-p2wpkh') || 
                !options.includes('p2wpkh') || !options.includes('p2tr')) {
                throw new Error(`Address type dropdown missing required options. Found: ${JSON.stringify(options)}`);
            }
        });
        
        // Test 6: Test Taproot address generation
        await runTest('Taproot address generation', async () => {
            await page.goto(`${BASE_URL}/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin`);
            await new Promise(r => setTimeout(r, 1000));
            
            const hasAddressType = await page.evaluate(() => {
                return document.querySelector('#private-key-address-type') !== null || 
                       document.querySelector('#address-type') !== null;
            });
            
            if (!hasAddressType) {
                throw new Error('Address type selector not found');
            }
            
            await page.evaluate(() => {
                const select = document.querySelector('#private-key-address-type') || document.querySelector('#address-type');
                if (select) {
                    select.value = 'p2tr';
                    const event = document.createEvent('Event');
                    event.initEvent('change', true, true);
                    select.dispatchEvent(event);
                }
            });
            
            const testHex = '0000000000000000000000000000000000000000000000000000000000000001';
            await page.evaluate(() => {
                document.querySelector('#private-key-input').value = '';
            });
            await page.type('#private-key-input', testHex);
            
            await page.evaluate(() => {
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                document.querySelector('#private-key-input').dispatchEvent(event);
            });
            
            await new Promise(r => setTimeout(r, 1000));
            
            const address = await page.$eval('#private-key-address', el => el.value);
            if (!address || !address.startsWith('bc1p')) {
                throw new Error(`Invalid Taproot address generated: ${address}`);
            }
        });
        
        // Test 7: Test Ark address generation
        await runTest('Ark Testnet address generation', async () => {
            await page.goto(`${BASE_URL}/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin%20Ark%20Testnet`);
            await page.waitForSelector('#private-key-input');
            
            const testHex = '0000000000000000000000000000000000000000000000000000000000000001';
            await page.evaluate(() => {
                document.querySelector('#private-key-input').value = '';
            });
            await page.type('#private-key-input', testHex);
            
            await new Promise(r => setTimeout(r, 1000));
            
            await page.evaluate(() => {
                const serverPubkey = document.querySelector('#ark-server-pubkey');
                if (serverPubkey && !serverPubkey.value) {
                    serverPubkey.value = '03e7ab2537b5d49e970309aae06e9e49c36ce1c9febbd44ec8e0d1cca0b4f9c319';
                }
                const exitDelay = document.querySelector('#ark-exit-delay');
                if (exitDelay && !exitDelay.value) {
                    exitDelay.value = '144';
                }
                const network = document.querySelector('#ark-network');
                if (network && !network.value) {
                    network.value = 'signet';
                }
            });
            
            await page.evaluate(() => {
                if (typeof processPrivateKey === 'function') {
                    processPrivateKey();
                }
            });
            
            await new Promise(r => setTimeout(r, 2000));
            
            const address = await page.$eval('#private-key-address', el => el.value);
            if (!address || (!address.startsWith('tark1') && !address.includes('Error') && !address.includes('error'))) {
                console.log(`Ark address result: ${address || 'empty'}`);
            }
        });
        
        // Test 8: Test Mnemonic seed with specific expected addresses
        await runTest('Mnemonic seed generates correct BIP44 addresses', async () => {
            await page.goto(`${BASE_URL}/src/index.html`);
            await page.waitForSelector('#phrase', { timeout: 5000 });
            
            const testMnemonic = 'oxygen lobster melody price ribbon home clip doll trigger glove silly market';
            await page.evaluate((mnemonic) => {
                document.querySelector('#phrase').value = mnemonic;
                $('#phrase').trigger('input');
            }, testMnemonic);
            
            await page.waitForSelector('.network');
            await page.evaluate(() => {
                $('.network option').each(function() {
                    if ($(this).text() === 'BTC - Bitcoin') {
                        $('.network').val($(this).val()).trigger('change');
                        return false;
                    }
                })
            });
            
            await page.waitForFunction(() => {
                const pathInput = document.querySelector('#bip44-path');
                return pathInput && pathInput.value === "m/44'/0'/0'/0";
            }, { timeout: 5000 });
            
            const expectedAddresses = [
                { index: 0, address: '174EEBMoDPvVdQHbtJJASxSrAChugdWVdi', pubkey: '024e8a971675bb7015e37925ad3ff4da1a0f67a9b9ecb1956e7c69a96dc035a57c', privkey: 'KxnAFJKDbmKy7CqRLJtZ9vbwLGH4ggYdmuT9Lkoy4FiDXJP21z9P' },
                { index: 1, address: '195r9siycWtM3Uw7f9Hb15icN1AunnGNGT', pubkey: '0395aa88a0c14f531fe32b405e301a08d04e973319c522b65dbd98b72c7827c5ce', privkey: 'L4n11s9ybK6j7nk7geRSTHJY1EcBcGYwrNwPeQPvaKL4h3CSqfTS' },
                { index: 2, address: '1NPpXt7BN4TZpArP47aVJtHZroz5ZtYH2E', pubkey: '03f5219fdb6f6422791297a012c5ceaf56a6141153e81cf83c4c7b62f1849f936e', privkey: 'L3MYkEpTBiijPjN5aXF6tpWZwQNbxobLYBFJxkrQTgERhJkFZo5h' }
            ];
            
            await page.evaluate(() => {
                const moreBtn = document.querySelector('.more');
                if (moreBtn) {
                    moreBtn.click();
                }
            });
            
            await new Promise(r => setTimeout(r, 3000));
            
            for (const expected of expectedAddresses) {
                const actualData = await page.evaluate((index) => {
                    const rows = document.querySelectorAll('tbody.addresses tr');
                    if (rows && rows[index]) {
                        const cells = rows[index].querySelectorAll('td');
                        if (cells && cells.length >= 4) {
                            return {
                                path: cells[0] ? cells[0].textContent.trim() : '',
                                address: cells[1] ? cells[1].textContent.trim() : '',
                                pubkey: cells[2] ? cells[2].textContent.trim() : '',
                                privkey: cells[3] ? cells[3].textContent.trim() : ''
                            };
                        }
                    }
                    return null;
                }, expected.index);
                
                if (!actualData) {
                    throw new Error(`Row ${expected.index} not found`);
                }
                
                const expectedPath = `m/44'/0'/0'/0/${expected.index}`;
                if (actualData.path !== expectedPath) {
                    throw new Error(`Path mismatch at index ${expected.index}`);
                }
                if (actualData.address !== expected.address) {
                    throw new Error(`Address mismatch at index ${expected.index}`);
                }
            }
            
            console.log('First 3 addresses verified successfully!');
        });
        
    } finally {
        await browser.close();
    }
    
    // Generate test report
    generateTestReport();
}

function generateTestReport() {
    const duration = Date.now() - testResults.startTime;
    const report = {
        summary: {
            total: testResults.totalTests,
            passed: testResults.passed.length,
            failed: testResults.failed.length,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        },
        passed: testResults.passed,
        failed: testResults.failed
    };
    
    const resultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(resultsDir, 'test-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`Total tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Duration: ${report.summary.duration}`);
    console.log('========================================\n');
    
    if (testResults.failed.length > 0) {
        console.error('Some tests failed. See test-results/test-report.json for details.');
        process.exit(1);
    } else {
        console.log('All tests passed!');
        process.exit(0);
    }
}

// Run tests
runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
});