const puppeteer = require('puppeteer');

async function debugTaproot() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('Error') || text.includes('error')) {
                console.log('PAGE ERROR:', text);
            }
        });
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Debugging Taproot Implementation ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Enter the test seed
        const testSeed = 'pioneer force body detect verify lady hire width tissue make zebra boring';
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, testSeed);
        
        // Wait for processing
        await new Promise(r => setTimeout(r, 1000));
        
        // Select Bitcoin
        await page.evaluate(() => {
            $('.network option').each(function() {
                if ($(this).text() === 'BTC - Bitcoin') {
                    $('.network').val($(this).val()).trigger('change');
                    return false;
                }
            });
        });
        
        // Wait for network to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Click on BIP86 tab
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        // Wait for BIP86 addresses to generate
        await new Promise(r => setTimeout(r, 2000));
        
        // Capture any errors
        await new Promise(r => setTimeout(r, 1000));
        
        // Get debugging info
        const debugInfo = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const firstRow = rows[0];
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                return {
                    hasRow: true,
                    cellCount: cells.length,
                    path: cells[0] ? cells[0].textContent.trim() : 'no path',
                    address: cells[1] ? cells[1].textContent.trim() : 'no address',
                    pubkey: cells[2] ? cells[2].textContent.trim() : 'no pubkey',
                    privkey: cells[3] ? cells[3].textContent.trim() : 'no privkey'
                };
            }
            return { hasRow: false };
        });
        
        console.log('Debug Info:', debugInfo);
        
        // Try to test the functions directly
        const functionTest = await page.evaluate(() => {
            try {
                // Test if functions exist
                const funcs = {
                    taggedHash: typeof taggedHash,
                    applyTaprootTweak: typeof applyTaprootTweak,
                    generateBech32mAddress: typeof generateBech32mAddress,
                    libs: typeof libs
                };
                
                // Try a simple test
                if (typeof taggedHash === 'function' && typeof libs !== 'undefined') {
                    const testData = [1, 2, 3];
                    const hash = taggedHash('TapTweak', testData);
                    funcs.hashLength = hash ? hash.length : 0;
                }
                
                return funcs;
            } catch (e) {
                return { error: e.message };
            }
        });
        
        console.log('\nFunction availability:', functionTest);
        
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
    debugTaproot().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);