# ShelbyBlobStore Contract

This is a Move smart contract for the Aptos blockchain that allows storing image blobs on-chain with metadata.

## Features

- Store image blobs with metadata (MIME type, upload timestamp, uploader address)
- Track total number of blobs stored
- Emit events when blobs are uploaded
- Prevent duplicate blob IDs

## Contract Structure

### `BlobStore` Resource
Main resource that holds all blobs in a Table structure.

### `Blob` Struct
Represents an individual blob with:
- `data`: The actual blob data (vector<u8>)
- `mime_type`: MIME type of the blob
- `uploaded_at`: Timestamp when uploaded (in microseconds)
- `uploader`: Address of the uploader

### Events
- `BlobUploaded`: Emitted when a blob is successfully uploaded

## Functions

### `initialize_blob_store(account: &signer)`
Initialize the blob store for an account.

### `upload_blob(account: &signer, blob_id: String, asset_id: String, data: vector<u8>, mime_type: String)`
Upload a new blob to the store.

### `get_blob(blob_id: String): &Blob`
Retrieve a blob by its ID.

### `blob_exists(blob_id: String): bool`
Check if a blob exists.

### `get_total_blobs(): u64`
Get the total number of blobs stored.

## Deployment

1. Install the Aptos CLI
2. Navigate to the contract directory
3. Run: `aptos move compile`
4. Run: `aptos move publish`

## Usage

1. Initialize the blob store
2. Call `upload_blob` with the blob data and metadata
3. Use `get_blob` to retrieve blob data
4. Listen to `BlobUploaded` events for notifications

## Testing

Run tests with: `aptos move test`