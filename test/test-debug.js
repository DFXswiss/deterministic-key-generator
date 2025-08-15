const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

async function testPrivateKeyTab() {
    // Start HTTP server
    const server = spawn('python3', ['-m', 'http.server', '8080', '--bind', '127.0.0.1'], {
        cwd: path.join(__dirname, '..'),
        detached: false,
        stdio: 'ignore'
    });
    
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('Loading page...');
        await page.goto('http://localhost:8080/src/index.html?tab=privatekey&coin=BTC%20-%20Bitcoin');
        
        // Wait for page to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Check if required functions exist
        const functionsExist = await page.evaluate(() => {
            return {
                processPrivateKey: typeof processPrivateKey === 'function',
                libs: typeof libs !== 'undefined',
                bitcoin: typeof libs !== 'undefined' && typeof libs.bitcoin !== 'undefined',
                networks: typeof networks !== 'undefined',
                jquery: typeof $ !== 'undefined'
            };
        });
        
        console.log('Functions available:', functionsExist);
        
        // Check if tab is active
        const tabActive = await page.evaluate(() => {
            const tab = document.querySelector('#start-private-key');
            return tab && tab.classList.contains('active');
        });
        console.log('Private Key tab active:', tabActive);
        
        // Check if input exists
        const inputExists = await page.evaluate(() => {
            return document.querySelector('#private-key-input') !== null;
        });
        console.log('Private key input exists:', inputExists);
        
        // Try to enter a private key
        if (inputExists) {
            console.log('Entering test private key...');
            await page.type('#private-key-input', '0000000000000000000000000000000000000000000000000000000000000001');
            
            // Try to process
            const result = await page.evaluate(() => {
                if (typeof processPrivateKey === 'function') {
                    try {
                        processPrivateKey();
                        return 'Function called';
                    } catch (e) {
                        return 'Error: ' + e.message;
                    }
                } else {
                    return 'Function not found';
                }
            });
            console.log('Process result:', result);
            
            // Wait a bit
            await new Promise(r => setTimeout(r, 1000));
            
            // Check results
            const values = await page.evaluate(() => {
                return {
                    privKey: document.querySelector('#private-key-input')?.value || '',
                    wif: document.querySelector('#private-key-wif')?.value || '',
                    pubKey: document.querySelector('#private-key-public')?.value || '',
                    address: document.querySelector('#private-key-address')?.value || '',
                    error: document.querySelector('#private-key-error')?.textContent || ''
                };
            });
            console.log('Field values:', values);
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
        server.kill();
    }
}

testPrivateKeyTab().catch(console.error);