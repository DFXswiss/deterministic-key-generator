const puppeteer = require('puppeteer');

async function testMainCoinsConsistency() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing Address Generation Consistency for Main Coins ===\n');
        
        // Navigate to our tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Test seed
        const testSeed = 'pioneer force body detect verify lady hire width tissue make zebra boring';
        
        // Main coins to test - those that have full private key support
        const mainCoins = [
            { value: '0', name: 'BTC - Bitcoin' },
            { value: '1', name: 'BTC - Bitcoin Testnet' },
            { value: '144', name: 'BTC - Bitcoin RegTest' },
            { value: '204', name: 'BTC - Bitcoin Ark Testnet' },
            { value: '2', name: 'LTC - Litecoin' },
            { value: '1', name: 'LTCt - Litecoin Testnet' }
        ];
        
        const results = [];
        
        for (const coin of mainCoins) {
            console.log('─'.repeat(60));
            console.log(`Testing: ${coin.name}`);
            console.log('─'.repeat(60));
            
            const coinResult = {
                name: coin.name,
                tests: []
            };
            
            // Switch to Mnemonic tab
            await page.evaluate(() => {
                $('#start-with-tabs a[href="#start-mnemonic"]').tab('show');
            });
            await new Promise(r => setTimeout(r, 500));
            
            // Enter seed if first time
            await page.evaluate((seed) => {
                if (!document.querySelector('#phrase').value) {
                    document.querySelector('#phrase').value = seed;
                    $('#phrase').trigger('input');
                }
            }, testSeed);
            await new Promise(r => setTimeout(r, 500));
            
            // Select network
            await page.evaluate((networkName) => {
                $('.network option').each(function() {
                    if ($(this).text() === networkName) {
                        $('.network').val($(this).val()).trigger('change');
                        return false;
                    }
                });
            }, coin.name);
            await new Promise(r => setTimeout(r, 2000));
            
            // Test different derivation paths
            const pathsToTest = [];
            
            // Check which tabs are visible
            const visibleTabs = await page.evaluate(() => {
                const tabs = [];
                if (!$('#bip44-tab').hasClass('hidden')) tabs.push('BIP44');
                if (!$('#bip49-tab').hasClass('hidden')) tabs.push('BIP49');
                if (!$('#bip84-tab').hasClass('hidden')) tabs.push('BIP84');
                if (!$('#bip86-tab').hasClass('hidden')) tabs.push('BIP86');
                return tabs;
            });
            
            for (const tabName of visibleTabs) {
                console.log(`\nTesting ${tabName}:`);
                
                // Click on the tab
                const tabId = tabName.toLowerCase();
                await page.evaluate((id) => {
                    $(`#${id}-tab a`).click();
                }, tabId);
                await new Promise(r => setTimeout(r, 1500));
                
                // Get first address from Mnemonic tab
                const mnemonicResult = await page.evaluate(() => {
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
                
                if (!mnemonicResult || !mnemonicResult.privkey) {
                    console.log('  ⚠️  No address generated');
                    continue;
                }
                
                console.log(`  Mnemonic Tab:`);
                console.log(`    Path:    ${mnemonicResult.path}`);
                console.log(`    Address: ${mnemonicResult.address}`);
                console.log(`    PrivKey: ${mnemonicResult.privkey.substring(0, 10)}...`);
                
                // Switch to Private Key tab
                await page.evaluate(() => {
                    $('#start-with-tabs a[href="#start-private-key"]').tab('show');
                });
                await new Promise(r => setTimeout(r, 500));
                
                // Select same network
                await page.evaluate((networkName) => {
                    $('#network-private-key option').each(function() {
                        if ($(this).text() === networkName) {
                            $('#network-private-key').val($(this).val()).trigger('change');
                            return false;
                        }
                    });
                }, coin.name);
                await new Promise(r => setTimeout(r, 1000));
                
                // Enter private key
                await page.evaluate((privkey) => {
                    document.querySelector('#private-key-input').value = privkey;
                    $('#private-key-input').trigger('input');
                }, mnemonicResult.privkey);
                
                // Determine address type based on BIP
                let addressType = 'p2pkh'; // default
                if (tabName === 'BIP86') addressType = 'p2tr';
                else if (tabName === 'BIP84') addressType = 'p2wpkh';
                else if (tabName === 'BIP49') addressType = 'p2sh-p2wpkh';
                
                // Check if address type selector is visible
                const hasAddressTypes = await page.evaluate(() => {
                    return $('.segwit-options').is(':visible');
                });
                
                if (hasAddressTypes) {
                    await page.evaluate((type) => {
                        $('#private-key-address-type').val(type).trigger('change');
                    }, addressType);
                }
                
                await new Promise(r => setTimeout(r, 1000));
                
                // Get address from Private Key tab
                const privateKeyResult = await page.evaluate(() => {
                    const addressEl = document.querySelector('#private-key-address');
                    const pubkeyEl = document.querySelector('#private-key-public');
                    const errorEl = document.querySelector('#private-key-error');
                    
                    if (errorEl && !errorEl.classList.contains('hidden')) {
                        return {
                            error: errorEl.textContent.trim()
                        };
                    }
                    
                    return {
                        address: addressEl ? addressEl.value.trim() : 'not found',
                        pubkey: pubkeyEl ? pubkeyEl.value.trim() : 'not found'
                    };
                });
                
                if (privateKeyResult.error) {
                    console.log(`  Private Key Tab:`);
                    console.log(`    ❌ Error: ${privateKeyResult.error}`);
                    coinResult.tests.push({
                        type: tabName,
                        match: false,
                        error: privateKeyResult.error
                    });
                } else {
                    console.log(`  Private Key Tab:`);
                    console.log(`    Address: ${privateKeyResult.address}`);
                    
                    const match = mnemonicResult.address === privateKeyResult.address;
                    console.log(`  Match: ${match ? '✅ YES' : '❌ NO'}`);
                    
                    coinResult.tests.push({
                        type: tabName,
                        match: match,
                        mnemonicAddress: mnemonicResult.address,
                        privateKeyAddress: privateKeyResult.address
                    });
                }
            }
            
            results.push(coinResult);
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60) + '\n');
        
        let totalTests = 0;
        let totalMatches = 0;
        
        results.forEach(result => {
            console.log(`${result.name}:`);
            result.tests.forEach(test => {
                totalTests++;
                if (test.match) totalMatches++;
                const status = test.error ? '❌ (Error)' : (test.match ? '✅' : '❌');
                console.log(`  ${test.type}: ${status}`);
                if (test.error) {
                    console.log(`    Error: ${test.error.substring(0, 50)}...`);
                }
            });
        });
        
        console.log(`\nTotal: ${totalMatches}/${totalTests} tests passed`);
        
        if (totalMatches === totalTests) {
            console.log('\n✅ Perfect consistency across all tested coins!');
        } else {
            console.log('\n⚠️  Some issues detected');
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
    testMainCoinsConsistency().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);