# POS Application - Java Web Version

A Point of Sale (POS) web application built with **Java Spring Boot** backend and **React** frontend. This version uses **in-memory storage** (no database required) and runs entirely on your local machine.

## 🚀 Features

- **No Database Required**: All data stored in-memory (resets on restart)
- **Web Application**: Access from any browser on your network
- **Full POS Functionality**: 
  - Table management for dine-in orders
  - Takeaway order processing
  - Menu item management
  - Category & Department organization
  - Invoice generation and tracking
  - KOT (Kitchen Order Ticket) printing support
  - Excel import/export for menu data
  - Restaurant settings configuration

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

### 1. Java Development Kit (JDK) 17 or higher
- **Download**: [https://adoptium.net/](https://adoptium.net/)
- **Verify installation**: Open Command Prompt and run:
  ```bash
  java -version
  ```

### 2. Apache Maven
- **Download**: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
- **Verify installation**: Open Command Prompt and run:
  ```bash
  mvn -version
  ```

### 3. Node.js and npm
- **Download**: [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
- **Verify installation**: Open Command Prompt and run:
  ```bash
  node -version
  npm -version
  ```

## 🛠️ Installation & Setup

### Option 1: Quick Start (Recommended)

1. **Double-click** `start-pos.bat` in the project root directory
2. Two command windows will open (Backend and Frontend)
3. Wait for both to start (may take 1-2 minutes on first run)
4. Open your browser and go to: **http://localhost:3000**

### Option 2: Manual Start

#### Start Backend (Terminal 1):
```bash
# Navigate to project root
cd backend-java

# Run Spring Boot application
mvn spring-boot:run
```
Backend will be available at: **http://localhost:8080**

#### Start Frontend (Terminal 2):
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```
Frontend will be available at: **http://localhost:3000**

## 🌐 Accessing the Application

Once both services are running:

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. Default login: Use any credentials (authentication is disabled in this version)

### Access from Other Devices on Same Network

To access from other devices (tablets, phones, etc.) on the same network:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On other devices, open browser and go to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

## 📂 Project Structure

```
POS_Render/
├── backend-java/              # Java Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/pos/
│   │       │   ├── controller/    # REST API Controllers
│   │       │   ├── model/         # Data Models
│   │       │   ├── service/       # Business Logic
│   │       │   └── config/        # Configuration
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml                # Maven dependencies
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # React Components
│   │   ├── services/          # API Services
│   │   └── styles/            # CSS Styles
│   └── package.json           # npm dependencies
│
├── start-pos.bat              # Start both services
├── start-backend.bat          # Start backend only
└── start-frontend.bat         # Start frontend only
```

## 🔧 Configuration

### Backend Configuration

Edit `backend-java/src/main/resources/application.properties`:

```properties
# Change server port (default: 8080)
server.port=8080

# Add more CORS origins if needed
cors.allowed.origins=http://localhost:3000,http://localhost:5173
```

### Frontend Configuration

Edit `frontend/src/services/api.ts`:

```typescript
// Change backend URL if needed
const API_BASE_URL = 'http://localhost:8080/api';
```

## 💾 Data Persistence

**Important**: This application uses **in-memory storage**. All data will be **lost when you stop the backend server**.

To preserve data between sessions, you can:
1. Export menu data to Excel before stopping
2. Import the Excel file after restarting

## 📊 Sample Data

The application comes with pre-loaded sample data:
- 4 Categories (Appetizers, Mains, Desserts, Beverages)
- 2 Departments (Kitchen, Bar)
- 3 Sample menu items
- 3 Sample tables

## 🛑 Stopping the Application

1. In each Command Prompt window, press `Ctrl + C`
2. Confirm by pressing `Y` when asked
3. Close the windows

## 🐛 Troubleshooting

### Backend won't start

**Issue**: "Maven not found"
- **Solution**: Install Maven and add it to your PATH

**Issue**: "Java version error"
- **Solution**: Ensure Java 17 or higher is installed

**Issue**: "Port 8080 already in use"
- **Solution**: Stop other applications using port 8080, or change the port in `application.properties`

### Frontend won't start

**Issue**: "npm not found"
- **Solution**: Install Node.js from nodejs.org

**Issue**: "Port 3000 already in use"
- **Solution**: Kill the process using port 3000 or change the port in `vite.config.ts`

**Issue**: "API connection failed"
- **Solution**: Ensure backend is running on http://localhost:8080

## 📝 API Endpoints

Backend provides REST API at `http://localhost:8080/api`:

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/table/{tableId}` - Get order for specific table
- `POST /api/orders/table/{tableId}` - Add items to table
- `POST /api/orders/table/{tableId}/sent` - Mark items as sent to kitchen
- `POST /api/orders/table/{tableId}/complete` - Complete order

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/{id}` - Update menu item
- `DELETE /api/menu-items/{id}` - Delete menu item

### And more...

## 📚 Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2.0
- Apache POI (Excel operations)
- Maven

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the console output for error messages
3. Ensure all prerequisites are properly installed

## 📄 License

This project is for educational and demonstration purposes.

---

**Enjoy your POS Application! 🎉**
