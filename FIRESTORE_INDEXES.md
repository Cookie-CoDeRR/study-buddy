# Firestore Indexes Setup

The app requires composite indexes in Firestore for the following collections to work properly.

## Required Indexes

### 1. group_messages Collection
**Index Name:** `group_messages_groupId_createdAt`

- **Collection:** `group_messages`
- **Fields:**
  - `groupId` (Ascending)
  - `createdAt` (Ascending)

### 2. group_files Collection
**Index Name:** `group_files_groupId_uploadedAt`

- **Collection:** `group_files`
- **Fields:**
  - `groupId` (Ascending)
  - `uploadedAt` (Descending)

## How to Create Indexes

### Option 1: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Add the composite indexes as specified above

### Option 2: Using Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes from firebase.json or create them manually
firebase deploy --only firestore:indexes
```

### Option 3: Create Through Error Links
When you see Firestore errors about missing indexes, they include direct links to create the indexes:
1. Click the provided links in the console error messages
2. Review the index configuration
3. Click "Create Index"

## Verification

Once indexes are created:
- Messages will send successfully in group chat
- Files will upload properly
- Real-time listeners will work without errors
- No more "missing index" errors

## Note

Firestore indexes are automatically created for single-field queries, but composite queries (like querying by `groupId` AND ordering by `createdAt`) require manual index creation through the Firebase Console.
