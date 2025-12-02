# Quick Start Guide - POS Application

## 🎯 Overview
This is a web-based POS (Point of Sale) application with:
- **Backend**: Java Spring Boot (runs on port 8080)
- **Frontend**: React + TypeScript (runs on port 3000)
- **Storage**: In-memory (no database needed)

## 🚀 Quick Start (3 Easy Steps)

### Step 1: Install Prerequisites
You need these installed on your computer:

1. **Java 17+** - [Download here](https://adoptium.net/)
2. **Maven** - [Download here](https://maven.apache.org/download.cgi)
3. **Node.js** - [Download here](https://nodejs.org/)

To verify installations, open Command Prompt and run:
```bash
java -version
mvn -version
node -version
```

### Step 2: Start the Application
**Double-click** the `start-pos.bat` file in the project root directory.

This will:
- Open 2 command windows (Backend & Frontend)
- Start both services automatically
- Take 1-2 minutes on first run

### Step 3: Access the Application
Open your web browser and go to:
```
http://localhost:3000
```

## ✅ What's Working

✓ All features from the original Python version
✓ Table management (Dine-in)
✓ Takeaway orders
✓ Menu item CRUD operations
✓ Categories and Departments management
✓ Invoice generation and tracking
✓ KOT number generation
✓ Excel import/export for menu data
✓ Restaurant settings configuration

## 🔄 Key Changes Made

### From Python to Java
- ✅ Replaced Flask → Spring Boot
- ✅ Removed PostgreSQL → In-memory storage (HashMap/ArrayList)
- ✅ Kept all REST API endpoints compatible
- ✅ All business logic preserved

### From Desktop to Web
- ✅ Removed Electron dependencies
- ✅ Pure web application (runs in browser)
- ✅ Can be accessed from any device on the network
- ✅ No installation needed on client devices

## 📁 New Structure

```
POS_Render/
├── backend-java/          ← NEW: Java Spring Boot backend
│   ├── src/main/java/com/pos/
│   │   ├── controller/    ← REST API endpoints
│   │   ├── model/         ← Data models
│   │   ├── service/       ← Business logic & storage
│   │   └── config/        ← CORS & configuration
│   ├── pom.xml            ← Maven dependencies
│   └── ...
│
├── frontend/              ← UPDATED: React web app (Electron removed)
│   ├── src/
│   │   └── services/api.ts  (Updated to point to :8080)
│   ├── package.json       ← Electron dependencies removed
│   └── ...
│
├── start-pos.bat          ← NEW: One-click startup
├── start-backend.bat      ← NEW: Backend only
├── start-frontend.bat     ← NEW: Frontend only
└── PROJECT_README.md      ← NEW: Full documentation
```

## 💡 Usage Tips

### Starting/Stopping

**To Start:**
- Double-click `start-pos.bat`

**To Stop:**
- Press `Ctrl+C` in each command window
- Or simply close the windows

### Data Persistence

⚠️ **Important**: All data is stored in-memory and will be lost when you stop the backend.

**To preserve data:**
1. Go to Menu page → Export to Excel
2. Save the file
3. After restart → Import from Excel

### Accessing from Other Devices

To use from tablets, phones, or other computers:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On other devices, open browser:
   ```
   http://192.168.1.100:3000
   ```

## 🐛 Common Issues

**"Maven not found"**
- Install Maven and add to PATH
- Restart Command Prompt after installation

**"Port already in use"**
- Close any application using port 8080 or 3000
- Or change ports in configuration files

**"Cannot connect to backend"**
- Ensure backend window shows "Started PosApplication"
- Check http://localhost:8080 shows health check

## 📞 Support

Check the full documentation in `PROJECT_README.md` for:
- Detailed API documentation
- Configuration options
- Advanced troubleshooting
- Technology stack details

---

**Ready to use! Enjoy your Java-based POS system! 🎉**
