# UploadThing Setup Guide

This document explains how to set up UploadThing for image uploads in the Recipe Share application.

## 1. Create UploadThing Account

1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up for a free account
3. Create a new app/project

## 2. Get API Keys

After creating your app, you'll need two values:

1. **Secret Key**: Found in your UploadThing dashboard under "API Keys"
2. **Token**: Found in your UploadThing dashboard (newer installations use TOKEN instead of APP_ID)

## 3. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# UploadThing Configuration
UPLOADTHING_TOKEN=your-token-here
```

**Note**: According to the official UploadThing documentation, you only need the `UPLOADTHING_TOKEN` environment variable. This replaces the older `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` variables.

## 4. File Upload Configuration

The current configuration supports:

- **File Types**: Images only (jpeg, png, gif, webp)
- **File Size Limit**: 4MB per image
- **Max Files**: 5 images per recipe
- **Upload Endpoint**: `imageUploader`

## 5. Features Implemented

✅ **Drag & Drop Upload**: Users can drag images or click to browse
✅ **Image Preview**: Uploaded images show as thumbnails with hover actions
✅ **Primary Image Selection**: Users can set any image as the primary/cover image
✅ **Image Management**: Remove individual images with confirmation
✅ **Progress Indicators**: Visual feedback during upload process
✅ **Error Handling**: User-friendly error messages for upload failures
✅ **Responsive Design**: Works on mobile and desktop
✅ **Form Integration**: Properly integrated with React Hook Form

## 6. Security Features

- **Authentication**: Upload middleware checks for authenticated users (currently stubbed)
- **File Validation**: Automatic validation of file types and sizes
- **URL Generation**: Secure URL generation for uploaded images
- **CORS Protection**: Built-in CORS handling by UploadThing

## 7. Usage in Components

The image upload is integrated into the recipe creation form as Step 4:

```typescript
// Images are stored as URL strings in the form data
interface RecipeFormData {
  images: string[]; // Array of UploadThing URLs
  primaryImageIndex: number; // Index of primary image
  // ... other fields
}
```

## 8. Next Steps for Production

Before going to production, consider:

1. **Authentication Integration**: Replace the stub auth function with real user authentication
2. **Error Logging**: Set up proper error logging for upload failures
3. **Image Optimization**: Consider adding image optimization/transformation
4. **Usage Monitoring**: Monitor upload usage and costs
5. **Backup Strategy**: Consider backup for important recipe images

## 9. Development Tips

- UploadThing provides excellent development experience with instant feedback
- Test upload functionality with various image types and sizes
- Monitor the browser console for any upload-related errors
- Use the UploadThing dashboard to monitor uploads and debug issues

## 10. Troubleshooting

**Common Issues:**

1. **Upload fails silently**: Check that environment variables are set correctly
2. **CORS errors**: Make sure you're using the correct domain in UploadThing settings
3. **Large file errors**: Verify file size is under 4MB limit
4. **Authentication errors**: Check the auth middleware function

**Debug Steps:**

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with smaller image files
4. Check UploadThing dashboard for error logs
