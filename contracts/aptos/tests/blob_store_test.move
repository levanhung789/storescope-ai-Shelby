#[test]
module shelby_blob_store::blob_store_test {
    use std::string::String;
    use std::signer;
    use aptos_framework::account;
    use shelby_blob_store::blob_store;
    
    #[test]
    public entry fun test_blob_store_workflow() {
        // Create test account
        let addr = @0x1;
        account::create_account_for_test(addr);
        let account = account::create_signer_for_test(addr);
        
        // Initialize blob store
        blob_store::initialize_blob_store(&account);
        
        // Create test data
        let blob_id = string::utf8(b"test-blob-1");
        let asset_id = string::utf8(b"asset-123");
        let data = b"test image data";
        let mime_type = string::utf8(b"image/png");
        
        // Upload blob
        blob_store::test_upload_blob(&account, blob_id, asset_id, *data, mime_type);
        
        // Verify blob exists
        assert!(blob_store::blob_exists(string::utf8(b"test-blob-1")), 1);
        
        // Verify total blobs count
        assert!(blob_store::get_total_blobs() == 1, 2);
    }
}