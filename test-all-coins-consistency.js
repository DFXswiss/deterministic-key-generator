const puppeteer = require('puppeteer');

async function testAllCoinsConsistency() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('\n=== Testing Address Generation Consistency for All Supported Coins ===\n');
        
        // Navigate to our tool
        await page.goto('http://localhost:8080/src/index.html');
        await page.waitForSelector('#phrase');
        
        // Test seed
        const testSeed = 'pioneer force body detect verify lady hire width tissue make zebra boring';
        
        // Enter seed
        await page.evaluate((seed) => {
            document.querySelector('#phrase').value = seed;
            $('#phrase').trigger('input');
        }, testSeed);
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Get list of all networks
        const networks = await page.evaluate(() => {
            const options = [];
            $('.network option').each(function() {
                options.push({
                    value: $(this).val(),
                    text: $(this).text()
                });
            });
            return options;
        });
        
        console.log(`Found ${networks.length} networks to test\n`);
        
        // Switch to Private Key tab
        await page.evaluate(() => {
            $('#start-with-tabs a[href="#start-private-key"]').tab('show');
        });
        await new Promise(r => setTimeout(r, 1000));
        
        // Get networks available in Private Key tab
        const privateKeyNetworks = await page.evaluate(() => {
            const options = [];
            $('#network-private-key option').each(function() {
                options.push({
                    value: $(this).val(),
                    text: $(this).text()
                });
            });
            return options;
        });
        
        console.log(`Networks supporting Private Key import: ${privateKeyNetworks.length}\n`);
        console.log('Supported networks:');
        privateKeyNetworks.forEach(net => console.log(`  - ${net.text}`));
        console.log('');
        
        const results = [];
        
        // Test each supported network
        for (const network of privateKeyNetworks) {
            console.log('─'.repeat(60));
            console.log(`Testing: ${network.text}`);
            console.log('─'.repeat(60));
            
            const networkResult = {
                name: network.text,
                addresses: {}
            };
            
            // Switch back to Mnemonic tab
            await page.evaluate(() => {
                $('#start-with-tabs a[href="#start-mnemonic"]').tab('show');
            });
            await new Promise(r => setTimeout(r, 500));
            
            // Select network in Mnemonic tab
            await page.evaluate((val) => {
                $('.network').val(val).trigger('change');
            }, network.value);
            await new Promise(r => setTimeout(r, 2000));
            
            // Get available derivation tabs for this network
            const availableTabs = await page.evaluate(() => {
                const tabs = [];
                $('.derivation-type a:visible').each(function() {
                    const tabId = $(this).attr('href');
                    const tabName = $(this).text();
                    if (tabId && !$(this).parent().hasClass('hidden')) {
                        tabs.push({ id: tabId, name: tabName });
                    }
                });
                return tabs;
            });
            
            // Test each available derivation path
            for (const tab of availableTabs) {
                // Skip non-standard tabs
                if (tab.name === 'LDS' || tab.name === 'BIP141') continue;
                
                console.log(`\nTesting ${tab.name}:`);
                
                // Click on the tab
                await page.evaluate((tabId) => {
                    $(tabId + '-tab a').click();
                }, tab.id.replace('#', ''));
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
                
                console.log(`  Path:    ${mnemonicResult.path}`);
                console.log(`  Address: ${mnemonicResult.address}`);
                console.log(`  PrivKey: ${mnemonicResult.privkey}`);
                
                // Switch to Private Key tab
                await page.evaluate(() => {
                    $('#start-with-tabs a[href="#start-private-key"]').tab('show');
                });
                await new Promise(r => setTimeout(r, 500));
                
                // Select same network
                await page.evaluate((val) => {
                    $('#network-private-key').val(val).trigger('change');
                }, network.value);
                await new Promise(r => setTimeout(r, 1000));
                
                // Enter private key
                await page.evaluate((privkey) => {
                    document.querySelector('#private-key-input').value = privkey;
                    $('#private-key-input').trigger('input');
                }, mnemonicResult.privkey);
                
                // Determine address type based on BIP
                let addressType = 'p2pkh'; // default
                if (tab.name === 'BIP86') addressType = 'p2tr';
                else if (tab.name === 'BIP84') addressType = 'p2wpkh';
                else if (tab.name === 'BIP49') addressType = 'p2sh-p2wpkh';
                
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
                    return {
                        address: addressEl ? addressEl.value.trim() : 'not found',
                        pubkey: pubkeyEl ? pubkeyEl.value.trim() : 'not found'
                    };
                });
                
                console.log(`  Private Key Tab Address: ${privateKeyResult.address}`);
                
                const match = mnemonicResult.address === privateKeyResult.address;
                console.log(`  Match: ${match ? '✅ YES' : '❌ NO'}`);
                
                networkResult.addresses[tab.name] = {
                    mnemonic: mnemonicResult.address,
                    privateKey: privateKeyResult.address,
                    match: match
                };
            }
            
            results.push(networkResult);
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60) + '\n');
        
        let totalTests = 0;
        let totalMatches = 0;
        
        results.forEach(result => {
            console.log(`${result.name}:`);
            Object.keys(result.addresses).forEach(bip => {
                const addr = result.addresses[bip];
                totalTests++;
                if (addr.match) totalMatches++;
                console.log(`  ${bip}: ${addr.match ? '✅' : '❌'}`);
            });
        });
        
        console.log(`\nTotal: ${totalMatches}/${totalTests} tests passed`);
        
        if (totalMatches === totalTests) {
            console.log('\n✅ Perfect consistency across all supported coins!');
        } else {
            console.log('\n⚠️  Some inconsistencies detected');
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
    testAllCoinsConsistency().then(() => {
        server.kill();
        process.exit(0);
    }).catch(error => {
        console.error(error);
        server.kill();
        process.exit(1);
    });
}, 2000);