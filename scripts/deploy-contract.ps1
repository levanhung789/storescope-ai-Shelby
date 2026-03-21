# Script to compile and deploy the ShelbyBlobStore contract

Write-Host "Compiling ShelbyBlobStore contract..."
Set-Location -Path "contracts/aptos"
aptos move compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed. Exiting."
    exit 1
}

Write-Host "Running tests..."
aptos move test

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed. Exiting."
    exit 1
}

Write-Host "Deploying contract..."
aptos move publish

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed."
    exit 1
}

Write-Host "Contract deployed successfully!"