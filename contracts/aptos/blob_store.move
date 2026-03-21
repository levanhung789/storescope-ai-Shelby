module shelby_blob_store::blob_store {
    use std::string::String;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::timestamp;

    struct BlobStore has key {
        blobs: Table<String, Blob>,
        total_blobs: u64,
        owner: address,
    }

    struct Blob has store {
        data: vector<u8>,
        mime_type: String,
        uploaded_at: u64,
        uploader: address,
    }

    struct BlobUploaded has drop, store {
        blob_id: String,
        asset_id: String,
        uploader: address,
        timestamp: u64,
    }

    entry fun initialize_blob_store(account: &signer) {
        let addr = account::get_signer_capability_address(account);
        move_to(account, BlobStore {
            blobs: table::new(),
            total_blobs: 0,
            owner: addr,
        });
    }

    entry fun upload_blob(
        account: &signer,
        blob_id: String,
        asset_id: String,
        data: vector<u8>,
        mime_type: String,
    ) {
        let addr = account::get_signer_capability_address(account);
        let store = borrow_global_mut<BlobStore>(@shelby_blob_store);
        
        // Check if blob already exists
        assert!(!table::contains(&store.blobs, &blob_id), 1);
        
        table::add(&mut store.blobs, blob_id, Blob {
            data,
            mime_type,
            uploaded_at: timestamp::now_microseconds(),
            uploader: addr,
        });
        
        store.total_blobs = store.total_blobs + 1;
        
        // Emit event
        event::emit(BlobUploaded {
            blob_id,
            asset_id,
            uploader: addr,
            timestamp: timestamp::now_microseconds(),
        });
    }

    public fun get_blob(blob_id: String): &Blob acquires BlobStore {
        let store = borrow_global<BlobStore>(@shelby_blob_store);
        table::borrow(&store.blobs, &blob_id)
    }

    public fun blob_exists(blob_id: String): bool acquires BlobStore {
        let store = borrow_global<BlobStore>(@shelby_blob_store);
        table::contains(&store.blobs, &blob_id)
    }

    public fun get_total_blobs(): u64 acquires BlobStore {
        let store = borrow_global<BlobStore>(@shelby_blob_store);
        store.total_blobs
    }

    #[test_only]
    public fun test_upload_blob(
        account: &signer,
        blob_id: String,
        asset_id: String,
        data: vector<u8>,
        mime_type: String,
    ) acquires BlobStore {
        upload_blob(account, blob_id, asset_id, data, mime_type);
    }
}