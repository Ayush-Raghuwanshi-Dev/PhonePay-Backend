// import the necessary modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import swaggerUi from 'swagger-ui-express';
import authRoutes from './src/routes/authRoutes.js';
import connectDB from './src/config/db.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import fs from 'fs';

let swaggerDocument = {};
try {
  const swaggerData = fs.readFileSync('./swagger-Output.json', 'utf8');
  swaggerDocument = JSON.parse(swaggerData);
} catch (error) {
  console.error("Failed to load Swagger documentation:", error.message);
}

// load environment variables from .env file
dotenv.config();

// Custom Middlewares
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';


// create an instance of the express application
const app = express();

// middleware to parse JSON requests
app.use(express.json());
// middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));
// enable CORS for all routes
app.use(cors());

// Apply rate limiting to all requests under /api
app.use('/api', apiLimiter);

// connect to the database
connectDB();

app.get('/', (req, res) => {
  res.send('PhonePe Backend System is running!');
});

// use the auth routes for any requests to /api/auth
app.use('/api/auth', authRoutes);
// Transaction routes
app.use('/api/transactions', transactionRoutes);
// wallet routes
app.use('/api/wallet', walletRoutes);

// create PORT variable and start the server
const PORT = process.env.PORT || 3000;

// use Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Top level error handling
app.use(notFound);
app.use(errorHandler);

// listen function to start the server and log a message to the console when the server is running
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});