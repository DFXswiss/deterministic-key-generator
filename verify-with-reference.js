// Verify our BIP86 implementation against known reference values

const crypto = require('crypto');

// Test vectors from BIP86 specification
// https://github.com/bitcoin/bips/blob/master/bip-0086.mediawiki#test-vectors

console.log('=== BIP86 Test Vectors Verification ===\n');

// BIP86 Test Vector
const testVector = {
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    seed: '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4',
    rootPriv: 'xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu',
    account0: {
        xprv: 'xprv9xgqHN7yz9MwCkxsBPN5qetuNdQSUttZNKw1dcYTV4mkaAFiBVGQziHs3NRSWMkCzvgjEe3n9xV8oYywvM8at9yRqyaZVz6TYYhX98VjsUk',
        xpub: 'xpub6BgBgsespWvERF3LHQu6CnqdvfEvtMcQjYrcRzx53QJjSxarj2afYWcLteoGVky7D3UKDP9QyrLprQ3VCECoY49yfdDEHGCtMMj92pReUsQ',
        internalKey: 'cc8a4bc64d897bddc5fbc2f670f7a8ba0b386779106cf1223c6fc5d7cd6fc115',
        firstAddress: {
            path: "m/86'/0'/0'/0/0",
            privateKey: '41f41d69260df4cf277826a9b65a3717e4eeddbeedf637f212e8cbf8eca3d7a9',
            publicKey: 'a60869f0dbcf1dc659c9cecbaf8050135ea9e8cdc487053f1dc6880949dc684c',
            tweakedPubkey: 'a60869f0dbcf1dc659c9cecbaf8050135ea9e8cdc487053f1dc6880949dc684c',
            address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr'
        }
    }
};

console.log('Test Mnemonic:', testVector.mnemonic);
console.log('\nExpected first BIP86 address (m/86\'/0\'/0\'/0/0):');
console.log('Address:', testVector.account0.firstAddress.address);
console.log('Public Key (x-only):', testVector.account0.firstAddress.publicKey);
console.log('');

// Now let's test with our implementation
const puppeteer = require('puppeteer');

async function verifyOurImplementation() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to our tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Test with BIP86 test vector
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, testVector.mnemonic);
        
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
        
        await new Promise(r => setTimeout(r, 2000));
        
        // Click on BIP86 tab
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        // Get the first BIP86 address
        const result = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const firstRow = rows[0];
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                return {
                    path: cells[0] ? cells[0].textContent.trim() : '',
                    address: cells[1] ? cells[1].textContent.trim() : '',
                    pubkey: cells[2] ? cells[2].textContent.trim() : '',
                    privkey: cells[3] ? cells[3].textContent.trim() : ''
                };
            }
            return null;
        });
        
        console.log('Our implementation generates:');
        console.log('Path:   ', result.path);
        console.log('Address:', result.address);
        console.log('PubKey: ', result.pubkey);
        console.log('');
        
        console.log('Verification:');
        console.log('Address matches BIP86 spec:', result.address === testVector.account0.firstAddress.address ? '✅ YES' : '❌ NO');
        
        // Now test with the user's seed
        console.log('\n=== Testing with user seed ===\n');
        console.log('Seed: pioneer force body detect verify lady hire width tissue make zebra boring\n');
        
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, 'pioneer force body detect verify lady hire width tissue make zebra boring');
        
        await new Promise(r => setTimeout(r, 2000));
        
        const userResult = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody.addresses tr');
            const firstRow = rows[0];
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                return {
                    path: cells[0] ? cells[0].textContent.trim() : '',
                    address: cells[1] ? cells[1].textContent.trim() : '',
                    pubkey: cells[2] ? cells[2].textContent.trim() : '',
                    privkey: cells[3] ? cells[3].textContent.trim() : ''
                };
            }
            return null;
        });
        
        console.log('Our implementation generates:');
        console.log('Path:    ', userResult.path);
        console.log('Address: ', userResult.address);
        console.log('PubKey:  ', userResult.pubkey); 
        console.log('PrivKey: ', userResult.privkey);
        console.log('');
        console.log('According to user, bitcoiner.guide generates the same address:');
        console.log('bc1peyp4cj4a48hyk7q7mh7wkmhq20dd45nq26pe684kxavhkf6juw9q9qq5a5');
        
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
    verifyOurImplementation().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);