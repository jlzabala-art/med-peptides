# Staging vs Production Environment Setup

ReGen PEPT utilizes separate environments to ensure safe testing of features without affecting live production data.

## 1. Firebase Projects

It is strongly recommended to maintain two distinct Firebase projects:
- **Staging**: `regenpept-staging` (or similar). Used for testing new features, QA, and reviewing `firestore.rules` and Cloud Functions.
- **Production**: `regenpept-prod`. The live application used by real customers, doctors, and staff.

## 2. Setting Up Environments Locally

To switch between environments locally, you should define `.env` files and use Firebase CLI aliases.

### 2.1. Environment Variables

Create two separate environment files in the root of your frontend project:

**`.env.staging`**:
```env
VITE_FIREBASE_API_KEY=your_staging_api_key
VITE_FIREBASE_AUTH_DOMAIN=regenpept-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=regenpept-staging
VITE_FIREBASE_STORAGE_BUCKET=regenpept-staging.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_staging_sender_id
VITE_FIREBASE_APP_ID=your_staging_app_id
```

**`.env.production`**:
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=regenpept-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=regenpept-prod
VITE_FIREBASE_STORAGE_BUCKET=regenpept-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
```

### 2.2. Firebase CLI Aliases

Use the Firebase CLI to add project aliases:
```bash
firebase use --add
# Select your staging project and alias it as 'staging'
firebase use --add
# Select your production project and alias it as 'production'
```

To deploy to staging:
```bash
firebase use staging
npm run build --mode staging
firebase deploy
```

To deploy to production:
```bash
firebase use production
npm run build --mode production
firebase deploy
```

## 3. Stripe Environments

Ensure you are using the correct Stripe keys in your Cloud Functions and frontend:

- **Staging**: Use Stripe `pk_test_...` and `sk_test_...` keys.
- **Production**: Use Stripe `pk_live_...` and `sk_live_...` keys.

Set up Firebase Function secrets for each environment:
```bash
firebase use staging
firebase functions:secrets:set STRIPE_SECRET_KEY

firebase use production
firebase functions:secrets:set STRIPE_SECRET_KEY
```

## 4. Multi-Factor Authentication (MFA)

- **Staging**: You can test SMS verification using test phone numbers provided by Firebase Auth.
- **Production**: Ensure Google Cloud Identity Platform is enabled with SMS regions properly configured and billing activated.

## 5. Security & Logs

- **Staging**: `audit_logs` can be purged or dropped for clean testing.
- **Production**: The `archiveOldLogs` cron job automatically runs every 1st of the month, backing up old logs to Google Cloud Storage to preserve an immutable compliance trail.
