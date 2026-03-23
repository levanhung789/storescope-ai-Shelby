# Product Recognition Architecture for StoreScope

## Goal

Design a practical product-recognition pipeline for StoreScope that combines:
- image upload + Shelby storage
- OCR extraction
- vision-based analysis
- catalog matching
- confidence scoring
- user confirmation when confidence is not high enough

This document is implementation-oriented so it can be used directly for app/API design.

---

## 1. Recommended End-to-End Flow

1. User uploads image from `/image-analysis`
2. Backend stores original file and uploads it to Shelby
3. Backend runs OCR on the image
4. Backend runs vision analysis on the image
5. Backend normalizes OCR/vision outputs into structured fields
6. Backend runs catalog matching against product database
7. Backend computes confidence and final decision
8. Backend returns:
   - structured analysis
   - best match / top candidates
   - Shelby blob metadata
   - confidence + review recommendation
9. User can confirm or correct the result
10. Correction is stored for later tuning / training

---

## 2. API Design

### POST `/api/analyze-product`

Main endpoint for full product recognition.

#### Request

```json
{
  "imageSource": {
    "kind": "upload",
    "filename": "bot-ngot-ajinomoto.png"
  },
  "options": {
    "runOcr": true,
    "runVision": true,
    "runCatalogMatch": true,
    "returnTopK": 3
  },
  "context": {
    "languageHint": "vi",
    "market": "VN"
  }
}
```

#### Response

```json
{
  "success": true,
  "analysisId": "analysis_20260324_0001",
  "image": {
    "originalFilename": "bot-ngot-ajinomoto.png",
    "mimeType": "image/png",
    "sizeBytes": 123456,
    "width": 1024,
    "height": 1024,
    "shelby": {
      "url": "https://api.shelbynet.shelby.xyz/shelby/v1/blobs/<account>/<blob>.webp",
      "explorerUrl": "https://explorer.shelby.xyz/shelbynet/account/<account>/blobs?name=<blob>.webp",
      "accountAddress": "0x...",
      "blobName": "bot-ngot-ajinomoto.webp"
    }
  },
  "ocr": {
    "rawText": "AJINOMOTO BOT NGOT 100G ...",
    "language": ["vi"],
    "tokens": ["ajinomoto", "bot", "ngot", "100g"],
    "brandCandidates": ["Ajinomoto"],
    "sizeCandidates": [
      {
        "value": 100,
        "unit": "g",
        "raw": "100g"
      }
    ]
  },
  "vision": {
    "category": "seasoning",
    "brand": "Ajinomoto",
    "productNameGuess": "Bot ngot Ajinomoto goi 100g",
    "packagingType": "pouch",
    "dominantColors": ["red", "white"],
    "confidence": 0.82
  },
  "normalized": {
    "brand": "Ajinomoto",
    "productName": "Bot ngot",
    "variant": null,
    "size": {
      "value": 100,
      "unit": "g"
    },
    "category": "seasoning",
    "packagingType": "pouch"
  },
  "catalogMatch": {
    "bestMatch": {
      "skuId": "SKU_AJI_BNG_100G",
      "name": "Bot ngot Ajinomoto goi 100g",
      "brand": "Ajinomoto",
      "score": 0.93
    },
    "topMatches": [
      {
        "skuId": "SKU_AJI_BNG_100G",
        "name": "Bot ngot Ajinomoto goi 100g",
        "score": 0.93,
        "reasons": ["brand_match", "size_match", "text_similarity_high"]
      },
      {
        "skuId": "SKU_AJI_BNG_454G",
        "name": "Bot ngot Ajinomoto goi 454g",
        "score": 0.61,
        "reasons": ["brand_match", "text_similarity_partial"]
      }
    ]
  },
  "decision": {
    "status": "matched",
    "confidenceLevel": "high",
    "confidenceScore": 0.93,
    "needsHumanReview": false
  }
}
```

---

### POST `/api/catalog-match`

Runs only normalization + catalog matching if OCR/vision outputs already exist.

### POST `/api/analysis-feedback`

Stores user confirmation/correction.

#### Request

```json
{
  "analysisId": "analysis_20260324_0001",
  "selectedSkuId": "SKU_AJI_BNG_100G",
  "action": "confirm"
}
```

or

```json
{
  "analysisId": "analysis_20260324_0001",
  "selectedSkuId": "SKU_AJI_BNG_454G",
  "action": "correct"
}
```

---

