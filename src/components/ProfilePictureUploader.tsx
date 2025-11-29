import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploaderProps {
  userId: string;
  currentImage?: string | null;
  fullName?: string | null;
  onUpload: (file: File) => Promise<string>; // Returns the URL after upload
  onDelete?: () => Promise<void>;
}

export function ProfilePictureUploader({
  userId,
  currentImage,
  fullName,
  onUpload,
  onDelete,
}: ProfilePictureUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsLoading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
      // Reset preview on error
      setPreview(currentImage || null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete();
      setPreview(null);
      toast({
        title: 'Success',
        description: 'Profile picture removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover-lift md-elevate transition-smooth animate-slide-up">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold animate-slide-down">Profile Picture</h3>

        <div className="flex items-center gap-6 animate-fade-in">
          <Avatar
            src={preview}
            name={fullName}
            size="xl"
            className="hover-scale transition-smooth"
          />

          <div className="space-y-3 flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full transition-smooth hover:scale-105 active:scale-95"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Uploading...' : 'Change Picture'}
            </Button>

            {preview && !isLoading && (
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                variant="destructive"
                className="w-full transition-smooth hover:scale-105 active:scale-95"
              >
                <X className="mr-2 h-4 w-4" />
                Remove Picture
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Max size: 10MB. Formats: JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
