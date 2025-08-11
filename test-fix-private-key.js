const puppeteer = require('puppeteer');

async function testPrivateKeyIssues() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('PAGE ERROR:', msg.text());
            }
        });
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Issue 1: WIF Private Key Test ===');
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin');
        await new Promise(r => setTimeout(r, 2000));
        
        const testWIF = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';
        await page.type('#private-key-input', testWIF);
        
        // Trigger input event
        await page.evaluate(() => {
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const wifResult = await page.evaluate(() => {
            return {
                input: document.querySelector('#private-key-input').value,
                pubkey: document.querySelector('#private-key-public').value,
                pubkeyLength: document.querySelector('#private-key-public').value.length,
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value,
                resultsHidden: document.querySelector('#private-key-results').classList.contains('hidden')
            };
        });
        console.log('WIF Result:', wifResult);
        console.log('Public key is 66 chars:', wifResult.pubkeyLength === 66);
        console.log('Public key >= 66 chars:', wifResult.pubkeyLength >= 66);
        
        console.log('\n=== Issue 2: Hex Private Key Test ===');
        await page.evaluate(() => {
            document.querySelector('#private-key-input').value = '';
        });
        
        const testHex = '0000000000000000000000000000000000000000000000000000000000000001';
        await page.type('#private-key-input', testHex);
        
        await page.evaluate(() => {
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const hexResult = await page.evaluate(() => {
            return {
                input: document.querySelector('#private-key-input').value,
                wif: document.querySelector('#private-key-wif').value,
                address: document.querySelector('#private-key-address').value,
                pubkey: document.querySelector('#private-key-public').value
            };
        });
        console.log('Hex Result:', hexResult);
        console.log('Has address:', hexResult.address.length > 0);
        console.log('Has WIF:', hexResult.wif.length > 0);
        
        console.log('\n=== Issue 3: Bitcoin Testnet ===');
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin%20Testnet');
        await new Promise(r => setTimeout(r, 3000));
        
        // Check if network is loaded
        const networkLoaded = await page.evaluate(() => {
            const networkSelect = document.querySelector('#network-private-key');
            return {
                exists: networkSelect !== null,
                value: networkSelect ? networkSelect.value : 'not found',
                text: networkSelect ? networkSelect.options[networkSelect.selectedIndex].text : 'not found'
            };
        });
        console.log('Network loaded:', networkLoaded);
        
        const testnetWIF = 'cMahea7zqjxrtgAbB7LSGbcQUr1uX1ojuat9jZodMN87JcbXMTcA';
        await page.evaluate(() => {
            document.querySelector('#private-key-input').value = '';
        });
        await page.type('#private-key-input', testnetWIF);
        
        await page.evaluate(() => {
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        const testnetResult = await page.evaluate(() => {
            return {
                input: document.querySelector('#private-key-input').value,
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value,
                error: document.querySelector('#private-key-error').textContent
            };
        });
        console.log('Testnet Result:', testnetResult);
        
        console.log('\n=== Issue 4: Ark Testnet ===');
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin%20Ark%20Testnet');
        await new Promise(r => setTimeout(r, 3000));
        
        // Check if Ark params are visible
        const arkParams = await page.evaluate(() => {
            const arkDiv = document.querySelector('.ark-params');
            return {
                exists: arkDiv !== null,
                hidden: arkDiv ? arkDiv.classList.contains('hidden') : true,
                serverPubkey: document.querySelector('#ark-server-pubkey') ? document.querySelector('#ark-server-pubkey').value : 'not found'
            };
        });
        console.log('Ark params:', arkParams);
        
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
    testPrivateKeyIssues().then(() => {
        server.kill();
    }).catch(error => {
        console.error(error);
        server.kill();
    });
}, 2000);