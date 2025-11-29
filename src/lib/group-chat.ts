import { db } from '@/integrations/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  createdAt: number;
  updatedAt?: number;
}

export interface GroupFile {
  id: string;
  groupId: string;
  uploadedBy: string;
  uploadedByName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedAt: number;
}

/**
 * Send a message to group chat
 */
export async function sendChatMessage(
  groupId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  message: string
): Promise<string> {
  try {
    const messageData: any = {
      groupId,
      userId,
      userName,
      message: message.trim(),
      createdAt: Timestamp.now(),
    };
    
    // Only include userAvatar if it's defined
    if (userAvatar) {
      messageData.userAvatar = userAvatar;
    }
    
    const docRef = await addDoc(collection(db, 'group_messages'), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'group_messages', messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Fetch recent messages for a group
 */
export async function fetchGroupMessages(
  groupId: string,
  messageLimit: number = 50
): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, 'group_messages'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      messages.push({
        id: doc.id,
        groupId: data.groupId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: data.message,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt,
      });
    });

    return messages.reverse(); // Return in ascending order
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Real-time listener for group messages
 */
export function subscribeToGroupMessages(
  groupId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'group_messages'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as any;
          
          // Convert Timestamp to milliseconds
          let createdAtMs = data.createdAt;
          if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
            createdAtMs = data.createdAt.toMillis();
          } else if (data.createdAt && typeof data.createdAt === 'number') {
            createdAtMs = data.createdAt;
          } else if (data.createdAt && data.createdAt instanceof Date) {
            createdAtMs = data.createdAt.getTime();
          }
          
          messages.push({
            id: doc.id,
            groupId: data.groupId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar || '',
            message: data.message,
            createdAt: createdAtMs || Date.now(),
          });
        });

        console.log(`[Chat] Updated ${messages.length} messages for group ${groupId}`);
        callback(messages);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        // Call callback with empty array on error to stop loading state
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
}

/**
 * Upload a file to group
 */
export async function uploadGroupFile(
  groupId: string,
  userId: string,
  userName: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string
): Promise<string> {
  try {
    const fileData = {
      groupId,
      uploadedBy: userId,
      uploadedByName: userName,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      uploadedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'group_files'), fileData);
    return docRef.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete a file from group
 */
export async function deleteGroupFile(fileId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'group_files', fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Fetch files for a group
 */
export async function fetchGroupFiles(
  groupId: string,
  fileLimit: number = 100
): Promise<GroupFile[]> {
  try {
    const q = query(
      collection(db, 'group_files'),
      where('groupId', '==', groupId),
      orderBy('uploadedAt', 'desc'),
      limit(fileLimit)
    );

    const snapshot = await getDocs(q);
    const files: GroupFile[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      files.push({
        id: doc.id,
        groupId: data.groupId,
        uploadedBy: data.uploadedBy,
        uploadedByName: data.uploadedByName,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
        uploadedAt: data.uploadedAt?.toMillis?.() || data.uploadedAt,
      });
    });

    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

/**
 * Real-time listener for group files
 */
export function subscribeToGroupFiles(
  groupId: string,
  callback: (files: GroupFile[]) => void
): () => void {
  const q = query(
    collection(db, 'group_files'),
    where('groupId', '==', groupId),
    orderBy('uploadedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const files: GroupFile[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      files.push({
        id: doc.id,
        groupId: data.groupId,
        uploadedBy: data.uploadedBy,
        uploadedByName: data.uploadedByName,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
        uploadedAt: data.uploadedAt?.toMillis?.() || data.uploadedAt,
      });
    });

    callback(files);
  });

  return unsubscribe;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'file';
}
