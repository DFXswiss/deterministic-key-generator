# Comprehensive Testing Guide

## Quick Start

1. **Start the server:**
   ```bash
   node start-server.js
   ```

2. **Choose your testing method:**
   - [Browser Console Test](#browser-console-test) - Quick interactive test
   - [Standalone Test Page](#standalone-test-page) - Visual test interface
   - [Automated Browser Test](#automated-browser-test) - Full automation
   - [Node.js SDK Test](#nodejs-sdk-test) - Direct SDK validation

---

## Testing Methods

### 1. Browser Console Test
**Best for:** Quick debugging and interactive testing

```bash
# 1. Start server
node start-server.js

# 2. Open browser to: http://127.0.0.1:8081/index.html
# 3. Press F12 to open console
# 4. Copy/paste the contents of browser-console-test.js
# 5. Run: runBrowserTest()
```

**What it does:**
- Tests nsec and WIF format support
- Automatically switches tabs and enters keys
- Shows real-time results in console
- Displays pass/fail status for each test

### 2. Standalone Test Page
**Best for:** Visual testing and manual verification

```bash
# 1. Start server
node start-server.js

# 2. Open browser to: http://127.0.0.1:8081/test.html
# 3. Click "Run All Tests" button
```

**Features:**
- Visual test interface with color-coded results
- Manual test input for custom private keys
- Shows expected vs generated addresses
- Displays server info and connection status

### 3. Automated Browser Test
**Best for:** Full end-to-end testing

```bash
# 1. Start server
node start-server.js

# 2. In another terminal:
node test-automated.js
```

**Features:**
- Full Puppeteer automation
- Tests actual user workflow
- Comprehensive verification
- Detailed console output
- Shows browser window for debugging

### 4. Node.js SDK Test
**Best for:** SDK validation without browser

```bash
node test-simple-verification.js
```

**Features:**
- Direct SDK testing
- No browser dependencies
- Fastest execution
- Validates core functionality

---

## Test Cases

All tests validate these key scenarios:

### Test Case 1: nsec Format
- **Input:** `nsec1kk0aks7njd72wy2adjrc4qqx4dd5alzjpuvmku8urnx8ljqrwusqzus34y`
- **Expected Address:** `tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nmr7aax9rt24j6nygp6rsmdgqnqk3ld5qpnymcyfp0n46w63vt6twj24hvy`
- **Expected VTXO Key:** `8fdde98a35aab2d4c880e870db500982d1fb6800cc9bc11217ceba76a2c5e96e`

### Test Case 2: WIF Format
- **Input:** `KxJFqytJx5vuzMMxv9mjPGW88n8t4P6ywfJJ78UfR9AsV5XaD4fH`
- **Expected Address:** `tark1qra883hysahlkt0ujcwhv0x2n278849c3m7t3a08l7fdc40f4f2nm8e5wfwmqqrm6yt30d2quacr9t3svg4qk6q7a5jewvp0n46w63vt6twj24hvy`
- **Expected VTXO Key:** `9f34725db0007bd11717b540e77032ae30622a0b681eed2597303e24b2178948`

---

## Expected Results

When tests pass, you should see:

1. **Server Connection:** Successfully fetches from `https://mutinynet.arkade.sh`
2. **Server Pubkey:** `03fa73c6e4876ffb2dfc961d763cca9abc73d4b88efcb8f5e7ff92dc55e9aa553d`
3. **Exit Delay:** `172544 seconds` (not blocks)
4. **Correct Address Generation:** Both test cases produce expected `tark1` addresses
5. **VTXO Key Match:** Generated taproot keys match expected values

---

## Troubleshooting

### Server Issues
```bash
# Port already in use
lsof -ti:8081 | xargs kill -9

# Restart server
node start-server.js
```

### Browser Issues
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
# Firefox: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

### Network Issues
- Check internet connection for server API calls
- Verify `https://mutinynet.arkade.sh` is accessible
- Check browser console for CORS errors

### SDK Issues
```bash
# Rebuild SDK bundle
npm run build
```

---

## Success Criteria

✅ **All tests should pass with:**
- Correct `tark1` prefix for testnet addresses
- Matching VTXO taproot keys
- Server info properly fetched (172544 seconds delay)
- Both nsec and WIF formats working
- No console errors

❌ **Common failure signs:**
- Wrong address prefix (`ark1` instead of `tark1`)
- Different VTXO keys than expected
- Server info not loading
- Console errors about missing SDK
- Timeout errors during generation

---

## Performance Benchmarks

- **Node.js SDK Test:** < 2 seconds
- **Browser Console Test:** < 10 seconds
- **Standalone Test Page:** < 15 seconds
- **Automated Browser Test:** < 30 seconds

If tests take significantly longer, check:
1. Network connection to Ark server
2. Browser performance/memory
3. System resources