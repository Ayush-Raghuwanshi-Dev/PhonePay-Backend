# 🚀 PhonePay-Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

A robust backend API API for a digital wallet application engineered to facilitate seamless monetary transactions, comprehensive wallet management, and secure user authentication.

## ✨ Features

- 🔐 **User Authentication:** Secure user registration, login, and protected routes using JWT.
- 💳 **Wallet Management:** Create and manage user wallets easily.
- 💸 **Transactions:** Scalable APIs for peer-to-peer transfers, deposits, and detailed transaction history.
- 📖 **API Documentation:** Automated API documentation integrated with Swagger.

## 📂 Architecture & Structure

The codebase is organized based on the MVC (Model-View-Controller) architecture:
- `src/controllers/` - Request handlers for transactions, users, and wallets.
- `src/models/` - Mongoose database schemas.
- `src/routes/` - Express route definitions.
- `src/middleware/` - Custom middlewares like JWT protection.
- `src/config/` - Database connection and configurations.

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayush-Raghuwanshi-Dev/PhonePay-Backend.git
   ```

2. **Navigate into the directory:**
   ```bash
   cd PhonePay-Backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Add Environment Variables:**
   Create a `.env` file in the root directory and add the necessary variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Start the application:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

Once the server is running, you can explore the API endpoints and test them directly via the Swagger UI interface (typically accessible at `/api-docs` depending on your server configuration). 

## 📝 License

This project is licensed under the [MIT License](LICENSE).
