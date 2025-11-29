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
  - Global invite code search across all groups
  - Seamless group joining
- **Group Chat**: Real-time group messaging with Discord-like interface
  - WhatsApp-style split-view with members sidebar
  - File sharing in groups
  - Real-time message updates with Enter key send
  - Delete your own messages
  - Shift+Enter for new lines
- **Friends System**: Add friends via student codes
  - Bidirectional friendship - both users see each other as friends
  - Send and receive friend requests
  - Accept/reject incoming requests
- **Online Friends Display**: See which friends are online on the dashboard
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

## Recent Updates & Bug Fixes

### Version 1.2.0 - Group & Chat Improvements
- ✨ **Enter key sends messages** - Chat now uses Enter to send (Shift+Enter for new lines)
- ✨ **Global invite code search** - Join groups from anywhere, not just your own groups
- 🐛 **Fixed friend visibility** - Friends now display bidirectionally (both users see each other)
- 🐛 **Fixed friend request errors** - Resolved undefined email/profile picture fields
- 🐛 **Improved page layout** - Reduced max-width constraints for better appearance
- ✨ **Online friends indicator** - See which friends are currently online on dashboard

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
       match /{document=**} {
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
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId && request.resource.size < 10485760;
       }
       match /group-files/{groupId}/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```
   The app opens at `http://localhost:5173/`

## Deployment

### GitHub Pages

The project is configured for automatic deployment to GitHub Pages using GitHub Actions.

**To deploy:**

1. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build the project with the correct base path (`/study-buddy/`)
   - Upload to GitHub Pages
   - Deploy in ~2-3 minutes

3. Your site will be live at: `https://<your-github-username>.github.io/study-buddy/`

**Configuration:**
- Vite base path is automatically set to `/study-buddy/` when `GITHUB_PAGES=true`
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- See [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) for detailed setup instructions and custom domain configuration

## Available Scripts

- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run deploy` - Deploy to GitHub Pages
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
- **group_calls** - Active calls with participants and call metadata

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/study-buddy.git
   cd study-buddy
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Install dependencies and start development**
   ```bash
   npm install
   npm run dev
   ```

4. **Make your changes**
   - Follow the existing code style
   - Ensure your changes compile without errors (`npm run lint`)
   - Test your changes thoroughly

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   git push origin feature/your-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link related issues if applicable
   - Ensure CI checks pass

**Development Guidelines:**
- Use TypeScript for type safety
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Keep components small and reusable
- Add error handling and loading states
- Test with different screen sizes (responsive design)

## Roadmap

### ✅ Completed
- Study streak tracking with current and all-time records
- Pomodoro timer with 15min, 25min, and 50min presets
- Dark/Light theme with system detection
- Profile picture upload with image compression
- Study goals and progress tracking (daily/weekly per subject)
- Analytics dashboard with 3 tabs (goals, subjects, weekly reports)
- Study groups with global invite code search
- Bidirectional friend system with requests
- Real-time group chat with Enter key send
- Competitive leaderboards with rankings
- Calendar heatmap for study visualization
- Landing page website with feature showcase
- Student code system for friend discovery
- Online friends indicator on dashboard
- File sharing in groups
- GitHub Pages deployment with CI/CD

### 🚀 In Progress
- WebRTC voice/video calls infrastructure
- Call notifications and join propagation to group members

### 📋 Upcoming Features
- **Communication**
  - WebRTC for peer-to-peer voice/video calls
  - Screen sharing during calls
  - Call recording (optional)
  - Missed call notifications

- **Notifications & Engagement**
  - Push notifications for friend requests
  - Missed call alerts
  - Group message notifications
  - Study reminders
  - Achievement unlocked notifications

- **Gamification & Social**
  - Achievements and badges system
  - Study streaks milestones (7 days, 30 days, 100 days, etc.)
  - Seasonal challenges and competitions
  - Social sharing of achievements
  - User profiles with statistics showcase

- **Advanced Analytics**
  - Personalized study insights and recommendations
  - Study habit analysis (peak productivity times)
  - Subject performance comparison
  - Predictive goal completion estimates
  - Detailed progress reports

- **Group Features**
  - Group study sessions scheduling
  - Study session polls/voting
  - Group announcements
  - Member roles (admin, moderator, member)
  - Group study statistics

- **Mobile & Accessibility**
  - React Native mobile app
  - Progressive Web App (PWA) support
  - Offline mode with sync
  - Accessibility improvements (WCAG 2.1)

- **Platform Expansion**
  - OAuth2 authentication (Google, GitHub)
  - Email verification and recovery
  - Two-factor authentication
  - Supabase integration for self-hosted option
  - API for third-party integrations

### 🔮 Long-term Vision
- AI-powered study recommendations
- Integration with calendar apps
- Integration with note-taking apps
- Tutoring marketplace integration
- Study material recommendation engine
- Competitive study tournaments
- Institutional deployments (schools, universities)

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
