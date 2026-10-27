🔐 Secure File Sharing System

A web-based application designed to help users upload, manage, and securely share files through a simple and user-friendly interface.

📌 Project Overview

The Secure File Sharing System is a full-stack web development project that aims to simplify file management and sharing. It combines a frontend interface with a Node.js and Express.js backend, using MongoDB for database management.

✨ Features

- User Authentication: Registration and login interface.
- File Upload: Upload files through the web interface.
- File Management: Manage uploaded files.
- File Deletion: Remove uploaded files when they are no longer needed.
- Database Integration: Use MongoDB to store application data.
- Responsive Interface: A clean and user-friendly frontend.

Note: Include only features that are implemented and working in your current version.

🛠️ Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Tools: Visual Studio Code, Git, GitHub

⚙️ Getting Started

Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB or a MongoDB Atlas account
- Git (optional)

Installation

1. Clone the repository:
   
   git clone YOUR_GITHUB_REPOSITORY_URL

2. Navigate to the project folder:
   
   cd Secure-File-Sharing-System

3. Navigate to the backend folder:
   
   cd backend

4. Install dependencies:
   
   npm install

5. Configure the environment variables in a ".env" file inside the "backend" folder. Add the MongoDB connection string and other required configuration values.
6. Start the backend server using the start command configured in your "package.json".
7. Open "index.html" in your browser or run the frontend using your configured development server.

🔒 Security Considerations

- Keep database credentials and API secrets in environment variables.
- Never commit the ".env" file to GitHub.
- Validate uploaded files on the server.
- Restrict access to files according to the application's authentication and authorization rules.

  Future Improvements

- Role-based access control.
- Expiring file-sharing links.
- Password-protected file sharing.
- File size and type restrictions.
- Improved upload and download security.

Author

Ridhi Kumari

B.Tech — Electrical Engineering
National Institute of Technology Durgapur

---

Developed as a full-stack web development project.