# NestJS AWS S3 Image Management Service

A NestJS service for managing images using AWS S3, supporting upload and download operations with folder organization.

## Features

- Upload images to specific folders in AWS S3
- Download entire folders as ZIP
- Download session-specific images
- Download single images
- Folder organization by date and session

## Prerequisites

- Node.js (v14 or later)
- AWS Account with S3 access
- AWS IAM credentials

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### 1. Upload Image

Upload an image to a specific folder organized by date and session.

```http
POST /s3/upload
Content-Type: application/json

{
  "date": "2024-03-20",
  "session": "session1",
  "fileName": "example.png",
  "fileBuffer": "<base64_encoded_file_or_buffer>"
}
```

### 2. Download Folder as ZIP

Download all images from a specific folder as a ZIP file.

```http
GET /s3/download-folder/{folderName}
```

Example:
```
http://localhost:3000/s3/download-folder/2024-03-20
```

### 3. Download Session Images

Get a list of all images in a specific session.

```http
GET /s3/download/session/{date}/{session}
```

Example:
```
http://localhost:3000/s3/download/session/2024-03-20/session1
```

### 4. Download Single Image

Download a specific image from a session.

```http
GET /s3/download/image/{date}/{session}/{fileName}
```

Example:
```
http://localhost:3000/s3/download/image/2024-03-20/session1/example.png
```

## Example Usage (Frontend)

### Downloading a Folder as ZIP

```javascript
async function downloadFolderAsZip(folderName) {
  try {
    const response = await fetch(`/s3/download-folder/${folderName}`);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading folder:', error);
  }
}
```

### Uploading an Image

```javascript
async function uploadImage(date, session, fileName, fileBuffer) {
  try {
    const response = await fetch('/s3/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        session,
        fileName,
        fileBuffer,
      }),
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}
```

## Folder Structure

Images in S3 are organized using the following structure:
```
bucket_name/
├── date/
│   ├── session/
│   │   ├── image1.png
│   │   ├── image2.png
│   │   └── ...
│   └── ...
└── ...
```

## License

This project is MIT licensed.
