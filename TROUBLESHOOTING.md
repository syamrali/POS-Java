# Troubleshooting Guide - POS Application

Common issues and their solutions for the Java-based POS application.

---

## 🔧 Backend Issues

### Issue: "mvn command not found"

**Problem:** Maven is not installed or not in PATH

**Solutions:**
1. Install Maven from https://maven.apache.org/download.cgi
2. Add Maven's `bin` folder to system PATH:
   - Windows: `C:\Program Files\Apache\Maven\bin`
   - Restart Command Prompt after changing PATH
3. Verify: `mvn -version`

---

### Issue: "Java version error" or "Java not found"

**Problem:** Java is not installed or wrong version

**Solutions:**
1. Check current version: `java -version`
2. Must be Java 17 or higher
3. Install from: https://adoptium.net/
4. Set JAVA_HOME environment variable:
   - Variable: `JAVA_HOME`
   - Value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`
5. Add to PATH: `%JAVA_HOME%\bin`
6. Restart Command Prompt

---

### Issue: "Port 8080 already in use"

**Problem:** Another application is using port 8080

**Solutions:**

**Option 1: Stop the other application**
```bash
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Option 2: Change backend port**
1. Open: `backend-java\src\main\resources\application.properties`
2. Change: `server.port=8080` to `server.port=8081`
3. Update frontend API URL in: `frontend\src\services\api.ts`
4. Change: `http://localhost:8080` to `http://localhost:8081`
5. Restart both services

---

### Issue: "Failed to execute goal... Could not find artifact"

**Problem:** Maven dependencies failed to download

**Solutions:**
1. Check internet connection
2. Delete Maven cache:
   ```bash
   rmdir /s /q %USERPROFILE%\.m2\repository
   ```
3. Run again: `mvn clean install`
4. If behind a proxy, configure Maven settings.xml

---

### Issue: Backend starts but shows errors

**Problem:** Code compilation errors

**Solutions:**
1. Check Java version is 17+
2. Clean and rebuild:
   ```bash
   mvn clean compile
   ```
3. Check for missing Lombok:
   - Ensure IDE has Lombok plugin
   - Restart IDE
4. Review console output for specific errors

---

### Issue: "Connection refused" when accessing http://localhost:8080

**Problem:** Backend not running or crashed

**Solutions:**
1. Check backend Command Prompt window is still open
2. Look for "Started PosApplication" message
3. If crashed, check error messages
4. Restart: `mvn spring-boot:run`
5. Check Windows Firewall isn't blocking Java
6. Try: `netstat -ano | findstr :8080` to verify port is listening

---

## 💻 Frontend Issues

### Issue: "npm command not found"

**Problem:** Node.js is not installed or not in PATH

**Solutions:**
1. Install Node.js from: https://nodejs.org/
2. Use LTS version (recommended)
3. Restart Command Prompt after installation
4. Verify: `node -version` and `npm -version`

---

### Issue: "npm install fails" or "Cannot find module"

**Problem:** Dependencies installation failed

**Solutions:**

**Clean Install:**
```bash
cd frontend

# Delete old files
rmdir /s /q node_modules
del package-lock.json

# Fresh install
npm install
```

**Check npm cache:**
```bash
npm cache clean --force
npm install
```

**Use different registry (if blocked):**
```bash
npm config set registry https://registry.npmjs.org/
npm install
```

---

### Issue: "Port 3000 already in use"

**Problem:** Another application is using port 3000

**Solutions:**

**Option 1: Kill the process**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Option 2: Use different port**
1. Edit: `frontend\vite.config.ts`
2. Change server port:
   ```typescript
   server: {
     port: 3001  // Changed from 3000
   }
   ```
3. Restart frontend

---

### Issue: "Failed to fetch" or "Network Error"

**Problem:** Frontend cannot connect to backend

**Solutions:**
1. **Check backend is running:**
   - Visit: http://localhost:8080
   - Should see: `{"status":"healthy"}`

2. **Check API URL in frontend:**
   - File: `frontend\src\services\api.ts`
   - Should be: `http://localhost:8080/api`

3. **Check CORS configuration:**
   - File: `backend-java\src\main\resources\application.properties`
   - Ensure frontend URL is in: `cors.allowed.origins`

4. **Disable browser extensions:**
   - Ad blockers may interfere
   - Try incognito mode

5. **Check Windows Firewall:**
   - Allow Java through firewall
   - Allow Node.js through firewall

---

### Issue: Blank page or "Cannot GET /"

**Problem:** Frontend build or routing issue

**Solutions:**
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + F5`
3. Check console for errors: `F12` → Console tab
4. Restart dev server: `npm run dev`
5. Check if Vite is properly running

---

### Issue: "Unexpected token" errors in console

**Problem:** TypeScript or build errors

**Solutions:**
1. Check Node.js version (should be 16+)
2. Delete `node_modules` and reinstall
3. Check `tsconfig.json` is correct
4. Restart dev server

---

## 🌐 Network/Access Issues

### Issue: Cannot access from other devices

**Problem:** Firewall or network configuration

**Solutions:**

1. **Find your IP address:**
   ```bash
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.100)

2. **Test backend access:**
   - From other device: http://YOUR-IP:8080
   - Should see health check response

