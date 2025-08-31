# 🌾 FarmChain - Smart Agricultural Equipment Rental Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-blue.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1+-black.svg)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)](https://streamlit.io/)

> **Empowering farmers with modern technology for efficient equipment rental and AI-powered recommendations**

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [AI Features](#-ai-features)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

FarmChain is a comprehensive agricultural equipment rental platform that connects farmers, equipment sellers, and administrators. The platform features a modern web application with JWT authentication, multilingual support (English/Marathi), text-to-speech functionality, and an AI-powered equipment recommendation system.

### 🎯 Key Highlights

- **Multi-Role Platform**: Farmer, Seller, and Admin portals
- **Bilingual Support**: English and Marathi with seamless language switching
- **Accessibility Features**: Text-to-speech functionality for Marathi content
- **AI Integration**: Smart equipment recommendations based on crop, soil, and region
- **Modern UI/UX**: Responsive design with Tailwind CSS
- **Secure Authentication**: JWT-based authentication system

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Farmer, Seller, Admin)
- **Session management** with cookie-based tokens
- **Secure password hashing** using bcrypt

### 🌐 Multi-Language Support
- **Bilingual Interface**: English and Marathi
- **Dynamic Language Switching**: Real-time text translation
- **Accessibility**: Text-to-speech functionality for Marathi content
- **Font Optimization**: Inter (English) and Noto Serif Devanagari (Marathi)

### 👨‍🌾 Farmer Portal
- **Equipment Browsing**: View available equipment with filters
- **Advanced Search**: Filter by region, category, and keywords
- **Booking System**: Easy equipment rental with day selection
- **Real-time Updates**: Live equipment availability status

### 🏪 Seller Portal
- **Equipment Management**: Add, edit, and manage equipment listings
- **Image Upload**: Support for equipment photos
- **Pricing Control**: Set daily rental rates
- **Status Tracking**: Monitor approval status of listings

### 👨‍💼 Admin Portal
- **Listing Approval**: Review and approve/decline equipment listings
- **Content Management**: Edit and delete listings
- **User Management**: Monitor platform activity
- **Quality Control**: Ensure platform standards

### 🤖 AI-Powered Features
- **Smart Recommendations**: AI-driven equipment suggestions
- **Multi-Agent System**: Collaborative AI agents for analysis
- **Crop-Specific Advice**: Tailored recommendations based on crop type
- **Regional Optimization**: Location-based equipment matching

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **EJS** - Template engine
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Client-side functionality
- **Web Speech API** - Text-to-speech functionality
- **Lucide Icons** - Modern icon library

### AI & ML
- **Python 3.8+** - AI backend
- **Streamlit** - Web application framework
- **LangChain** - AI framework
- **Google Generative AI** - AI model integration
- **CrewAI** - Multi-agent system

### Development Tools
- **Nodemon** - Development server
- **Git** - Version control
- **npm** - Package management

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Python 3.8+
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/FarmChain.git
cd FarmChain
```

### Step 2: Install Node.js Dependencies
```bash
cd webapp
npm install
```

### Step 3: Install Python Dependencies
```bash
cd ..
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the webapp directory:
```env
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/farmrent
```

Create a `.env` file in the root directory for AI features:
```env
GOOGLE_API_KEY=your-google-api-key-here
```

### Step 5: Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongodb

# Windows
# Start MongoDB service from Control Panel
```

## 💻 Usage

### Running the Main Web Application
```bash
cd webapp
npm run dev
```
Access at: http://localhost:3000

### Running the AI Recommender
```bash
streamlit run app.py
```
Access at: http://localhost:8501

### Default Admin Credentials
- **Email**: alishaikhh15@gmail.com
- **Password**: 123

## 🔌 API Documentation

### Authentication Endpoints
```
POST /auth/login/:role     - User login (farmer/seller/admin)
POST /auth/signup/:role    - User registration (farmer/seller)
GET  /auth/logout          - User logout
```

### Farmer Endpoints
```
GET  /farmer              - Farmer dashboard
POST /farmer/book/:id     - Book equipment
```

### Seller Endpoints
```
GET  /seller              - Seller dashboard
POST /seller/add          - Add new equipment listing
```

### Admin Endpoints
```
GET  /admin               - Admin dashboard
POST /admin/approve/:id   - Approve listing
POST /admin/decline/:id   - Decline listing
POST /admin/delete/:id    - Delete listing
```

## 🤖 AI Features

### Equipment Recommendation System
The AI system uses multiple agents to provide intelligent equipment recommendations:

1. **Crop Analysis Agent**: Analyzes crop requirements and growth patterns
2. **Soil Analysis Agent**: Evaluates soil type and conditions
3. **Regional Agent**: Considers local farming practices and climate
4. **Equipment Agent**: Matches equipment to specific needs
5. **Coordinator Agent**: Synthesizes recommendations from all agents

### Input Parameters
- **Crop Type**: Wheat, Rice, Sugarcane, Maize, Cotton, Millet, Pulses
- **Soil Type**: Loamy, Clayey, Sandy, Alluvial, Black
- **Season**: Rabi, Kharif
- **Region**: Multiple Indian states

### Output
- **Personalized Recommendations**: Tailored equipment suggestions
- **Detailed Analysis**: Comprehensive reasoning for recommendations
- **Cost Optimization**: Budget-friendly equipment options

## 📱 Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Farmer Portal
![Farmer Portal](screenshots/farmer.png)

### Seller Portal
![Seller Portal](screenshots/seller.png)

### Admin Portal
![Admin Portal](screenshots/admin.png)

### AI Recommender
![AI Recommender](screenshots/ai-recommender.png)

## 🌍 Language Support

### English Interface
- Clean, professional design
- International accessibility
- Standard web fonts

### Marathi Interface
- Native language support
- Text-to-speech functionality
- Devanagari script optimization
- Cultural context awareness

### Language Switching
- Real-time language switching
- Persistent language preferences
- Seamless user experience

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Secure image upload handling
- **CORS Protection**: Cross-origin resource sharing protection
- **Session Management**: Secure session handling

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (farmer/seller/admin),
  createdAt: Date
}
```

### Listing Model
```javascript
{
  name: String,
  category: String,
  region: String,
  pricePerDay: Number,
  sellerName: String,
  img: String,
  status: String (pending/approved/declined),
  createdAt: Date
}
```

## 🚀 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
heroku create your-farmchain-app
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel
vercel
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ali Shaikh** - Full Stack Developer & AI Integration
- **Contributors** - Open source contributors

## 📞 Support

- **Email**: support@farmchain.com
- **Documentation**: [Wiki](https://github.com/yourusername/FarmChain/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/FarmChain/issues)

## 🙏 Acknowledgments

- **MongoDB** for database solutions
- **Tailwind CSS** for styling framework
- **Google AI** for AI capabilities
- **Open Source Community** for various libraries and tools

---

<div align="center">
  <p>Made with ❤️ for the farming community</p>
  <p>🌾 Empowering Agriculture Through Technology 🌾</p>
</div>
