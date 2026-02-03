# VibeSwipe 🌊✨

A mental wellness and social journaling app built with React Native and Expo. VibeSwipe helps users track their moods, journal their thoughts with audio support, connect with others, and share vibes in a supportive community.

## 🌟 Features

### 📝 Journaling

- **Daily Mood Tracking**: Log your emotional state with intuitive mood selectors
- **Audio Journals**: Record voice notes alongside written entries
- **Calendar View**: Visual calendar with mood indicators
- **Streak Tracking**: Build journaling habits with streak counters
- **Pin & Organize**: Pin important entries for quick access

### 💬 Social Features

- **Vibe Wall**: Share thoughts and feelings with the community
- **Anonymous Posting**: Option to post anonymously or with your alias
- **Emotional Reactions**: React to posts with love, support, curiosity, etc.
- **Comments**: Engage with others through meaningful conversations
- **Real-time Updates**: Live feed updates using Firestore

### 🤝 Connect

- **Smart Matching**: Connect with users based on mood compatibility
- **1:1 Chat**: Private messaging with other users
- **Mood-based Discovery**: Find people experiencing similar emotions

### 🔔 Notifications

- **Journal Reminders**: Daily prompts to maintain journaling habits
- **Streak Warnings**: Alerts to keep your streak alive
- **Message Notifications**: Get notified of new messages
- **Customizable Preferences**: Full control over notification settings

### 🎨 Design

- **Liquid Glass UI**: Modern glassmorphic design system
- **Dark/Light Modes**: System-aware theme switching
- **Smooth Animations**: Spring physics and gesture-based interactions
- **Platform-Adaptive**: Native feel on both iOS and Android

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio (for Android development)
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/vibeswipe.git
   cd vibeswipe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Firebase credentials:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

4. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Set up Storage
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to project root
   - Deploy Firestore rules and storage rules:
     ```bash
     firebase deploy --only firestore:rules
     firebase deploy --only storage
     ```

5. **Start the development server**

   ```bash
   npx expo start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 🏗️ Project Structure

```
vibeswipe/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Feed/Wall
│   │   ├── journal.tsx      # Journal calendar
│   │   ├── connect.tsx      # User connections
│   │   └── chat.tsx         # Messages
│   ├── chat/[id].tsx        # Individual chat
│   ├── feed/[id].tsx        # Post details
│   ├── journal/
│   │   ├── new.tsx          # Create journal entry
│   │   └── [id].tsx         # View journal entry
│   ├── post/new.tsx         # Create new post
│   ├── profile/
│   │   ├── index.tsx        # User profile & settings
│   │   └── legal.tsx        # Legal documents
│   ├── login.tsx            # Authentication
│   ├── register.tsx         # User registration
│   └── _layout.tsx          # Root layout with providers
├── components/              # Reusable components
│   ├── PostCard.tsx         # Post display component
│   ├── GlassView.tsx        # Glassmorphic container
│   └── ui/                  # UI primitives
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   ├── ThemeContext.tsx     # Theme management
│   └── NotificationContext.tsx  # Notification state
├── types/                   # TypeScript types
│   ├── feed.ts              # Post & comment types
│   ├── journal.ts           # Journal entry types
│   ├── user.ts              # User profile types
│   └── chat.ts              # Chat types
├── utils/                   # Utility functions
│   ├── notifications.ts     # Notification service
│   ├── journalStreak.ts     # Streak calculation
│   ├── moodStats.ts         # Mood analytics
│   └── seedData.ts          # Sample data
├── configs/                 # Configuration
│   └── firebaseConfig.ts    # Firebase setup
├── constants/               # App constants
│   ├── AppEnums.ts          # Enumerations
│   ├── theme.ts             # Theme definitions
│   └── LegalText.ts         # Legal content
└── assets/                  # Images and static files
```

## 🛠️ Tech Stack

### Core

- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based navigation

### Backend & Database

- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database with real-time sync
- **Firebase Storage** - Media and audio file storage

### UI & Styling

- **React Native Paper** - Material Design 3 components
- **Expo Blur** - Native blur effects
- **Liquid Glass Design System** - Custom glassmorphic UI
- **Animated API** - Smooth animations

### Features

- **expo-audio** - Audio recording and playback
- **expo-notifications** - Push notifications
- **expo-image-picker** - Media selection
- **date-fns** - Date formatting
- **react-native-calendars** - Calendar component

## 📱 Key Screens

- **Feed** - Main wall with community posts
- **Journal** - Daily mood tracking with calendar
- **Connect** - Discover and match with users
- **Chat** - Private messaging
- **Profile** - Settings and preferences
- **New Vibe** - Create and share posts
- **New Journal** - Log moods with text/audio

## 🔐 Security

- Firebase credentials stored in environment variables
- `.env` file excluded from version control
- Firestore security rules for data protection
- Storage rules for media access control
- Anonymous posting option for privacy

## 🎯 Firestore Collections

- `users` - User profiles and preferences
- `posts` - Community posts and vibes
- `posts/{id}/comments` - Post comments (subcollection)
- `journals` - Personal journal entries
- `chats` - Chat conversations
- `chats/{id}/messages` - Chat messages (subcollection)

## 📝 Environment Variables

All Firebase configuration is managed through environment variables prefixed with `EXPO_PUBLIC_` to make them accessible in the Expo app. See `.env.example` for the complete list.

## 🧪 Development

### Seed Database

Run the seed function from the profile screen to populate sample data for testing.

### Firebase Emulators

To use Firebase emulators for local development:

```bash
firebase emulators:start
```

### Debug Mode

Enable debug mode in Expo for detailed logs:

```bash
npx expo start --dev-client
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email devesh@startupmanch.world or open an issue in the repository.

---

Built with ❤️ by StartupManch
