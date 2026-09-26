# Manual Firebase Setup Guide for KRED

Follow these simple steps to manually connect your own Firebase project for Authentication and Firestore:

---

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select an existing Google Cloud project).
3. Name your project (e.g. `kred-african-vault`) and complete the creation steps.

---

### Step 2: Register a Web Application
1. In your Firebase project overview, click the **Web icon (`</>`)** to register an app.
2. Enter an app nickname (e.g., `KRED Web App`).
3. Click **Register app**.
4. Firebase will display your `firebaseConfig` object, which looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```

---

### Step 3: Enable Firebase Authentication
1. In the Firebase console left menu, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Click **Email/Password** -> Toggle **Enable** -> Click **Save**.
   - (Optional) Enable **Google** provider if you want 1-click Google Sign-In.

---

### Step 4: Create Cloud Firestore Database
1. In the Firebase console left menu, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `europe-west2` or `us-central1`).
4. Select **Start in test mode** for prototyping, or start in production mode.
5. In the **Rules** tab, apply these secure rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read and write their own documents
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       // Credentials subcollection per user
       match /users/{userId}/credentials/{credId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       // Chat history per user
       match /users/{userId}/threads/{threadId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
6. Click **Publish**.

---

### Step 5: Add Your Credentials to the App
Create or update `.env` (or copy `.env.example`) in your root directory:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
```

Your app will immediately read these variables and connect to your live Firebase backend!
