# API Documentation

Base URL: `http://localhost:5001/api`

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 👤 User Routes

### Register User

- **URL**: `/users/register`
- **Method**: `POST`
- **Auth required**: No
- **Body**:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

- **Success Response**: `201 Created`

```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "student"
  }
}
```

### Login User

- **URL**: `/users/login`
- **Method**: `POST`
- **Auth required**: No
- **Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Success Response**: `200 OK`

```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## 📝 Test Routes

### Submit Answer

- **URL**: `/tests/submit-answer`
- **Method**: `POST`
- **Auth required**: Yes
- **Body**:

```json
{
  "questionId": "string",
  "selectedAnswer": "string",
  "timeSpent": "number"
}
```

- **Success Response**: `200 OK`

```json
{
  "success": true,
  "isCorrect": "boolean",
  "correctAnswer": "string",
  "solution": "string"
}
```

### Complete Test

- **URL**: `/tests/complete`
- **Method**: `POST`
- **Auth required**: Yes
- **Body**:

```json
{
  "lessonId": "string",
  "chapter": "string",
  "totalTime": "number"
}
```

- **Success Response**: `200 OK`

```json
{
  "success": true,
  "score": "number",
  "correctAnswers": "number",
  "totalQuestions": "number",
  "timeSpent": "number"
}
```

### Get Test History

- **URL**: `/tests/history`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`

```json
{
  "success": true,
  "testHistory": [
    {
      "_id": "string",
      "lesson": {
        "lessonName": "string"
      },
      "chapter": "string",
      "score": "number",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "timeSpent": "number",
      "completedAt": "date"
    }
  ]
}
```

### Get Test Details

- **URL**: `/tests/details/:testId`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Params**: `testId=[string]`
- **Success Response**: `200 OK`

```json
{
  "success": true,
  "lesson": {
    "lessonName": "string"
  },
  "answers": [
    {
      "question": {
        "questionText": "string",
        "options": ["string"],
        "correctAnswer": "string",
        "imageUrl": "string",
        "solution": "string"
      },
      "selectedAnswer": "string",
      "isCorrect": "boolean",
      "timeSpent": "number"
    }
  ],
  "score": "number",
  "totalQuestions": "number",
  "correctAnswers": "number",
  "wrongAnswers": "number",
  "emptyAnswers": "number",
  "timeSpent": "number"
}
```

### Get Performance Stats

- **URL**: `/tests/performance`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`

```json
{
  "success": true,
  "totalTests": "number",
  "averageScore": "number",
  "totalTimeSpent": "number",
  "successRate": "number",
  "tests": [
    {
      "_id": "string",
      "chapter": "string",
      "date": "date",
      "score": "number",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "wrongAnswers": "number",
      "emptyAnswers": "number",
      "timeSpent": "number",
      "lessonName": "string"
    }
  ]
}
```

## 📚 Lesson Routes

### Create Lesson

- **URL**: `/lessons`
- **Method**: `POST`
- **Auth required**: Yes (Admin only)
- **Body**:

```json
{
  "lessonName": "string",
  "chapter": "string",
  "description": "string"
}
```

- **Success Response**: `201 Created`

```json
{
  "success": true,
  "lesson": {
    "id": "string",
    "lessonName": "string",
    "chapter": "string",
    "description": "string"
  }
}
```

### Get All Lessons

- **URL**: `/lessons`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`

```json
{
  "success": true,
  "lessons": [
    {
      "id": "string",
      "lessonName": "string",
      "chapter": "string",
      "description": "string"
    }
  ]
}
```

## ❓ Question Routes

### Create Question

- **URL**: `/questions`
- **Method**: `POST`
- **Auth required**: Yes (Admin only)
- **Body**:

```json
{
  "lessonId": "string",
  "questionText": "string",
  "options": ["string"],
  "correctAnswer": "string",
  "solution": "string",
  "imageUrl": "string"
}
```

- **Success Response**: `201 Created`

```json
{
  "success": true,
  "question": {
    "id": "string",
    "questionText": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "solution": "string",
    "imageUrl": "string"
  }
}
```

### Get Questions by Lesson

- **URL**: `/questions/lesson/:lessonId`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Params**: `lessonId=[string]`
- **Success Response**: `200 OK`

```json
{
  "success": true,
  "questions": [
    {
      "id": "string",
      "questionText": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "solution": "string",
      "imageUrl": "string"
    }
  ]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error message"
}
```

## Rate Limiting

- Maximum 100 requests per IP per 15 minutes for most endpoints
- Maximum 20 requests per IP per 15 minutes for authentication endpoints

## Notes

- All timestamps are in ISO 8601 format
- All IDs are MongoDB ObjectIDs
- Image URLs should be valid URLs to publicly accessible images
- The API uses JSON for request and response bodies
- All routes return a `success` boolean indicating the status of the request
