# Online Testing System

A comprehensive web-based testing platform that allows students to take practice tests and exams while enabling administrators to manage questions, lessons, and users.

## 🎥 Project Demo & Features

[Watch the Project Demo Video] https://drive.google.com/drive/folders/1aiQWJdnCpQQ2am0FNNb_n6tBjUTaTywt?usp=sharing (10-minute walkthrough of features)

## 🌟 Features

### For Students

- Practice test creation with customizable difficulty levels
- Real-time test taking with timer
- Detailed performance reports and analytics
- Progress tracking across different subjects
- Immediate feedback on answers

### For Administrators

- User management system
- Question bank management
- Lesson and chapter organization
- Performance monitoring
- Content management capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm (v6.14.0 or higher)

### Installation

1. Clone the repository

```bash
git clone https://github.com/Hossein-Marvi/IE-Project.git
cd online-testing-system
```

2. Set up the Backend

```bash
cd backend
npm install
```

3. Set up the Frontend

```bash
cd frontend
npm install
```

### Configuration

1. Backend Configuration

- Create a `.env` file in the backend directory with the following variables:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/testing-system
JWT_SECRET=your_jwt_secret_key
```

2. Frontend Configuration

- Update the API base URL in `frontend/src/js/config.js` if needed
- Default API URL is `http://localhost:5001`

### Running the Application

1. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on http://localhost:5001

2. Start the Frontend Application

```bash
cd frontend
# If using a simple HTTP server
python -m http.server 8080
# Or use any preferred method to serve static files
```

Access the application at http://localhost:8080

## 📁 Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
```

### Frontend Structure

```
frontend/
├── src/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   │   ├── admin/     # Admin-specific scripts
│   │   └── student/   # Student-specific scripts
│   ├── pages/         # HTML pages
│   │   ├── admin/     # Admin pages
│   │   └── student/   # Student pages
│   └── images/        # Image assets
```

## 🔑 Default Access

### Admin Access

- URL: `/pages/admin/login.html`
- Default credentials:
  - Email: mr.marvi2001@gmail.com
  - Password: 34748634

### Student Access

- URL: `/pages/student/login.html`
- Create a new account through the signup page

## 🛠 Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5
- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

## 📝 API Documentation

API documentation is available at `/api-docs` when running the backend server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔗 Links

- [GitHub Repository] https://github.com/Hossein-Marvi/IE-Project.git
- [Feature Demo Videos] https://drive.google.com/drive/folders/1aiQWJdnCpQQ2am0FNNb_n6tBjUTaTywt?usp=sharing

## 👥 Contact

Your Name - [Mr.marvi2001@gmail.com]
