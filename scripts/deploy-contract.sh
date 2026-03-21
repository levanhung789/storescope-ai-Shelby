#!/bin/bash

# Script to compile and deploy the ShelbyBlobStore contract

echo "Compiling ShelbyBlobStore contract..."
cd contracts/aptos
aptos move compile

if [ $? -ne 0 ]; then
    echo "Compilation failed. Exiting."
    exit 1
fi

echo "Running tests..."
aptos move test

if [ $? -ne 0 ]; then
    echo "Tests failed. Exiting."
    exit 1
fi

echo "Deploying contract..."
aptos move publish

if [ $? -ne 0 ]; then
    echo "Deployment failed."
    exit 1
fi

echo "Contract deployed successfully!"