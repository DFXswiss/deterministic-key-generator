const puppeteer = require('puppeteer');

async function testAddressConsistency() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing Address Generation Consistency ===\n');
        console.log('Comparing address generation between Mnemonic tab and Private Key tab\n');
        
        // Navigate to our tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Test seed
        const testSeed = 'pioneer force body detect verify lady hire width tissue make zebra boring';
        
        // ============ PART 1: Get addresses from Mnemonic tab ============
        console.log('PART 1: Mnemonic Tab (BIP86)\n');
        console.log('Seed:', testSeed, '\n');
        
        // Enter seed
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, testSeed);
        
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
        
        // Click on BIP86 tab for Taproot
        await page.evaluate(() => {
            $('#bip86-tab a').click();
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        // Get first BIP86 address and private key
        const bip86Result = await page.evaluate(() => {
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
        
        console.log('BIP86 Taproot (P2TR) from Mnemonic:');
        console.log('Path:    ', bip86Result.path);
        console.log('Address: ', bip86Result.address);
        console.log('PubKey:  ', bip86Result.pubkey);
        console.log('PrivKey: ', bip86Result.privkey);
        console.log('');
        
        // Get BIP84 Native SegWit
        await page.evaluate(() => {
            $('#bip84-tab a').click();
        });
        await new Promise(r => setTimeout(r, 2000));
        
        const bip84Result = await page.evaluate(() => {
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
        
        console.log('BIP84 Native SegWit (P2WPKH) from Mnemonic:');
        console.log('Path:    ', bip84Result.path);
        console.log('Address: ', bip84Result.address);
        console.log('PrivKey: ', bip84Result.privkey);
        console.log('');
        
        // Get BIP49 Nested SegWit
        await page.evaluate(() => {
            $('#bip49-tab a').click();
        });
        await new Promise(r => setTimeout(r, 2000));
        
        const bip49Result = await page.evaluate(() => {
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
        
        console.log('BIP49 Nested SegWit (P2SH-P2WPKH) from Mnemonic:');
        console.log('Path:    ', bip49Result.path);
        console.log('Address: ', bip49Result.address);
        console.log('PrivKey: ', bip49Result.privkey);
        console.log('');
        
        // Get BIP44 Legacy
        await page.evaluate(() => {
            $('#bip44-tab a').click();
        });
        await new Promise(r => setTimeout(r, 2000));
        
        const bip44Result = await page.evaluate(() => {
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
        
        console.log('BIP44 Legacy (P2PKH) from Mnemonic:');
        console.log('Path:    ', bip44Result.path);
        console.log('Address: ', bip44Result.address);
        console.log('PrivKey: ', bip44Result.privkey);
        console.log('');
        
        // ============ PART 2: Test with Private Key tab ============
        console.log('─'.repeat(60));
        console.log('\nPART 2: Private Key Tab\n');
        
        // Click on Private Key tab
        await page.evaluate(() => {
            $('#start-with-tabs a[href="#start-private-key"]').tab('show');
        });
        await new Promise(r => setTimeout(r, 1000));
        
        // Test each private key
        const testCases = [
            { name: 'BIP86 Taproot', privkey: bip86Result.privkey, type: 'p2tr', expected: bip86Result.address },
            { name: 'BIP84 Native SegWit', privkey: bip84Result.privkey, type: 'p2wpkh', expected: bip84Result.address },
            { name: 'BIP49 Nested SegWit', privkey: bip49Result.privkey, type: 'p2sh-p2wpkh', expected: bip49Result.address },
            { name: 'BIP44 Legacy', privkey: bip44Result.privkey, type: 'p2pkh', expected: bip44Result.address }
        ];
        
        console.log('Testing private keys from mnemonic addresses:\n');
        
        for (const testCase of testCases) {
            // Enter private key
            await page.evaluate((privkey) => {
                document.querySelector('#private-key-input').value = privkey;
                $('#private-key-input').trigger('input');
            }, testCase.privkey);
            
            // Select address type
            await page.evaluate((type) => {
                $('#private-key-address-type').val(type).trigger('change');
            }, testCase.type);
            
            await new Promise(r => setTimeout(r, 1000));
            
            // Get generated address
            const result = await page.evaluate(() => {
                const addressEl = document.querySelector('#private-key-address');
                const pubkeyEl = document.querySelector('#private-key-public');
                const wifEl = document.querySelector('#private-key-wif');
                
                return {
                    address: addressEl ? addressEl.value.trim() : 'not found',
                    pubkey: pubkeyEl ? pubkeyEl.value.trim() : 'not found',
                    wif: wifEl ? wifEl.value.trim() : 'not found'
                };
            });
            
            console.log(`${testCase.name} (${testCase.type}):`);
            console.log('Private Key:', testCase.privkey);
            console.log('Expected:   ', testCase.expected);
            console.log('Generated:  ', result.address);
            console.log('Match:      ', result.address === testCase.expected ? '✅ YES' : '❌ NO');
            console.log('');
        }
        
        // ============ PART 3: Cross-check compressed vs uncompressed ============
        console.log('─'.repeat(60));
        console.log('\nPART 3: Testing Compressed vs Uncompressed Keys\n');
        
        // Test with uncompressed key for legacy address
        await page.evaluate((privkey) => {
            document.querySelector('#private-key-input').value = privkey;
            $('#private-key-input').trigger('input');
        }, bip44Result.privkey);
        
        await page.evaluate(() => {
            $('#private-key-address-type').val('p2pkh').trigger('change');
            $('#private-key-compressed').prop('checked', false).trigger('change');
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const uncompressedResult = await page.evaluate(() => {
            const addressEl = document.querySelector('#private-key-address');
            return addressEl ? addressEl.value.trim() : 'not found';
        });
        
        console.log('Legacy with uncompressed key:', uncompressedResult);
        console.log('Original (compressed):        ', bip44Result.address);
        console.log('Different (as expected):      ', uncompressedResult !== bip44Result.address ? '✅ YES' : '❌ NO');
        
        // ============ Summary ============
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY\n');
        
        const allMatch = testCases.every(tc => {
            if (tc.name === 'BIP86 Taproot') return tc.expected === bip86Result.address;
            if (tc.name === 'BIP84 Native SegWit') return tc.expected === bip84Result.address;
            if (tc.name === 'BIP49 Nested SegWit') return tc.expected === bip49Result.address;
            if (tc.name === 'BIP44 Legacy') return tc.expected === bip44Result.address;
            return false;
        });
        
        if (allMatch) {
            console.log('✅ All address types generate identical addresses in both tabs!');
            console.log('✅ Address generation is consistent between Mnemonic and Private Key tabs');
        } else {
            console.log('❌ Inconsistency detected in address generation!');
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
    testAddressConsistency().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);