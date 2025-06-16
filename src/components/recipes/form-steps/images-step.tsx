'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UploadDropzone } from '@/lib/uploadthing';
import {
  X,
  Star,
  Upload,
  Image as ImageIcon,
  Camera,
  AlertCircle,
  Loader2,
  CheckCircle,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { RecipeFormData } from '@/lib/validations/recipe';
import type { ClientUploadedFileData } from 'uploadthing/types';

interface UploadingFile {
  name: string;
  size: number;
  progress: number;
}

export default function ImagesStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<RecipeFormData>();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileCount, setSelectedFileCount] = useState(0);

  const images = watch('images') || [];
  const primaryImageIndex = watch('primaryImageIndex') || 0;

  const handleUploadBegin = (fileName: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSelectedFileCount(0); // Reset selected file count when upload begins

    // Initialize uploading files state with the filename
    setUploadingFiles([
      {
        name: fileName,
        size: 0, // Size not available from UploadThing callback
        progress: 0,
      },
    ]);
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);

    // Update individual file progress (simplified - UploadThing doesn't provide per-file progress)
    setUploadingFiles((prev) => prev.map((file) => ({ ...file, progress })));
  };

  const handleUploadComplete = (
    uploadedFiles: ClientUploadedFileData<{ uploadedBy: string }>[]
  ) => {
    // Get URLs directly from UploadThing file data
    const newImageUrls = uploadedFiles.map((file) => file.ufsUrl);

    const existingImages = images || [];
    const allImages = [...existingImages, ...newImageUrls];

    setValue('images', allImages, { shouldValidate: true, shouldDirty: true });

    // Set primary image to first uploaded if no images existed
    if (existingImages.length === 0 && newImageUrls.length > 0) {
      setValue('primaryImageIndex', 0, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    // Reset upload states
    setIsUploading(false);
    setUploadingFiles([]);
    setUploadProgress(0);
  };

  const handleUploadError = () => {
    setIsUploading(false);
    setUploadingFiles([]);
    setUploadProgress(0);
    setSelectedFileCount(0); // Reset selected file count on error
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = images || [];
    const newImages = currentImages.filter(
      (_, index) => index !== indexToRemove
    );
    setValue('images', newImages);

    // Adjust primary image index if needed
    if (indexToRemove === primaryImageIndex) {
      setValue('primaryImageIndex', 0);
    } else if (indexToRemove < primaryImageIndex) {
      setValue('primaryImageIndex', primaryImageIndex - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    setValue('primaryImageIndex', index);
  };

  const canUploadMore = images.length < 5; // Max 5 images
  const totalFiles = images.length + uploadingFiles.length;

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Recipe Images
        </h3>
        <p className="text-sm text-gray-600">
          Upload photos of your recipe. The first image will be used as the
          cover photo, but you can change this by clicking the star icon.
        </p>
      </div>

      {/* Upload Zone */}
      {canUploadMore && !isUploading && (
        <Card className="border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
          <CardContent className="p-6">
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadBegin={handleUploadBegin}
              onUploadProgress={handleUploadProgress}
              onDrop={(acceptedFiles) => {
                setSelectedFileCount(acceptedFiles.length);
              }}
              appearance={{
                container: 'w-full h-64 border-0 bg-transparent',
                uploadIcon: 'text-gray-400 mb-4',
                label: 'text-gray-600 text-base font-medium',
                allowedContent: 'text-gray-500 text-sm',
                button:
                  'ut-uploading:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors ut-uploading:bg-gray-400 disabled:opacity-50',
              }}
              content={{
                uploadIcon: <Upload className="h-10 w-10" />,
                label: 'Drop recipe images here or click to browse',
                allowedContent: `Images up to 4MB (${5 - totalFiles} remaining)`,
                button: isUploading
                  ? 'Uploading...'
                  : selectedFileCount > 0
                    ? `Upload ${selectedFileCount} ${selectedFileCount === 1 ? 'File' : 'Files'}`
                    : 'Choose Files',
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Active Upload Progress */}
      {isUploading && uploadingFiles.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Uploading {uploadingFiles.length}{' '}
                    {uploadingFiles.length === 1 ? 'image' : 'images'}...
                  </h4>
                  <p className="text-sm text-blue-700">
                    Please wait while your images are being uploaded
                  </p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">Overall Progress</span>
                  <span className="text-blue-800">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              {/* Individual File Progress */}
              <div className="space-y-3">
                {uploadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-white p-3"
                  >
                    <FileImage className="h-4 w-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.progress === 100 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-16">
                            <Progress value={file.progress} className="h-1" />
                          </div>
                          <span className="min-w-[3ch] text-xs text-gray-500">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errors.images && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Image Upload Error</span>
            </div>
            <p className="mt-1 text-sm text-red-700">{errors.images.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">
              Uploaded Images ({images.length}/5)
            </h4>
            {images.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Star className="mr-1 h-3 w-3" />
                Primary: Image {primaryImageIndex + 1}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((imageUrl, index) => (
              <Card
                key={index}
                className={cn(
                  'group relative overflow-hidden transition-all hover:shadow-md',
                  index === primaryImageIndex &&
                    'ring-2 ring-blue-500 ring-offset-2'
                )}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={imageUrl}
                      alt={`Recipe image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Primary Image Badge */}
                    {index === primaryImageIndex && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-xs text-white">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Primary
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-all duration-200 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {/* Set Primary Button */}
                        {index !== primaryImageIndex && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryImage(index)}
                            className="h-auto bg-white px-2 py-1 text-xs text-gray-900 hover:bg-gray-100"
                          >
                            <Star className="mr-1 h-3 w-3" />
                            Set Primary
                          </Button>
                        )}

                        {/* Remove Button */}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="h-auto px-2 py-1 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {images.length === 0 && !isUploading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Camera className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="mb-2 text-sm font-medium text-blue-900">
                  Tips for Great Recipe Photos
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Use natural light when possible</li>
                  <li>• Show the finished dish from multiple angles</li>
                  <li>• Include photos of key preparation steps</li>
                  <li>• Keep backgrounds simple and clean</li>
                  <li>• Make sure images are clear and well-lit</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Limit Warning */}
      {images.length >= 5 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                Maximum images reached (5/5)
              </span>
            </div>
            <p className="mt-1 text-sm text-orange-700">
              Remove an image to upload a new one.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-600">
              Images uploaded: {images.length}/5
              {uploadingFiles.length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({uploadingFiles.length} uploading...)
                </span>
              )}
            </span>
            <span className="text-gray-600">
              {isUploading
                ? 'Uploading images...'
                : images.length === 0
                  ? 'No images yet - add some to make your recipe more appealing!'
                  : images.length === 1
                    ? 'Great start! Consider adding more angles or preparation steps.'
                    : images.length >= 3
                      ? '✓ Excellent variety of images!'
                      : 'Good! A few more images would be perfect.'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
