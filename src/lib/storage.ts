import { storage } from '@/integrations/firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload profile picture to Firebase Storage
 * @param userId - User's Firebase UID
 * @param file - Image file to upload
 * @returns Download URL of the uploaded image
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    console.log('Starting upload for file:', file.name, 'Size:', file.size);
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);

    console.log('Storage ref path:', `profile-pictures/${userId}/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload snapshot:', snapshot);

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', url);
    
    return url;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Delete profile picture from Firebase Storage
 * @param userId - User's Firebase UID
 * @param imageUrl - Download URL of the image to delete
 */
export async function deleteProfilePicture(userId: string, imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
}

/**
 * Delete all profile pictures for a user
 * @param userId - User's Firebase UID
 */
export async function deleteAllUserProfilePictures(userId: string): Promise<void> {
  try {
    const folderRef = ref(storage, `profile-pictures/${userId}`);
    // Firebase Storage doesn't have a direct delete folder method
    // This would need to be handled via Cloud Functions or client-side deletion of known URLs
    console.log('To delete all pictures, delete them individually or use Cloud Functions');
  } catch (error) {
    console.error('Error deleting user profile pictures:', error);
    throw error;
  }
}
