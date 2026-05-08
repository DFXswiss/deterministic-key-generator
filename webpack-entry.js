// Webpack entry point to export Ark SDK modules for browser use
const { DefaultVtxo, ArkAddress, RestArkProvider } = require('@arkade-os/sdk');

// Export modules directly - webpack will handle the library creation
module.exports = {
    DefaultVtxo,
    ArkAddress,
    RestArkProvider
};