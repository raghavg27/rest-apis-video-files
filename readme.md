# **REST APIs for Video Files**

### **Overview**
This project provides REST APIs to manage video files. Users can upload, trim, merge, and share video files via secure endpoints. It supports link sharing with time-based expiry and includes size and duration validation for uploaded videos.

---

## **Table of Contents**

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Testing](#testing)



---

## **Features**

- **Video Upload**: Upload video files with configurable size and duration limits.
- **Video Trimming**: Trim videos from the start or end.
- **Video Merging**: Merge multiple videos into a single file.
- **Link Sharing**: Generate sharable links for videos with time-based expiry.
- **Authentication**: API calls require a static token for security.

---

## **Technologies Used**

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for API development.
- **SQLite**: Lightweight relational database for storing video metadata.
- **Prisma**: ORM for database management and query building.
- **FFmpeg**: Multimedia framework for video processing.
- **Multer**: Middleware for handling file uploads.
- **Jest**: Testing framework for unit and integration tests.

---

## **Getting Started**

### **Prerequisites**

- **Node.js** (v14 or later)
- **npm** (Node package manager)
- **FFmpeg** (Ensure `ffmpeg` and `ffprobe` are installed)

### **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rest-apis-video-files.git
   cd rest-apis-video-files
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Create the `uploads/` directory for video files:
   ```bash
   mkdir uploads
   ```

5. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:9000`.

---

## **API Endpoints**

### **1. Video Upload**
- **URL**: `POST /videos/upload`
- **Description**: Upload a video file.
- **Headers**: `Authorization: your_static_api_token`
- **Body (form-data)**: `video` (file)
- **Response**:
  - `201 Created`: Video uploaded successfully.
  - `400 Bad Request`: File missing, exceeds size limits, or duration invalid.

---

### **2. Video Trimming**
- **URL**: `POST /videos/trim`
- **Description**: Trim a video from the start or end.
- **Headers**: `Authorization: your_static_api_token`
- **Body (JSON)**:
  ```json
  {
    "videoId": 1,
    "trimFrom": "start",
    "trimDuration": 10
  }
  ```
- **Response**:
  - `200 OK`: Video trimmed successfully.
  - `400 Bad Request`: Missing or invalid parameters.

---

### **3. Video Merging**
- **URL**: `POST /videos/merge`
- **Description**: Merge multiple video files.
- **Headers**: `Authorization: your_static_api_token`
- **Body (JSON)**:
  ```json
  {
    "videoIds": [1, 2, 3]
  }
  ```
- **Response**:
  - `200 OK`: Videos merged successfully.
  - `404 Not Found`: One or more videos not found.

---

### **4. Link Sharing**
- **URL**: `POST /videos/share`
- **Description**: Generate a sharable link for a video with expiry.
- **Headers**: `Authorization: your_static_api_token`
- **Body (JSON)**:
  ```json
  {
    "videoId": 1,
    "expiryHours": 24
  }
  ```
- **Response**:
  - `200 OK`: Link generated successfully.
  - `404 Not Found`: Video not found.

---

### **5. Access Shared Video**
- **URL**: `GET /videos/shared/:token`
- **Description**: Access a shared video using its token.
- **Response**:
  - `200 OK`: Shared video details.
  - `404 Not Found`: Invalid or expired token.
  - `410 Gone`: Link has expired.

---

## **Environment Variables**

Create a `.env` file in the project root and add the following variables:

```env
DATABASE_URL="file:./dev.db"  # SQLite database path
VALID_TOKENS=["your_static_api_token"]  # Static tokens for API authentication
```

---

## **Testing**

### **Run Tests**
This project uses `Jest` for testing. To run the tests:

```bash
npm test
```

### **Test Coverage**
- **Unit Tests**: Validate individual utility functions.
- **Integration Tests**: Test API endpoints with mock inputs.

---
