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
        
        console.log('\n=== Debug WIF Private Key Test ===\n');
        
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin');
        
        // Wait for page to fully load
        await new Promise(r => setTimeout(r, 3000));
        
        // Check if processPrivateKey is available
        const functionAvailable = await page.evaluate(() => {
            return {
                processPrivateKey: typeof processPrivateKey,
                networks: typeof networks,
                libs: typeof libs,
                bitcoin: typeof libs !== 'undefined' && libs.bitcoin ? 'available' : 'not available',
                jQuery: typeof $ !== 'undefined',
                networkSelect: document.querySelector('#network-private-key') ? 'exists' : 'missing'
            };
        });
        console.log('Functions available:', functionAvailable);
        
        // Try to set WIF
        const testWIF = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';
        await page.type('#private-key-input', testWIF);
        
        // Try different ways to trigger processing
        console.log('\nAttempt 1: Trigger input event...');
        await page.evaluate(() => {
            const event = document.createEvent('Event');
            event.initEvent('input', true, true);
            document.querySelector('#private-key-input').dispatchEvent(event);
        });
        await new Promise(r => setTimeout(r, 1000));
        
        let result = await page.evaluate(() => {
            return {
                pubkey: document.querySelector('#private-key-public').value,
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value
            };
        });
        console.log('Result after input event:', result);
        
        console.log('\nAttempt 2: Call processPrivateKey directly...');
        const processResult = await page.evaluate(() => {
            try {
                if (typeof processPrivateKey === 'function') {
                    processPrivateKey();
                    return 'called successfully';
                } else {
                    return 'function not available';
                }
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('processPrivateKey call result:', processResult);
        
        await new Promise(r => setTimeout(r, 1000));
        
        result = await page.evaluate(() => {
            return {
                pubkey: document.querySelector('#private-key-public').value,
                address: document.querySelector('#private-key-address').value,
                wif: document.querySelector('#private-key-wif').value,
                error: document.querySelector('#private-key-error').textContent
            };
        });
        console.log('Result after processPrivateKey:', result);
        
        // Check if error is shown
        if (result.error) {
            console.log('Error shown:', result.error);
        }
        
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
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);