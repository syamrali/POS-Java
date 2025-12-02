# Setup Checklist - POS Application

Use this checklist to ensure everything is ready to run your POS application.

---

## ☑️ Prerequisites Installation

### 1. Java 17 or Higher
- [ ] Download from: https://adoptium.net/
- [ ] Run installer
- [ ] Add to PATH (usually done automatically)
- [ ] Verify: Open Command Prompt and run `java -version`
- [ ] Expected output: Should show version 17 or higher

### 2. Apache Maven
- [ ] Download from: https://maven.apache.org/download.cgi
- [ ] Extract to a folder (e.g., C:\Program Files\Apache\Maven)
- [ ] Add to PATH: 
  - Right-click "This PC" → Properties
  - Advanced System Settings → Environment Variables
  - Add Maven's `bin` folder to PATH
- [ ] Verify: Open **NEW** Command Prompt and run `mvn -version`
- [ ] Expected output: Should show Maven version

### 3. Node.js and npm
- [ ] Download from: https://nodejs.org/ (LTS version)
- [ ] Run installer
- [ ] Keep default settings
- [ ] Verify: Open Command Prompt and run:
  - `node -version` (should show v18 or higher)
  - `npm -version` (should show v9 or higher)

---

## ☑️ First-Time Setup

### Backend Setup
- [ ] Navigate to project folder
- [ ] Locate `backend-java` folder
- [ ] Verify `pom.xml` exists
- [ ] Optionally, run `mvn clean install` to download dependencies

### Frontend Setup
- [ ] Navigate to project folder
- [ ] Locate `frontend` folder
- [ ] Open Command Prompt in `frontend` folder
- [ ] Run `npm install` (will take 2-5 minutes)
- [ ] Wait for completion

---

## ☑️ Running the Application

### Quick Start Method
- [ ] Double-click `start-pos.bat` in project root
- [ ] Wait for two Command Prompt windows to open
- [ ] Backend window: Wait until you see "Started PosApplication"
- [ ] Frontend window: Wait until you see "Local: http://localhost:3000"
- [ ] Open browser and go to: http://localhost:3000

### Manual Start Method (Alternative)

**Backend:**
- [ ] Open Command Prompt
- [ ] Navigate to `backend-java` folder: `cd backend-java`
- [ ] Run: `mvn spring-boot:run`
- [ ] Wait until you see "Started PosApplication in X seconds"

**Frontend:**
- [ ] Open **another** Command Prompt
- [ ] Navigate to `frontend` folder: `cd frontend`
- [ ] Run: `npm run dev`
- [ ] Wait until you see "Local: http://localhost:3000"
- [ ] Open browser → http://localhost:3000

---

## ☑️ Verification

### Backend Health Check
- [ ] Backend is running (Command Prompt window open)
- [ ] Open browser and go to: http://localhost:8080
- [ ] Should see: JSON response with "status": "healthy"

### Frontend Access
- [ ] Frontend is running (Command Prompt window open)
- [ ] Open browser and go to: http://localhost:3000
- [ ] Should see: POS Login page

### Full Application Test
- [ ] Login with any credentials
- [ ] See Dashboard with sample data
- [ ] Navigate to Tables page
- [ ] See 3 sample tables
- [ ] Navigate to Menu page
- [ ] See 3 sample menu items
- [ ] All pages load without errors

---

## ☑️ Common Issues Resolution

### "Maven not found" Error
- [ ] Check Maven is installed: `mvn -version`
- [ ] If not found, ensure Maven `bin` folder is in PATH
- [ ] Restart Command Prompt after changing PATH
- [ ] Try again

### "Java version error"
- [ ] Check Java version: `java -version`
- [ ] Must be 17 or higher
- [ ] If lower, install Java 17+ from https://adoptium.net/
- [ ] Set JAVA_HOME environment variable if needed

### "Port 8080 already in use"
- [ ] Check if another application is using port 8080
- [ ] Stop that application, or
- [ ] Change backend port in `backend-java/src/main/resources/application.properties`

### "Port 3000 already in use"
- [ ] Check if another application is using port 3000
- [ ] Stop that application, or
- [ ] Change frontend port in `frontend/vite.config.ts`

### "npm install fails"
- [ ] Ensure you're in the `frontend` folder
- [ ] Try deleting `node_modules` folder and `package-lock.json`
- [ ] Run `npm install` again
- [ ] Check your internet connection

### "Cannot connect to backend"
- [ ] Ensure backend Command Prompt window is still open
- [ ] Check backend shows "Started PosApplication"
- [ ] Try accessing http://localhost:8080 directly
- [ ] Check Windows Firewall isn't blocking Java

---

## ☑️ Access from Other Devices (Optional)

### Setup Network Access
- [ ] Find your computer's IP address: `ipconfig`
- [ ] Look for "IPv4 Address" (e.g., 192.168.1.100)
- [ ] Ensure both backend and frontend are running
- [ ] On other device, open browser
- [ ] Go to: `http://YOUR-IP:3000` (replace YOUR-IP)

### Firewall Configuration (if needed)
- [ ] Open Windows Defender Firewall
- [ ] Allow Java through firewall (port 8080)
- [ ] Allow Node through firewall (port 3000)

---

## ☑️ Stopping the Application

- [ ] In Backend Command Prompt: Press `Ctrl + C`
- [ ] Confirm with `Y`
- [ ] In Frontend Command Prompt: Press `Ctrl + C`
- [ ] Confirm with `Y`
- [ ] Close both windows
- [ ] Data is now cleared (in-memory storage)

---

## ☑️ Data Management

### Before Stopping (to preserve data)
- [ ] Go to Menu page
- [ ] Click "Export to Excel"
- [ ] Save the file in a safe location

### After Restarting (to restore data)
- [ ] Go to Menu page
- [ ] Click "Import from Excel"
- [ ] Select your saved file
- [ ] Data restored!

---

## 📝 Notes

- All data is stored **in-memory** (resets on restart)
- Use Excel export/import to preserve data
- First run takes longer (downloading dependencies)
- Subsequent runs are faster

---

## ✅ Ready to Demo!

Once all checkboxes above are checked, your application is ready for:
- ✓ Development
- ✓ Testing
- ✓ Demonstration
- ✓ Project presentation

**Need help?** Check `PROJECT_README.md` for detailed documentation.

---

**Happy Coding! 🚀**