3. **Test frontend access:**
   - From other device: http://YOUR-IP:3000
   - Should see POS interface

4. **Configure Windows Firewall:**
   - Open Windows Defender Firewall
   - Allow Java (port 8080)
   - Allow Node.js (port 3000)

5. **Check network:**
   - Both devices on same network?
   - Router not blocking ports?

---

### Issue: CORS errors in browser console

**Problem:** Cross-Origin Request Blocked

**Solutions:**
1. Check backend CORS config:
   - File: `application.properties`
   - Add frontend URL to: `cors.allowed.origins`
   
2. If accessing via IP:
   ```properties
   cors.allowed.origins=http://localhost:3000,http://192.168.1.100:3000
   ```

3. Restart backend after changes

---

## 📊 Data Issues

### Issue: Data disappears after restart

**Expected Behavior:** This is normal - in-memory storage

**Solutions:**
1. **Before stopping server:**
   - Go to Menu page
   - Click "Export to Excel"
   - Save file

2. **After restart:**
   - Go to Menu page
   - Click "Import from Excel"
   - Select saved file
   - Data restored

---

### Issue: Excel import fails

**Problem:** File format or data errors

**Solutions:**
1. **Use correct template:**
   - Download template from application
   - Don't modify headers
   - Keep sheet names: "Categories", "Departments", "Menu Items"

2. **Check file format:**
   - Must be .xlsx (not .xls or .csv)
   - Not corrupted

3. **Check data:**
   - Required fields filled
   - Product codes unique
   - Categories and departments exist first

4. **View errors:**
   - Check import response for specific errors
   - Fix data and retry

---

### Issue: Duplicate product code error

**Problem:** Product code already exists

**Solutions:**
1. Each menu item must have unique product code
2. Check existing items first
3. Use different product code
4. Or delete old item first

---

## 💾 Performance Issues

### Issue: Application is slow

**Solutions:**

**Backend:**
1. Check Java process CPU usage
2. Increase Java heap size:
   ```bash
   set MAVEN_OPTS=-Xmx1024m
   mvn spring-boot:run
   ```
3. Close other applications

**Frontend:**
1. Close unused browser tabs
2. Clear browser cache
3. Check for console errors
4. Disable browser extensions

**General:**
1. Restart both services
2. Restart computer if needed
3. Check antivirus isn't scanning files

---

### Issue: Excel export is slow

**Expected:** Large menus take longer (normal)

**Solutions:**
1. Be patient (1-5 seconds is normal)
2. Check data size (thousands of items take longer)
3. No way to speed up without code changes

---

## 🖥️ Development Issues

### Issue: Changes not reflecting

**Backend changes:**
```bash
# Stop server (Ctrl+C)
mvn clean compile
mvn spring-boot:run
```

**Frontend changes:**
- Vite hot-reloads automatically
- If not, restart: `npm run dev`
- Hard refresh browser: `Ctrl + F5`

---

### Issue: IDE errors but app runs fine

**Problem:** IDE not recognizing code

**Solutions:**

**For IntelliJ IDEA:**
1. File → Invalidate Caches → Restart
2. Enable Lombok plugin
3. Enable annotation processing

**For VS Code:**
1. Install Java Extension Pack
2. Install Lombok extension
3. Reload window

**For Eclipse:**
1. Install Lombok
2. Project → Clean
3. Maven → Update Project

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# In backend Command Prompt window
# Look for stack traces and error messages
# Red text usually indicates errors
```

### Check Frontend Console
```javascript
// Open browser DevTools (F12)
// Go to Console tab
// Look for red errors
// Check Network tab for failed requests
```

### Test API Directly
```bash
# Use browser or curl to test backend

# Health check
curl http://localhost:8080

# Get tables
curl http://localhost:8080/api/tables

# Get menu items
curl http://localhost:8080/api/menu-items
```

### Check Ports
```bash
# See what's using ports
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

---

## 🆘 Still Not Working?

### Last Resort Solutions

1. **Complete Reset:**
   ```bash
   # Stop both services
   # Delete and reinstall everything
   
   cd backend-java
   mvn clean
   
   cd ../frontend
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   
   # Start again
   ```

2. **Check System Requirements:**
   - Windows 10/11
   - 4GB+ RAM available
   - Java 17+ installed
   - Maven 3.6+ installed
   - Node.js 16+ installed

3. **Review Documentation:**
   - Read `PROJECT_README.md`
   - Check `SETUP_CHECKLIST.md`
   - Review `ARCHITECTURE.md`

4. **Check File Integrity:**
   - Ensure all files were created correctly
   - Compare with original source
   - Re-download if corrupted

---

## 📞 Getting Help

### Information to Provide

When asking for help, include:

1. **Error Message:**
   - Exact error text
   - Screenshot if possible

2. **Environment:**
   - Windows version
   - Java version: `java -version`
   - Maven version: `mvn -version`
   - Node version: `node -version`

3. **Steps to Reproduce:**
   - What you did
   - What you expected
   - What actually happened

4. **Logs:**
   - Backend console output
   - Frontend console output (F12)
   - Any error stack traces

---

**Most issues can be resolved by:**
1. ✅ Checking prerequisites are installed correctly
2. ✅ Restarting services
3. ✅ Clearing caches and reinstalling
4. ✅ Following error messages

**Good luck! 🚀**
