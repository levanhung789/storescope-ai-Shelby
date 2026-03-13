Retail Image Intelligence Platform
AI-powered retail visibility for FMCG and distribution workflows, built on Shelby
Overview

Retail teams generate massive amounts of operational data every day through shelf photos, warehouse photos, execution reports, Excel sheets, and field documents. Most of this information remains fragmented, unstructured, and difficult to convert into timely decisions.

This project builds a Retail Image Intelligence Platform that transforms raw retail images and business documents into structured, decision-ready intelligence for FMCG brands, distributors, and store operations teams.

The platform allows users to upload:

Shelf photos from stores

Warehouse photos

Excel files

Word documents

Supporting operational assets

All raw files and processed assets are stored on Shelby, a high-performance decentralized storage network designed for demanding read-heavy workloads such as AI, media, and large-scale data processing. Shelby is a strong fit for this product because the workflow depends on fast storage, fast retrieval, and scalable handling of image and document assets across repeated AI analysis cycles.

Problem

In traditional retail operations, field images and inventory evidence are often collected manually but rarely converted into reliable business intelligence.

This leads to familiar problems:

Shelf audits are slow and inconsistent

Competitor shelf expansion is discovered too late

Low-stock and overstock situations are not flagged early enough

Warehouse visibility is fragmented

Business files and image evidence live in separate systems

Teams spend too much time reviewing photos instead of acting on insights

Retail execution generates data continuously, but without the right storage and AI pipeline, that data never becomes operational value.

Solution

This platform turns visual retail data into measurable business outcomes.

After users upload retail images and supporting files, AI models analyze the content to identify products and convert detections into structured records that can be used across reporting, replenishment, and sales workflows.

The system is designed to identify:

Brand

SKU

Packaging type

Units per case

Quantity

Client products vs competitor products

It is especially useful for categories such as:

Dairy

Soft drinks

Consumer packaged goods

Other high-velocity FMCG categories

By combining image intelligence with business context, the platform enables teams to move from photo collection to store-level decision support.

Core Capabilities
1. Retail image ingestion

Users upload shelf photos, warehouse photos, and supporting business files.

2. Shelby-powered asset storage

Raw files, processed images, AI outputs, and derived datasets are stored on Shelby for fast retrieval and repeatable downstream analysis. Shelby provides APIs, SDKs, and CLI tooling that make it practical to integrate into production data workflows.

3. AI product recognition

The system detects and classifies visible products in retail and warehouse imagery.

4. Structured business transformation

Image detections are converted into operational data models that support retail reporting and analytics.

5. Recommendation engine

The platform generates actionable recommendations such as:

Low-stock warnings

Overstock warnings

Competitor share-of-shelf growth alerts

Store-level anomalies

Replenishment behavior insights

6. Human-in-the-loop validation

When image quality is poor or model confidence is low, the platform asks the user to confirm or correct the result before it becomes part of the official dataset.

This protects data quality and ensures that downstream analytics remain trustworthy.

Why Shelby

This project is not just storing files. It is building a continuous AI workflow around them.

That means the storage layer must support:

Raw image uploads at scale

Fast retrieval for repeated AI inference

Processed asset management

Persistent storage for structured outputs

Mixed content types, including media and business documents

Developer-friendly integration into applications and pipelines

Shelby is well aligned with this architecture because it is built as a high-performance decentralized blob storage system for read-heavy workloads, with fast retrieval, global distributed availability, and integration paths through CLI, APIs, and SDKs. Shelby’s documentation also positions it directly for workloads such as AI training and inference, video/media, and large-scale analytics.

For this platform, Shelby serves as the foundation for:

Image and document ingestion

Asset persistence

Retrieval for AI analysis pipelines

Versionable business evidence

Scalable storage for retail intelligence workloads

Example Workflow

A field rep uploads shelf photos from a retail store

A warehouse manager uploads stock photos and related Excel files

Raw assets are stored on Shelby

AI models detect products and classify inventory signals

The system separates client SKUs from competitor SKUs

Detections are transformed into structured business records

Daily, weekly, and monthly movement trends are calculated

Alerts and recommendations are generated for operations teams

Low-confidence detections are reviewed by the user before final approval

Business Outputs

Once detections are structured, the platform can support analysis such as:

Stock movement over time

Sales movement trends

Replenishment frequency

Shelf share comparison

Competitor visibility growth

Store compliance anomalies

Outlier detection across locations

The result is a clearer and faster decision loop for brands and distributors operating in complex retail environments.

Design Principles

This project is built around five principles:

Operational clarity: turn images into measurable retail signals

Speed: reduce manual review and reporting delays

Reliability: validate uncertain detections before official use

Scalability: support large volumes of retail media and documents

Actionability: produce recommendations, not just detections

Vision

We believe the future of retail operations is built on a simple transformation:

Images → detections → structured data → business decisions

This project aims to become the infrastructure layer for that transformation in FMCG and distribution environments.

By combining AI analysis with Shelby’s high-performance storage foundation, the platform helps retail teams move from fragmented visual evidence to intelligent, store-level execution.

Tech Direction

Shelby for decentralized hot storage and asset retrieval

AI vision pipelines for product detection and classification

Data transformation layer for structured business outputs

Human review workflows for low-confidence results

Analytics and alerting layer for retail recommendations

Mission

To help FMCG and distribution teams stop collecting photos as passive evidence
and start using them as active retail intelligence.
