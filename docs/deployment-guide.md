# Deploying the ShelbyBlobStore Contract

This guide explains how to deploy the ShelbyBlobStore Move contract to the Aptos network.

## Prerequisites

1. Install the Aptos CLI
2. Set up an Aptos account with funded tokens
3. Configure the CLI with your account

## Steps to Deploy

### 1. Compile the Contract

Navigate to the contract directory and compile:

```bash
cd storescope-ai-Shelby/contracts/aptos
aptos move compile
```

### 2. Run Tests

Before deployment, run the tests to ensure everything works correctly:

```bash
aptos move test
```

### 3. Deploy to Network

Deploy the contract to the desired network:

For testnet:
```bash
aptos move publish --network testnet
```

For mainnet:
```bash
aptos move publish --network mainnet
```

### 4. Initialize the Blob Store

After deployment, you need to initialize the blob store by calling the `initialize_blob_store` function with your account.

## Contract Addresses

Once deployed, note the contract address as you'll need it for frontend integration.

## Updating the Frontend

To integrate the deployed contract with the frontend:

1. Update the contract address in the frontend code
2. Modify the upload process to call the `upload_blob` function
3. Handle events emitted by the contract

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your account has enough APT tokens for gas fees
2. **Compilation errors**: Check that all dependencies are correctly specified in Move.toml
3. **Deployment failures**: Verify network connectivity and account configuration

### Useful Commands

- Check account balance: `aptos account balance`
- View account resources: `aptos account list --query resources`
- Check transaction status: `aptos node show-transaction --hash <tx_hash>`