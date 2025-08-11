const puppeteer = require('puppeteer');

async function debugTweak() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Debug Taproot Tweak ===\n');
        
        // Navigate to the tool
        await page.goto('http://localhost:8080/src/index.html');
        await new Promise(r => setTimeout(r, 2000));
        
        // Test the tweak function directly
        const result = await page.evaluate(() => {
            try {
                // Test public key from our example
                // 03d0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2
                var testPubkeyHex = 'd0ed6676dc17e0707776590807da7abb50064234b232e12fc47defa671e32dc2';
                
                // Convert hex to bytes
                var xOnlyPubkey = [];
                for (var i = 0; i < testPubkeyHex.length; i += 2) {
                    xOnlyPubkey.push(parseInt(testPubkeyHex.substr(i, 2), 16));
                }
                
                // Try to apply tweak
                if (typeof applyTaprootTweak === 'function') {
                    var tweaked = applyTaprootTweak(xOnlyPubkey);
                    
                    // Convert back to hex
                    var tweakedHex = '';
                    for (var i = 0; i < tweaked.length; i++) {
                        var hex = tweaked[i].toString(16);
                        if (hex.length === 1) hex = '0' + hex;
                        tweakedHex += hex;
                    }
                    
                    return {
                        success: true,
                        originalHex: testPubkeyHex,
                        tweakedHex: tweakedHex,
                        tweakedLength: tweaked.length
                    };
                } else {
                    return { success: false, error: 'applyTaprootTweak not found' };
                }
            } catch (e) {
                return { success: false, error: e.message, stack: e.stack };
            }
        });
        
        console.log('Tweak test result:', result);
        
        if (result.success) {
            console.log('\nOriginal x-only pubkey:', result.originalHex);
            console.log('Tweaked x-only pubkey: ', result.tweakedHex);
            console.log('\nExpected tweaked pubkey: d023f4c0bf4ebdff8054e70e456024924cc99f7b13205324827921773dc878e8');
            
            if (result.tweakedHex === 'd023f4c0bf4ebdff8054e70e456024924cc99f7b13205324827921773dc878e8') {
                console.log('✓ Tweak is correct!');
            } else {
                console.log('✗ Tweak is incorrect!');
            }
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
    debugTweak().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);