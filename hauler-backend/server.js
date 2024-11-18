const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_51M23WVAZXbnAuaLLJktMTrL2oSSQKCpqvjDDHkAK1PaYlJMFtLevnKFM9qUTjl6PjS9O3F4jGv7LsX9Yp1XUcRbR00G8JLajvz');

require('dotenv').config();
const app = express();
const port = process.env.PORT || "3000";

var serviceAccount = require("./hauler-db-firebase-adminsdk-f30st-ab4446ec88.json");

// Connect to Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'hauler-db.firebaseapp.com'
});

const firestore = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Importing routes
const postRoutes = require('./routes/post-routes.js');
const serviceProvidersRoutes = require('./routes/serviceProvider-router.js');
const userRoutes = require('./routes/user-router.js');
const stripeRoutes = require('./routes/stripe-routes.js');

// Using routes
app.use('/api/posts', postRoutes);
app.use('/api/service-providers', serviceProvidersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});