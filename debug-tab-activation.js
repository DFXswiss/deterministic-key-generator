const puppeteer = require('puppeteer');

async function debugTabActivation() {
    console.log('🐛 Debugging Tab Activation');
    console.log('='.repeat(40));

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false, // Show browser for debugging
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('🔷 Browser:', msg.text()));
        
        const url = 'http://127.0.0.1:8081/index.html?tab=private&coin=ark';
        console.log(`🔗 Loading: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        
        // Wait a bit for JS to execute
        await page.waitForTimeout(3000);
        
        // Check what's happening step by step
        const debugInfo = await page.evaluate(() => {
            console.log('=== DEBUG INFO ===');
            
            // Check URL params
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            const coin = urlParams.get('coin');
            console.log('URL params - tab:', tab, 'coin:', coin);
            
            // Check if checkUrlParameters function exists
            console.log('checkUrlParameters function exists:', typeof checkUrlParameters !== 'undefined');
            
            // Check jQuery
            console.log('jQuery loaded:', typeof $ !== 'undefined');
            
            // Check Bootstrap tab method
            const tabElement = $('#start-with-tabs a[href="#start-private-key"]');
            console.log('Tab element found:', tabElement.length > 0);
            console.log('Tab method exists:', typeof tabElement.tab === 'function');
            
            // Check current active tab
            const activeTab = $('#start-with-tabs a.active').attr('href');
            console.log('Current active tab:', activeTab);
            
            // Check the network selection
            const networkSelect = document.querySelector('#network-private-key');
            const selectedOption = networkSelect ? networkSelect.options[networkSelect.selectedIndex] : null;
            const selectedText = selectedOption ? selectedOption.text : 'No selection';
            console.log('Selected network:', selectedText);
            
            return {
                urlTab: tab,
                urlCoin: coin,
                activeTab: activeTab,
                selectedNetwork: selectedText,
                tabElementExists: tabElement.length > 0,
                tabMethodExists: typeof tabElement.tab === 'function'
            };
        });
        
        console.log('\n📊 Debug Results:', debugInfo);
        
        // Try to manually activate the tab
        console.log('\n🔧 Trying to manually activate Private Key tab...');
        
        await page.evaluate(() => {
            // Try different approaches to activate the tab
            console.log('Attempting manual tab activation...');
            
            // Method 1: Click the tab directly
            const tabLink = document.querySelector('#start-with-tabs a[href="#start-private-key"]');
            if (tabLink) {
                console.log('Clicking tab link...');
                tabLink.click();
            }
            
            // Method 2: Use Bootstrap's tab method if available
            if (typeof $ !== 'undefined') {
                console.log('Using Bootstrap tab method...');
                $('#start-with-tabs a[href="#start-private-key"]').tab('show');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check final state
        const finalState = await page.evaluate(() => {
            const activeTab = $('#start-with-tabs a.active').attr('href');
            const isPrivateKeyActive = activeTab === '#start-private-key';
            
            // Check if Ark fields are visible
            const arkFields = document.querySelector('.ark-result-fields');
            const arkFieldsVisible = arkFields && !arkFields.classList.contains('hidden');
            
            return {
                activeTab: activeTab,
                isPrivateKeyActive: isPrivateKeyActive,
                arkFieldsVisible: arkFieldsVisible
            };
        });
        
        console.log('\n🏁 Final State:', finalState);
        
        if (finalState.isPrivateKeyActive) {
            console.log('\n✅ SUCCESS: Private Key tab is now active!');
            console.log('The working URL is:');
            console.log(`https://dev.deterministic-key-generator.com/?tab=private&coin=ark`);
        } else {
            console.log('\n❌ FAIL: Tab activation still not working');
        }
        
        console.log('\n⏱️  Keeping browser open for 10 seconds for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugTabActivation().catch(console.error);