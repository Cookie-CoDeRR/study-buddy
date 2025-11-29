# StudyTracker

A comprehensive study session tracking application with social features, real-time collaboration, and competitive gamification. Built with React, Firebase, and Tailwind CSS.

## ✨ Features

### Core Features
- **User Authentication**: Secure email/password authentication with unique username system
- **Profile Management**: Upload profile pictures, auto-generated student codes, username preferences
- **Study Session Tracking**: Record study sessions with automatic streak tracking
- **Subject Management**: Create and organize subjects with custom colors
- **Study Streak Tracking**: Track consecutive days of studying with current and all-time streaks
- **Pomodoro Timer Presets**: 15min, 25min, and 50min study sessions with break timers
- **Dark/Light Theme Toggle**: System theme detection with persistent preference storage

### Analytics & Reports
- **Study Goals**: Set daily and weekly goals per subject and overall
- **Analytics Dashboard**: 3-tab analytics page with:
  - Goal tracking and progress visualization
  - Subject-specific analytics with charts
  - Weekly study reports with trends
- **Calendar Heatmap**: Visual representation of study history by day
- **Performance Insights**: Track trends and identify study patterns

### Social & Collaboration
- **Study Groups**: Create or join study groups with invite codes
- **Group Chat**: Real-time group messaging with Discord-like interface
  - WhatsApp-style split-view with members sidebar
  - File sharing in groups
  - Real-time message updates
  - Delete your own messages
- **Friends System**: Add friends and manage relationships
- **Competitive Leaderboards**: 
  - Group-based rankings by study hours
  - Glowing animations for top performers (8h+ = fire emoji 🔥)
  - Member status indicators
- **Member Directory**: View all group members with streaks and today's study time

### Landing Page & Website
- Modern landing page with feature showcase
- Call-to-action buttons
- Testimonials section
- Statistics display
- Smart routing (unauthenticated → website, authenticated → app)

## Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **File Storage**: Firebase Storage
- **Real-time**: Firestore onSnapshot listeners
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS with dark mode
- **Routing**: React Router v6
- **Visualization**: Recharts for analytics
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Project Structure

```
src/
├── pages/
│   ├── Auth.tsx              # Login/Sign-up with username validation
│   ├── Index.tsx             # Main dashboard
│   ├── Profile.tsx           # User profile management
│   ├── Analytics.tsx         # 3-tab analytics dashboard
│   ├── Groups.tsx            # Groups list and management
│   ├── GroupChat.tsx         # Group chat page
│   ├── Website.tsx           # Landing page
│   └── NotFound.tsx
├── components/
│   ├── StudyTimer.tsx
│   ├── StudyHistory.tsx
│   ├── SubjectManager.tsx
│   ├── StreakDisplay.tsx
│   ├── Leaderboard.tsx
│   ├── CalendarHeatmap.tsx
│   ├── GoalManager.tsx
│   ├── GoalProgressDisplay.tsx
│   ├── SubjectAnalytics.tsx
│   ├── WeeklyReports.tsx
│   ├── StudyGroup.tsx
│   ├── GroupChatInterface.tsx
│   ├── ChatRoom.tsx
│   ├── FileSharing.tsx
│   ├── FriendsManager.tsx
│   ├── ThemeToggle.tsx
│   ├── ProfilePictureUploader.tsx
│   └── ui/                   # shadcn/ui components
├── contexts/
│   └── ThemeContext.tsx
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── firebase.js
│   ├── utils.ts
│   ├── analytics.ts
│   ├── goals.ts
│   ├── friends.ts
│   ├── group-chat.ts
│   ├── streak.ts
│   ├── storage.ts
│   ├── image-compression.ts
│   └── avatar.ts
└── App.tsx
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Firebase project with:
  - Firestore Database (Production mode)
  - Authentication (Email/Password)
  - Storage (Profile pictures)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Email/Password authentication
   - Enable Storage with appropriate rules

4. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Create Firestore Indexes**
   See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for required composite indexes:
   - `group_messages`: `groupId` (Asc) + `createdAt` (Asc)
   - `group_files`: `groupId` (Asc) + `uploadedAt` (Desc)

6. **Set Firestore Security Rules**
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /profiles/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       
       match /subjects/{document=**} {
         allow read, write: if request.auth != null && 
           request.resource.data.user_id == request.auth.uid;
       }
       
       match /study_sessions/{document=**} {
         allow read, write: if request.auth != null && 
           request.resource.data.user_id == request.auth.uid;
       }
       
       match /goals/{document=**} {
         allow read, write: if request.auth != null && 
           request.resource.data.user_id == request.auth.uid;
       }
       
       match /friends/{document=**} {
         allow read, write: if request.auth != null;
       }
       
       match /study_groups/{groupId} {
         allow read: if request.auth != null && 
           request.auth.uid in resource.data.members;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
           request.auth.uid == resource.data.creatorId;
       }
       
       match /group_messages/{document=**} {
         allow read, write: if request.auth != null;
       }
       
       match /group_files/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

7. **Set Storage Security Rules**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /profile-pictures/{userId}/{allPaths=**} {
         allow read: if request.auth.uid == userId;
         allow write: if request.auth.uid == userId && request.resource.size < 10485760;
       }
       match /group-files/{groupId}/{userId}/{allPaths=**} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```
   The app opens at `http://localhost:5173/`

## Available Scripts

- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Firestore Collections

- **profiles** - User data with streaks, preferences, student codes, usernames
- **subjects** - Subject definitions with colors
- **study_sessions** - Study session records
- **goals** - Daily and weekly study goals
- **friends** - Friend requests and relationships
- **study_groups** - Group information and membership
- **group_messages** - Real-time group chat messages
- **group_files** - Shared files in groups

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Roadmap

### ✅ Completed
- Study streak tracking
- Pomodoro timer with presets
- Dark/Light theme
- Profile picture upload
- Study goals and targets
- Analytics dashboard
- Study groups and friends
- Real-time group chat
- Competitive leaderboards
- Calendar heatmap
- Landing page website
- Username system with validation

### 🚀 Upcoming
- WebRTC for voice/video calls
- Push notifications
- Achievements and badges
- Study habit insights
- Collaborative study sessions
- Mobile app

## Troubleshooting

**"The query requires an index" error**
- See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md)
- Click the error link to create the index

**Messages not appearing in chat**
- Verify Firestore indexes are created
- Check browser console for errors
- Ensure group membership is correct

**Profile picture not uploading**
- Check file size (max 10MB)
- Verify Storage rules are set correctly
- Check Firebase Storage quota

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check GitHub Issues
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Check [TypeScript Documentation](https://www.typescriptlang.org/docs)
