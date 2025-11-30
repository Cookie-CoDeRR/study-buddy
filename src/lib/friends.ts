import { db } from '@/integrations/firebase/client';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

export interface Friend {
  id: string;
  userId: string;
  friendUserId: string;
  friendName: string;
  friendEmail: string;
  friendStudentCode: string;
  friendProfilePicture?: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: number;
  acceptedAt?: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  members: string[];
  memberCount: number;
  inviteCode: string;
  createdAt: number;
  updatedAt: number;
}

export interface GroupMember {
  userId: string;
  name: string;
  studentCode: string;
  profilePicture?: string;
  totalTodayMinutes: number;
  currentStreak: number;
}

/**
 * Send friend request via student code
 */
export async function sendFriendRequest(
  fromUserId: string,
  fromUserName: string,
  toStudentCode: string
): Promise<void> {
  try {
    // Find user by student code
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('student_code', '==', toStudentCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Student code not found');
    }

    const toUserDoc = snapshot.docs[0];
    const toUserId = toUserDoc.id;
    const toUserData = toUserDoc.data();

    // Check if already friends or request pending
    const friendQ = query(
      collection(db, 'friends'),
      where('userId', '==', fromUserId),
      where('friendUserId', '==', toUserId)
    );
    const friendSnapshot = await getDocs(friendQ);

    if (!friendSnapshot.empty) {
      throw new Error('Friend request already exists');
    }

    // Create friend request
    await addDoc(collection(db, 'friends'), {
      userId: fromUserId,
      friendUserId: toUserId,
      friendName: toUserData.full_name || 'Unknown User',
      friendEmail: toUserData.email || '',
      friendStudentCode: toStudentCode,
      friendProfilePicture: toUserData.profile_picture_url || '',
      status: 'pending',
      createdAt: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(friendRequestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friends', friendRequestId), {
      status: 'accepted',
      acceptedAt: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Reject/delete friend request
 */
export async function rejectFriendRequest(friendRequestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friends', friendRequestId));
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

/**
 * Delete/unfriend a friend
 */
export async function deleteFriend(friendId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friends', friendId));
  } catch (error) {
    console.error('Error deleting friend:', error);
    throw error;
  }
}

/**
 * Get all friends (accepted) for a user
 */
export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    // Get friends where user sent the request
    const q1 = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    const snapshot1 = await getDocs(q1);
    const friends: Friend[] = [];

    snapshot1.forEach((doc) => {
      friends.push({
        id: doc.id,
        ...doc.data(),
      } as Friend);
    });

    // Get friends where user received the request (they are the friendUserId)
    const q2 = query(
      collection(db, 'friends'),
      where('friendUserId', '==', userId),
      where('status', '==', 'accepted')
    );
    const snapshot2 = await getDocs(q2);

    snapshot2.forEach((doc) => {
      const data = doc.data();
      friends.push({
        id: doc.id,
        userId: data.friendUserId, // Swap for consistency
        friendUserId: data.userId,
        friendName: data.friendName,
        friendEmail: data.friendEmail,
        friendStudentCode: data.friendStudentCode,
        friendProfilePicture: data.friendProfilePicture,
        status: 'accepted',
        createdAt: data.createdAt,
        acceptedAt: data.acceptedAt,
      } as Friend);
    });

    return friends;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
}

/**
 * Get pending friend requests
 */
export async function getPendingRequests(userId: string): Promise<Friend[]> {
  try {
    // Get RECEIVED requests (where user is the friendUserId) - these need to be accepted/rejected
    const q = query(
      collection(db, 'friends'),
      where('friendUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    const requestsMap = new Map<string, Friend>(); // Use Map to deduplicate by friendUserId

    snapshot.forEach((doc) => {
      const data = doc.data();
      const friendUserId = data.userId;
      
      // Only add if we haven't seen this friend before (deduplication)
      if (!requestsMap.has(friendUserId)) {
        requestsMap.set(friendUserId, {
          id: doc.id,
          userId: data.friendUserId,
          friendUserId: data.userId,
          friendName: data.friendName,
          friendEmail: data.friendEmail,
          friendStudentCode: data.friendStudentCode,
          friendProfilePicture: data.friendProfilePicture,
          status: 'pending',
          createdAt: data.createdAt,
        } as Friend);
      }
    });

    return Array.from(requestsMap.values());
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw error;
  }
}

/**
 * Create a study group
 */
export async function createStudyGroup(
  creatorId: string,
  creatorName: string,
  name: string,
  description: string
): Promise<string> {
  try {
    // Generate invite code
    const inviteCode = 'GRP-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const docRef = await addDoc(collection(db, 'study_groups'), {
      name,
      description,
      creatorId,
      creatorName,
      members: [creatorId],
      memberCount: 1,
      inviteCode,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating study group:', error);
    throw error;
  }
}

/**
 * Join a study group via invite code
 */
export async function joinStudyGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, 'study_groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupSnap.data();

    if (groupData.members.includes(userId)) {
      throw new Error('Already a member of this group');
    }

    await updateDoc(groupRef, {
      members: [...groupData.members, userId],
      memberCount: groupData.members.length + 1,
      updatedAt: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
}

/**
 * Find a study group by invite code
 */
export async function findGroupByInviteCode(inviteCode: string): Promise<StudyGroup | null> {
  try {
    const q = query(
      collection(db, 'study_groups'),
      where('inviteCode', '==', inviteCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as StudyGroup;
  } catch (error) {
    console.error('Error finding group by invite code:', error);
    throw error;
  }
}

/**
 * Get user's study groups
 */
export async function getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
  try {
    const q = query(
      collection(db, 'study_groups'),
      where('members', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    const groups: StudyGroup[] = [];

    snapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data(),
      } as StudyGroup);
    });

    return groups;
  } catch (error) {
    console.error('Error getting user study groups:', error);
    throw error;
  }
}

/**
 * Get group members with their stats
 */
export async function getGroupMemberStats(groupId: string): Promise<GroupMember[]> {
  try {
    const groupRef = doc(db, 'study_groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const memberIds = groupSnap.data().members;
    const members: GroupMember[] = [];

    for (const memberId of memberIds) {
      const profileRef = doc(db, 'profiles', memberId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        
        // Get today's study minutes
        const today = new Date().toISOString().split('T')[0];
        const sessionsRef = collection(db, 'study_sessions');
        const q = query(
          sessionsRef,
          where('user_id', '==', memberId),
          where('date', '==', today),
          where('session_type', '==', 'study')
        );
        const sessionsSnap = await getDocs(q);
        
        let todayMinutes = 0;
        sessionsSnap.forEach((doc) => {
          todayMinutes += doc.data().duration_minutes || 0;
        });

        members.push({
          userId: memberId,
          name: profileData.full_name || 'Unknown User',
          studentCode: profileData.student_code,
          profilePicture: profileData.profile_picture_url,
          totalTodayMinutes: todayMinutes,
          currentStreak: profileData.current_streak || 0,
        });
      }
    }

    // Sort by today's study minutes (descending)
    return members.sort((a, b) => b.totalTodayMinutes - a.totalTodayMinutes);
  } catch (error) {
    console.error('Error getting group member stats:', error);
    throw error;
  }
}

/**
 * Leave a study group
 */
export async function leaveStudyGroup(groupId: string, userId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'study_groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupSnap.data();
    const updatedMembers = groupData.members.filter((id: string) => id !== userId);

    if (updatedMembers.length === 0) {
      // Delete group if no members left
      await deleteDoc(groupRef);
    } else {
      await updateDoc(groupRef, {
        members: updatedMembers,
        memberCount: updatedMembers.length,
        updatedAt: new Date().getTime(),
      });
    }
  } catch (error) {
    console.error('Error leaving study group:', error);
    throw error;
  }
}

/**
 * Send friend request by userId (for chat interface)
 */
export async function sendFriendRequestByUserId(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  try {
    // Get the recipient's user data
    const profileRef = doc(db, 'profiles', toUserId);
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = profileDoc.data();

    // Check if already friends or request pending
    const friendQ = query(
      collection(db, 'friends'),
      where('userId', '==', fromUserId),
      where('friendUserId', '==', toUserId)
    );
    const friendSnapshot = await getDocs(friendQ);

    if (!friendSnapshot.empty) {
      throw new Error('Friend request already exists');
    }

    // Create friend request
    await addDoc(collection(db, 'friends'), {
      userId: fromUserId,
      friendUserId: toUserId,
      friendName: userData.full_name || 'Unknown User',
      friendEmail: userData.email || '',
      friendStudentCode: userData.student_code || '',
      friendProfilePicture: userData.profile_picture_url || '',
      status: 'pending',
      createdAt: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Get friend profile details including bio and study streak
 */
export async function getFriendProfileDetails(friendUserId: string): Promise<{
  name: string;
  profilePicture?: string;
  bio?: string;
  currentStreak: number;
  totalTodayMinutes: number;
  studentCode: string;
}> {
  try {
    // Fetch profile and streak in parallel for faster loading
    const profileRef = doc(db, 'profiles', friendUserId);
    const streakRef = doc(db, 'streaks', friendUserId);
    
    const [profileSnap, streakSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(streakRef),
    ]);

    if (!profileSnap.exists()) {
      throw new Error('Friend profile not found');
    }

    const profileData = profileSnap.data();
    const streakData = streakSnap.exists() ? streakSnap.data() : null;

    // Get today's study time from daily_totals collection (if exists) or calculate from study_history
    let totalTodayMinutes = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get from daily_totals first (faster single document read)
    try {
      const dailyTotalRef = doc(db, 'daily_totals', `${friendUserId}_${today}`);
      const dailyTotalSnap = await getDoc(dailyTotalRef);
      
      if (dailyTotalSnap.exists()) {
        totalTodayMinutes = dailyTotalSnap.data().totalMinutes || 0;
      } else {
        // Fallback to querying study_history with limit for faster response
        const historyQ = query(
          collection(db, 'study_history'),
          where('userId', '==', friendUserId),
          where('date', '==', today)
        );
        const historySnap = await getDocs(historyQ);
        
        historySnap.forEach((doc) => {
          const data = doc.data();
          totalTodayMinutes += data.minutes || 0;
        });
      }
    } catch (error) {
      // If daily totals fails, just set to 0 and continue
      console.warn('Error fetching today\'s study time:', error);
      totalTodayMinutes = 0;
    }

    return {
      name: profileData.full_name || 'Unknown User',
      profilePicture: profileData.profile_picture_url,
      bio: profileData.bio || '',
      currentStreak: streakData?.currentStreak || 0,
      totalTodayMinutes,
      studentCode: profileData.student_code || '',
    };
  } catch (error) {
    console.error('Error getting friend profile details:', error);
    throw error;
  }
}
