# 📊 Unified Data Schemas

This document defines the core data models used across the RegenPept platform (Frontend and Backend).

## 🧬 Peptides (Products)
Collection: `products` (primary) / `catalogProducts` (extended)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Firestore Document ID |
| `name` | string | Internal name (e.g., "BPC-157") |
| `displayName` | string | Customer-facing name |
| `slug` | string | URL-friendly identifier |
| `isActive` | boolean | Visibility status |
| `price` | number | Base price in USD |
| `goals` | string[] | Primary research goals (see Constants) |
| `mechanisms` | string[] | How the compound works |
| `dosage` | string | Typical research dosage range |
| `scientificName` | string | Optional scientific nomenclature |

## 📋 Protocols
Collection: `protocols`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Protocol unique ID |
| `active` | boolean | If the protocol is currently offered |
| `category` | string | Goal category (e.g., "Recovery") |
| `overview_summary` | string | Short description for cards |
| `peptides` | object[] | List of compounds included |
| `metadata.primary_goal` | string | Canonical goal key |

## 🛒 Orders
Collection: `orders`

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | User ID who placed the order |
| `status` | string | pending / paid / shipped / completed |
| `items` | object[] | Array of product snapshots |
| `customer.email` | string | Contact email |
| `createdAt` | timestamp | Server timestamp |

## 🤖 AI Intelligence
Collection: `ai_config/clinical_rules`

| Field | Type | Description |
|-------|------|-------------|
| `identity` | object | Tone and role definitions |
| `hard_limits` | object[] | Non-negotiable safety rules |
| `safety_rules` | object[] | Guidelines for high-risk queries |
| `_version` | string | Version tracking for cache invalidation |
