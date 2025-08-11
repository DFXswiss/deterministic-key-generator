const puppeteer = require('puppeteer');

async function testBech32mEncoding() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable ALL console logging
        page.on('console', msg => {
            console.log('PAGE:', msg.text());
        });
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log('\n=== Testing Bech32m Encoding ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await new Promise(r => setTimeout(r, 2000));
        
        // Test the bech32m encoding directly
        const result = await page.evaluate(() => {
            try {
                // Test with the expected tweaked pubkey from bitcoiner.guide
                const tweakedPubkeyHex = 'c9035c4abda9ee4b781eddfceb6ee053dadad26056839d1eb637597b2752e38a';
                
                // Convert hex to bytes
                const tweakedPubkey = [];
                for (let i = 0; i < tweakedPubkeyHex.length; i += 2) {
                    tweakedPubkey.push(parseInt(tweakedPubkeyHex.substr(i, 2), 16));
                }
                
                // Test if bech32m object exists
                if (typeof bech32m === 'undefined') {
                    return { error: 'bech32m object not found' };
                }
                
                // Try to encode
                const data = [1].concat(bech32m.toWords(tweakedPubkey));
                const address = bech32m.encode('bc', data);
                
                return {
                    success: true,
                    inputHex: tweakedPubkeyHex,
                    address: address,
                    expectedAddress: 'bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5'
                };
                
            } catch (e) {
                return { error: e.message, stack: e.stack };
            }
        });
        
        console.log('Bech32m encoding test result:', result);
        
        if (result.success) {
            console.log('\nGenerated address:', result.address);
            console.log('Expected address: ', result.expectedAddress);
            console.log('Match:', result.address === result.expectedAddress ? '✓ YES' : '✗ NO');
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
    testBech32mEncoding().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);