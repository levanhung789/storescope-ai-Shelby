# PowerShell script to upload images directly to ShelbyNet network with transaction blob_metadata::register_multiple_blobs
#
# Usage:
# .\scripts\upload-images-to-shelbynet.ps1 -ImagePaths @("path\to\image1.jpg", "path\to\image2.png")

param(
    [Parameter(Mandatory=$true)]
    [string[]]$ImagePaths
)

Write-Host "Uploading images to ShelbyNet..." -ForegroundColor Green

# Check if Node.js is installed
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

Write-Host "Node.js version: $nodeVersion" -ForegroundColor Blue

# Check if aptos CLI is installed
$aptosVersion = aptos --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "Aptos CLI is not installed. Please install Aptos CLI first."
    exit 1
}

Write-Host "Aptos CLI version: $aptosVersion" -ForegroundColor Blue

# Check if the upload script exists
$uploadScript = "scripts/upload-images-to-shelbynet.js"
if (-not (Test-Path $uploadScript)) {
    Write-Error "Upload script not found: $uploadScript"
    exit 1
}

# Convert PowerShell array to string arguments
$arguments = $ImagePaths -join " "

# Run the Node.js script
Write-Host "Running upload script with images: $arguments" -ForegroundColor Yellow
node $uploadScript $arguments

if ($LASTEXITCODE -eq 0) {
    Write-Host "Images uploaded successfully!" -ForegroundColor Green
} else {
    Write-Error "Upload failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}