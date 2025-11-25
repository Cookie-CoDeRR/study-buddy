# StudyTracker

A modern study session tracking application built with React, Firebase, and Tailwind CSS. Track your study sessions, manage subjects, and monitor your study progress with an intuitive dashboard.

## Features

- **User Authentication**: Secure email/password authentication with Firebase Auth
- **Profile Management**: Upload and manage profile pictures with avatar fallback
- **Study Session Tracking**: Record study sessions with start/end times and duration
- **Subject Management**: Create and organize subjects with custom colors
- **Break Mode**: Track break times separately from study sessions
- **Real-time Statistics**: View today's study time, total study time, and total breaks
- **Unique Student Codes**: Each user receives an auto-generated unique student code for identification
- **Study Streak Tracking**: Track consecutive days of studying with current and all-time streaks
- **Pomodoro Timer Presets**: Quick access to preset timers (15min, 25min, 50min study sessions and 5min, 15min breaks)
- **Dark/Light Theme Toggle**: System theme detection with manual light/dark/system mode selection
- **Responsive Design**: Fully responsive UI built with Tailwind CSS and shadcn/ui components
- **Real-time Updates**: Live Firestore listeners for instant data synchronization

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Project Structure

```
src/
├── pages/              # Main page components
│   ├── Auth.tsx       # Login/Sign-up page
│   ├── Index.tsx      # Dashboard/Home page
│   ├── Profile.tsx    # User profile management
│   └── NotFound.tsx   # 404 page
├── components/        # Reusable components
│   ├── StudyTimer.tsx        # Timer with Pomodoro presets
│   ├── StudyHistory.tsx      # Recent sessions display
│   ├── SubjectManager.tsx    # Subject creation and management
│   ├── StreakDisplay.tsx     # Current and longest streak display
│   ├── ThemeToggle.tsx       # Theme switcher component
│   ├── NavLink.tsx           # Navigation link component
│   └── ui/                   # shadcn/ui components
├── contexts/
│   └── ThemeContext.tsx      # Dark/Light theme context provider
├── integrations/
│   └── firebase/
│       ├── client.ts         # Firebase initialization
│       └── types.ts          # TypeScript types for Firestore documents
├── hooks/              # Custom React hooks
├── lib/                # Utility functions (includes streak.ts)
└── App.tsx            # Main app component
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or use [nvm](https://github.com/nvm-sh/nvm))
- A Firebase project with Firestore and Authentication enabled

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
   - Enable Firestore Database (Production mode)
   - Enable Email/Password authentication
   - Enable Storage (for profile pictures)
   - Create composite indexes for the following queries:
     - `subjects`: `user_id` (Asc) + `created_at` (Desc)
     - `study_sessions`: `user_id` (Asc) + `start_time` (Desc)
   - Set Storage Rules to allow authenticated users to read/write their own files:
     ```firestore
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /profile-pictures/{userId}/{allPaths=**} {
           allow read, write: if request.auth.uid == userId;
         }
       }
     }
     ```

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

5. **Set Firestore Security Rules**
   In Firebase Console > Firestore > Rules, set:
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /profiles/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       
       match /subjects/{document=**} {
         allow read, write: if request.auth != null && 
           (request.resource.data.user_id == request.auth.uid ||
            resource.data.user_id == request.auth.uid);
       }
       
       match /study_sessions/{document=**} {
         allow read, write: if request.auth != null && 
           (request.resource.data.user_id == request.auth.uid ||
            resource.data.user_id == request.auth.uid);
       }
     }
   }
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:8080/`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firestore Schema

### Collections

#### `profiles`
- Document ID: User UID
- Fields:
  - `user_id` (string) - User's Firebase UID
  - `full_name` (string | null) - User's full name
  - `phone` (string | null) - User's phone number
  - `profile_picture_url` (string | null) - URL to user's profile picture in Firebase Storage
  - `student_code` (string) - Unique identifier (auto-generated)
  - `created_at` (number) - Timestamp in milliseconds
  - `current_streak` (number) - Current consecutive days studied
  - `longest_streak` (number) - All-time longest streak
  - `last_study_date` (string | null) - Last study date in YYYY-MM-DD format
  - `theme` (string) - Theme preference ('light' | 'dark' | 'system')

#### `subjects`
- Document ID: Auto-generated
- Fields:
  - `user_id` (string) - User's UID
  - `name` (string) - Subject name
  - `color` (string) - Hex color code
  - `created_at` (number) - Timestamp in milliseconds

#### `study_sessions`
- Document ID: Auto-generated
- Fields:
  - `user_id` (string) - User's UID
  - `subject_id` (string | null) - Reference to subject
  - `start_time` (string) - ISO timestamp
  - `end_time` (string) - ISO timestamp
  - `duration_minutes` (number) - Duration in minutes
  - `session_type` (string) - "study" or "break"
  - `date` (string) - Date in YYYY-MM-DD format
  - `created_at` (number) - Timestamp in milliseconds

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style:
   - Use TypeScript for type safety
   - Follow React best practices (hooks, functional components)
   - Keep components focused and reusable
   - Add meaningful comments for complex logic

3. **Test your changes** locally:
   ```bash
   npm run dev
   ```

4. **Lint and format** your code:
   ```bash
   npm run lint
   ```

5. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork and create a Pull Request**

### Code Style Guidelines

- Use functional components with hooks
- Prefer TypeScript interfaces for props
- Keep components small and focused (under 200 lines when possible)
- Use descriptive variable and function names
- Add error handling for async operations
- Use Firestore real-time listeners for live updates

### Common Tasks

**Adding a new page:**
1. Create a new file in `src/pages/`
2. Add the route in `App.tsx`
3. Import and use the page component

**Creating a new component:**
1. Create a file in `src/components/`
2. Use functional component with TypeScript
3. Export the component as default

**Adding a UI element:**
1. Check if shadcn/ui has the component
2. If yes, import from `@/components/ui/`
3. If no, build custom with Tailwind CSS

## Troubleshooting

**"No document to update" error**
- Ensure the Firestore document exists
- Check that the user UID matches the document ID
- Verify Firestore security rules allow the operation

**"The query requires an index" error**
- Firebase will provide a link to create the index
- Create the composite index as suggested
- Indexes may take 1-2 minutes to build

**Student code shows "Generating..."**
- Check browser console for errors
- Verify Firebase config is correct in `.env`
- Clear browser cache and refresh

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check TypeScript documentation: https://www.typescriptlang.org/docs/

## Roadmap

### ✅ Completed Features
- Study streak tracking with current/all-time display
- Pomodoro timer presets (15/25/50 min study, 5/15 min breaks)
- Dark/Light theme toggle with system detection
- Profile picture upload with avatar initials fallback

### 🚀 Upcoming Features
- Study goals and targets (daily/weekly goals per subject)
- Weekly study reports with analytics and visualizations
- Subject-specific analytics (total hours, session count, averages)
- Mobile app (React Native) with code sharing architecture
