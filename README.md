<div align="center">
<img width="1200" height="475" alt="Pears Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Pears 🍐

A modern, real-time social media platform built with React and Firebase. Pears enables users to share thoughts, interact with content, and build communities through a seamless, responsive interface.

## ✨ Features

- **Real-time Updates**: Powered by Firestore, ensuring instant synchronization of posts, comments, and likes across all connected clients.
- **User Authentication**: Secure sign-up and login flows using Firebase Auth.
- **Interactive Feed**: Create, edit, and delete posts with rich text support.
- **Engagement**: Like, comment, and bookmark posts from other users.
- **Notifications**: Real-time notifications for likes, comments, and new followers.
- **Responsive Design**: Optimized for both desktop and mobile experiences.
- **Type Safety**: Built entirely with TypeScript for robust development.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend & Database**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Styling**: Tailwind CSS for utility-first styling
- **Build Tool**: Vite
- **AI Integration**: Gemini API for intelligent features

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pears.git
   cd pears
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory and add your Firebase and Gemini configuration keys:
   
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```

   > **Note**: You can find Firebase values in your Firebase Console under Project Settings > General > Your Apps. Get your Gemini API key from [AI Studio](https://ai.studio/).

4. **Set up Firestore Rules**
   
   Deploy the security rules located in `firestore.rules` to your Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
pears/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── services/         # API and Firestore service layers
│   │   └── firestore.ts  # Core database operations
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── firebase.ts       # Firebase initialization
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── firestore.rules       # Database security rules
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🔥 Firestore Schema

The application uses the following collection structure:

- **`users`**: User profiles, bio, follower counts, and settings.
- **`posts`**: Content created by users, including text and metadata.
- **`comments`**: Comments associated with specific posts.
- **`likes`**: Records of users liking posts or comments.
- **`following`**: Relationships between users (who follows whom).
- **`notifications`**: Real-time alerts for user interactions.
- **`bookmarks`**: Saved posts for later viewing.

## 🤝 Contribut