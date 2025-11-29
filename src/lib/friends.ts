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
      friendEmail: toUserData.email,
      friendStudentCode: toStudentCode,
      friendProfilePicture: toUserData.profile_picture_url,
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
 * Get all friends (accepted) for a user
 */
export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    const q = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    const snapshot = await getDocs(q);
    const friends: Friend[] = [];

    snapshot.forEach((doc) => {
      friends.push({
        id: doc.id,
        ...doc.data(),
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
    const q = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    const requests: Friend[] = [];

    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      } as Friend);
    });

    return requests;
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
