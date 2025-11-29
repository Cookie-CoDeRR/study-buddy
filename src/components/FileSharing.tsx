import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileUp, 
  Download, 
  Trash2, 
  File, 
  FileText,
  Image as ImageIcon,
  Music,
  Video,
} from 'lucide-react';
import { 
  uploadGroupFile, 
  subscribeToGroupFiles,
  deleteGroupFile,
  formatFileSize,
  getFileExtension,
  GroupFile,
} from '@/lib/group-chat';
import { db } from '@/integrations/firebase/client';
import { ref, uploadBytes } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface FileSharingProps {
  groupId: string;
  userId: string;
  userName: string;
}

export function FileSharing({ groupId, userId, userName }: FileSharingProps) {
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Subscribe to files
    const unsubscribe = subscribeToGroupFiles(groupId, (newFiles) => {
      setFiles(newFiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document'))
      return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: 'Error',
        description: 'File size must be less than 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const fileRef = ref(
        storage,
        `group-files/${groupId}/${Date.now()}-${selectedFile.name}`
      );

      // Upload to Firebase Storage
      const snapshot = await uploadBytes(fileRef, selectedFile);
      
      // Get download URL
      const { getDownloadURL } = await import('firebase/storage');
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Save file metadata to Firestore
      await uploadGroupFile(
        groupId,
        userId,
        userName,
        selectedFile.name,
        fileUrl,
        selectedFile.size,
        selectedFile.type
      );

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });

      // Reset input
      if (e.target) e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    }
    setUploading(false);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteGroupFile(fileId);
      toast({
        title: 'Success',
        description: 'File deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <Card className="p-4 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <FileUp className="w-8 h-8 text-gray-400" />
          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max 50MB per file
            </p>
          </div>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </Card>

      {/* Files List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
          Shared Files ({files.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>No files shared yet</p>
          </Card>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((file) => (
              <Card
                key={file.id}
                className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                    {getFileIcon(file.fileType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-blue-600 hover:underline truncate dark:text-blue-400"
                    >
                      {file.fileName}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>by {file.uploadedByName}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(file.uploadedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a
                      href={file.fileUrl}
                      download={file.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </a>
                  </Button>

                  {userId === file.uploadedBy && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteFile(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