## 3. JSON Schema Proposal

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storescope.local/schemas/product-recognition-result.json",
  "title": "ProductRecognitionResult",
  "type": "object",
  "required": ["analysisId", "image", "decision"],
  "properties": {
    "analysisId": { "type": "string" },
    "image": {
      "type": "object",
      "required": ["originalFilename", "mimeType"],
      "properties": {
        "originalFilename": { "type": "string" },
        "mimeType": { "type": "string" },
        "sizeBytes": { "type": "integer" },
        "width": { "type": "integer" },
        "height": { "type": "integer" },
        "shelby": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "explorerUrl": { "type": "string" },
            "accountAddress": { "type": "string" },
            "blobName": { "type": "string" }
          }
        }
      }
    },
    "ocr": {
      "type": "object",
      "properties": {
        "rawText": { "type": "string" },
        "language": {
          "type": "array",
          "items": { "type": "string" }
        },
        "tokens": {
          "type": "array",
          "items": { "type": "string" }
        },
        "brandCandidates": {
          "type": "array",
          "items": { "type": "string" }
        },
        "sizeCandidates": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "value": { "type": "number" },
              "unit": { "type": "string" },
              "raw": { "type": "string" }
            }
          }
        }
      }
    },
    "vision": {
      "type": "object",
      "properties": {
        "category": { "type": "string" },
        "brand": { "type": ["string", "null"] },
        "productNameGuess": { "type": ["string", "null"] },
        "packagingType": { "type": ["string", "null"] },
        "dominantColors": {
          "type": "array",
          "items": { "type": "string" }
        },
        "confidence": { "type": "number" }
      }
    },
    "normalized": {
      "type": "object",
      "properties": {
        "brand": { "type": ["string", "null"] },
        "productName": { "type": ["string", "null"] },
        "variant": { "type": ["string", "null"] },
        "size": {
          "type": ["object", "null"],
          "properties": {
            "value": { "type": "number" },
            "unit": { "type": "string" }
          }
        },
        "category": { "type": ["string", "null"] },
        "packagingType": { "type": ["string", "null"] }
      }
    },
    "catalogMatch": {
      "type": "object",
      "properties": {
        "bestMatch": {
          "type": ["object", "null"],
          "properties": {
            "skuId": { "type": "string" },
            "name": { "type": "string" },
            "brand": { "type": "string" },
            "score": { "type": "number" }
          }
        },
        "topMatches": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "skuId": { "type": "string" },
              "name": { "type": "string" },
              "score": { "type": "number" },
              "reasons": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "decision": {
      "type": "object",
      "required": ["status", "confidenceLevel", "confidenceScore", "needsHumanReview"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["matched", "candidate_list", "unresolved"]
        },
        "confidenceLevel": {
          "type": "string",
          "enum": ["high", "medium", "low"]
        },
        "confidenceScore": { "type": "number" },
        "needsHumanReview": { "type": "boolean" }
      }
    }
  }
}
```

---

## 4. Confidence Rules (Recommended)

### High confidence
- brand exact/near-exact match
- size match
- OCR text strongly overlaps catalog name
- visual category agrees

### Medium confidence
- brand likely match
- size or variant partially matched
- visual similarity good but OCR incomplete

### Low confidence
- weak OCR
- no clear brand
- many similar candidates
- image quality poor

---

## 5. Candidate Ranking Formula (Simple Version)

Example weighted score:

- brand score: 0.30
- product name text similarity: 0.30
- size score: 0.20
- category score: 0.10
- visual similarity / packaging cues: 0.10

```text
final_score =
  0.30 * brand_match +
  0.30 * text_similarity +
  0.20 * size_match +
  0.10 * category_match +
  0.10 * visual_similarity
```

---

## 6. UI Recommendation for `/image-analysis`

When confidence is high:
- show final matched product
- show confidence badge
- show Shelby links

When confidence is medium:
- show top 3 candidates
- ask user to confirm one

When confidence is low:
- ask for a clearer image
- still show extracted OCR and possible brands/categories

---

## 7. Implementation Priority

### Phase 1
- keep current upload flow
- return structured OCR + vision result
- return top 3 candidates

### Phase 2
- add user feedback endpoint
- collect corrections
- log confidence vs final selected SKU

### Phase 3
- add object detection for multiple products per image
- add embeddings for image retrieval
- train custom retail model if needed

---

## 8. Practical Recommendation for StoreScope Right Now

Start with:
- one-image product analysis
- OCR + vision output normalization
- catalog matching + top 3 candidates
- user confirmation loop

Do **not** start with heavy custom detection training unless you are processing shelf images or multi-product scenes.
