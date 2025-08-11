# Deterministic Key Generator Tests

This directory contains automated tests for the Deterministic Key Generator application.

## Test Structure

### Simple Tests (`test-simple.js`)
Basic tests that run without external dependencies:
- File structure validation
- HTML structure checks
- JavaScript syntax validation
- Basic page load test

### Browser Tests (`test-runner.js`)
Comprehensive browser-based tests using Puppeteer:
- Private Key tab navigation
- WIF private key conversion
- Hex private key conversion
- Bitcoin Testnet address generation
- Ark Testnet address generation
- GENERATE button functionality
- Address type dropdown functionality
- Taproot address generation
- **Mnemonic seed phrase testing with exact address verification**
  - Tests specific mnemonic: "oxygen lobster melody price ribbon home clip doll trigger glove silly market"
  - Verifies BIP44 derivation path (m/44'/0'/0'/0)
  - Validates all 20 derived addresses match expected values
  - Checks address, public key, and private key for each derivation

## Running Tests Locally

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Simple Tests Only
```bash
node test/test-simple.js
```

### Run with Local Server
```bash
npm run test:local
```

## GitHub Actions

Tests run automatically on:
- Push to `master` or `develop` branches
- Pull requests to `master` or `develop` branches

Two test jobs run in parallel:
1. **simple-test**: Basic validation tests
2. **browser-test**: Full browser automation tests

## Test Coverage

### Private Key Tab
- ✓ WIF format conversion
- ✓ Hexadecimal format conversion  
- ✓ Address generation for different networks
- ✓ Random key generation

### Ark Protocol
- ✓ Bech32m address encoding
- ✓ Server parameter integration
- ✓ X-only pubkey conversion

### Bitcoin Features
- ✓ Legacy addresses (P2PKH)
- ✓ SegWit addresses (P2WPKH)
- ✓ Native SegWit addresses (Bech32)
- ✓ Taproot addresses (P2TR)
- ✓ Testnet support

## Test Reports

Test results are saved to `test-results/` directory:
- `simple-test-report.json`: Results from simple tests
- `test-report.json`: Results from browser tests

## Adding New Tests

### Simple Test
Add to `test-simple.js`:
```javascript
async function testNewFeature() {
    console.log('Testing: New feature...');
    // Test implementation
    testResults.passed++;
}
```

### Browser Test
Add to `test-runner.js`:
```javascript
await runTest('New feature test', async () => {
    // Navigate and interact with page
    await page.goto(`${BASE_URL}/src/index.html`);
    // Assertions
});
```