# POS Application - Java Web Version 🎯

> A full-stack Point of Sale web application built with **Java Spring Boot** and **React**. Perfect for hands-on project demonstrations!

[![Java](https://img.shields.io/badge/Java-17-orange)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## ⚡ Quick Start

### Prerequisites
- Java 17+ ([Download](https://adoptium.net/))
- Maven ([Download](https://maven.apache.org/download.cgi))
- Node.js ([Download](https://nodejs.org/))

### Start Application
```bash
# Option 1: One-click start (Windows)
Double-click: start-pos.bat

# Option 2: Manual start
# Terminal 1
cd backend-java
mvn spring-boot:run

# Terminal 2
cd frontend
npm install
npm run dev
```

### Access
Open browser → **http://localhost:3000**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | 3-step quick start guide |
| **[PROJECT_README.md](PROJECT_README.md)** | Complete documentation |
| **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** | Installation checklist |
| **[CONVERSION_SUMMARY.md](CONVERSION_SUMMARY.md)** | What was converted |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture & diagrams |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues & solutions |

---

## ✨ Features

- ✅ **No Database Required** - In-memory storage
- ✅ **Web-Based** - Access from any browser
- ✅ **Full POS Functionality** - Tables, orders, invoices
- ✅ **Menu Management** - Categories, departments, items
- ✅ **Excel Import/Export** - Bulk operations
- ✅ **KOT Printing** - Kitchen order tickets
- ✅ **Restaurant Settings** - Configurable
- ✅ **Multi-Device Access** - Network-wide access

---

## 🏗️ Architecture

```
Frontend (React)          Backend (Java)          Storage
Port 3000        →    Port 8080        →    In-Memory
                      REST API              HashMap/ArrayList
```

**Tech Stack:**
- Backend: Java 17, Spring Boot 3.2, Maven, Apache POI
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Storage: In-memory (no database)

---

## 📂 Project Structure

```
POS_Render/
├── backend-java/          # Java Spring Boot Backend
│   ├── src/main/java/com/pos/
│   │   ├── controller/    # REST API Controllers
│   │   ├── model/         # Data Models  
│   │   ├── service/       # Business Logic
│   │   └── config/        # Configuration
│   └── pom.xml           # Maven Dependencies
│
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/   # React Components
│   │   └── services/     # API Client
│   └── package.json     # npm Dependencies
│
├── start-pos.bat        # One-click startup
└── *.md                 # Documentation
```

---

## 🚀 Key Highlights

### Converted from Python to Java
- ✅ Flask → Spring Boot
- ✅ PostgreSQL → In-Memory Storage
- ✅ All features preserved
- ✅ API compatibility maintained

### Changed from Desktop to Web
- ✅ Electron → Browser-based
- ✅ Local-only → Network accessible
- ✅ Installation required → Zero install
- ✅ Single device → Multi-device

---

## 💡 Perfect For

- 🎓 Learning full-stack development
- 📊 Portfolio projects
- 🎯 Project demonstrations
- 🧪 Hands-on practice
- 🚀 Quick prototyping

---

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+View)

### Dine-In Orders
![Dine-In](https://via.placeholder.com/800x400?text=Dine-In+Orders)

### Menu Management
![Menu](https://via.placeholder.com/800x400?text=Menu+Management)

</details>

---

## 🎯 What Makes This Special?

### ✅ No Database Setup
- No PostgreSQL installation
- No database configuration
- No connection strings
- Just run and go!

### ✅ Easy to Demo
- Works immediately
- No complex setup
- Perfect for presentations
- Portable

### ✅ Clean Architecture
- Well-organized code
- RESTful API design
- Separation of concerns
- Easy to understand

### ✅ Production-Ready Pattern
- Professional structure
- Industry best practices
- Scalable design
- Easy to extend

---

## 📊 API Endpoints

<details>
<summary>View All Endpoints</summary>

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders/table/{id}` - Create/update order
- `POST /api/orders/table/{id}/complete` - Complete order

### Menu
- `GET /api/menu-items` - List menu items
- `POST /api/menu-items` - Create item
- `PUT /api/menu-items/{id}` - Update item
- `DELETE /api/menu-items/{id}` - Delete item

*Full API documentation in [PROJECT_README.md](PROJECT_README.md)*

</details>

---

## ⚙️ Configuration

### Backend
File: `backend-java/src/main/resources/application.properties`
```properties
server.port=8080
cors.allowed.origins=http://localhost:3000
```

### Frontend
File: `frontend/src/services/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Change port in config |
| Maven not found | Install & add to PATH |
| Cannot connect | Check backend is running |
| Data lost | Expected - export to Excel |

*Full troubleshooting in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)*

---

## 💾 Data Persistence

⚠️ **Important:** Data is stored in-memory and resets on restart.

**To preserve data:**
1. Export menu to Excel before stopping
2. Import Excel file after restarting

**For production:** Add database (PostgreSQL, MySQL, etc.)

---

## 🌐 Network Access

### Local Access
```
http://localhost:3000
```

### Network Access
```
1. Find IP: ipconfig
2. From other device: http://YOUR-IP:3000
```

---

## 🔒 Security Note

**Current:** No authentication (demo/learning purposes)

**For production, add:**
- Spring Security
- JWT authentication
- User roles
- HTTPS/TLS
- Input validation

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ REST API design
- ✅ Spring Boot backend
- ✅ React frontend
- ✅ TypeScript usage
- ✅ State management
- ✅ File operations (Excel)
- ✅ In-memory storage patterns
- ✅ CORS configuration
- ✅ Error handling

---

## 🤝 Contributing

This is a learning/demo project. Feel free to:
- Fork and experiment
- Add features
- Improve documentation
- Share feedback

---

## 📜 License

This project is for educational and demonstration purposes.

---

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [PROJECT_README.md](PROJECT_README.md)
3. Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

---

## 🎉 Ready to Start!

1. ✅ Install prerequisites (Java, Maven, Node.js)
2. ✅ Double-click `start-pos.bat`
3. ✅ Open http://localhost:3000
4. ✅ Start using your POS system!

---

<div align="center">

**Built with ❤️ for learning and demonstration**

[Report Bug](https://github.com) • [Request Feature](https://github.com) • [Documentation](PROJECT_README.md)

</div>

---

## ⭐ Quick Links

- [Quick Start Guide](QUICK_START.md) - Get started in 3 steps
- [Full Documentation](PROJECT_README.md) - Complete guide
- [Architecture](ARCHITECTURE.md) - System design & diagrams
- [Troubleshooting](TROUBLESHOOTING.md) - Fix common issues
- [Setup Checklist](SETUP_CHECKLIST.md) - Pre-flight checklist

---

**Happy Coding! 🚀**
