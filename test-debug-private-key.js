const puppeteer = require('puppeteer');

async function debugPrivateKeyTests() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Testing Private Key Tab ===\n');
        
        // Navigate to Private Key tab
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin');
        await new Promise(r => setTimeout(r, 2000));
        
        // Test 1: Check if fields exist
        console.log('1. Checking if Private Key fields exist:');
        const fieldsExist = await page.evaluate(() => {
            return {
                input: document.querySelector('#private-key-input') !== null,
                wif: document.querySelector('#private-key-wif') !== null,
                pubkey: document.querySelector('#private-key-public') !== null,
                address: document.querySelector('#private-key-address') !== null,
                generateBtn: document.querySelector('#generate-private-key') !== null,
                resultsDiv: document.querySelector('#private-key-results') !== null
            };
        });
        console.log('Fields exist:', fieldsExist);
        
        // Test 2: Enter WIF private key
        console.log('\n2. Testing WIF private key:');
        const testWIF = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';
        await page.evaluate((wif) => {
            document.querySelector('#private-key-input').value = wif;
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        }, testWIF);
        
        await new Promise(r => setTimeout(r, 1000));
        
        const wifResults = await page.evaluate(() => {
            return {
                pubkey: document.querySelector('#private-key-public').value,
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value,
                resultsHidden: document.querySelector('#private-key-results').classList.contains('hidden')
            };
        });
        console.log('WIF Results:', wifResults);
        console.log('Public key length:', wifResults.pubkey.length);
        console.log('Address starts with 1:', wifResults.address.startsWith('1'));
        
        // Test 3: Clear and enter hex private key
        console.log('\n3. Testing hex private key:');
        const testHex = '0000000000000000000000000000000000000000000000000000000000000001';
        await page.evaluate((hex) => {
            document.querySelector('#private-key-input').value = hex;
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        }, testHex);
        
        await new Promise(r => setTimeout(r, 1000));
        
        const hexResults = await page.evaluate(() => {
            return {
                wif: document.querySelector('#private-key-wif').value,
                pubkey: document.querySelector('#private-key-public').value,
                address: document.querySelector('#private-key-address').value
            };
        });
        console.log('Hex Results:', hexResults);
        console.log('WIF starts with K or L:', hexResults.wif.startsWith('K') || hexResults.wif.startsWith('L'));
        
        // Test 4: Test GENERATE button
        console.log('\n4. Testing GENERATE button:');
        await page.evaluate(() => {
            document.querySelector('#generate-private-key').click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const generateResults = await page.evaluate(() => {
            const privKeyValue = document.querySelector('#private-key-input').value;
            return {
                privKey: privKeyValue,
                privKeyLength: privKeyValue.length,
                wif: document.querySelector('#private-key-wif').value,
                address: document.querySelector('#private-key-address').value
            };
        });
        console.log('Generate Results:', generateResults);
        
        // Test 5: Check address type dropdown
        console.log('\n5. Testing address type dropdown:');
        const addressTypeInfo = await page.evaluate(() => {
            const dropdown = document.querySelector('#private-key-address-type');
            if (!dropdown) return { exists: false };
            
            const options = Array.from(dropdown.options).map(opt => ({
                value: opt.value,
                text: opt.text
            }));
            
            return {
                exists: true,
                options: options,
                currentValue: dropdown.value
            };
        });
        console.log('Address Type Info:', addressTypeInfo);
        
        // Test 6: Test Bitcoin Testnet
        console.log('\n6. Testing Bitcoin Testnet:');
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin%20Testnet');
        await new Promise(r => setTimeout(r, 2000));
        
        const testnetWIF = 'cMahea7zqjxrtgAbB7LSGbcQUr1uX1ojuat9jZodMN87JcbXMTcA';
        await page.evaluate((wif) => {
            document.querySelector('#private-key-input').value = wif;
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        }, testnetWIF);
        
        await new Promise(r => setTimeout(r, 1000));
        
        const testnetResults = await page.evaluate(() => {
            return {
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value
            };
        });
        console.log('Testnet Results:', testnetResults);
        console.log('Valid testnet address:', 
            testnetResults.address.startsWith('m') || 
            testnetResults.address.startsWith('n') || 
            testnetResults.address.startsWith('2') ||
            testnetResults.address.startsWith('tb'));
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

// Start HTTP server first
const { spawn } = require('child_process');
const path = require('path');

const server = spawn('python3', ['-m', 'http.server', '8080', '--bind', '127.0.0.1'], {
    cwd: path.join(__dirname),
    detached: false,
    stdio: 'ignore'
});

// Wait for server to start
setTimeout(() => {
    debugPrivateKeyTests().then(() => {
        server.kill();
    }).catch(error => {
        console.error(error);
        server.kill();
    });
}, 2000);