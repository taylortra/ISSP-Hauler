const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_51M23WVAZXbnAuaLLJktMTrL2oSSQKCpqvjDDHkAK1PaYlJMFtLevnKFM9qUTjl6PjS9O3F4jGv7LsX9Yp1XUcRbR00G8JLajvz');
const firestore = admin.firestore();

require('dotenv').config();
const app = express();
const port = process.env.PORT || "3000";

// do we have a service account key initialized somewhere?? 
// const serviceAccount = require(serviceAccountKey.json)

// Connect to Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'hauler-db.firebaseapp.com'
});

// Importing routes
const postRoutes = require('./routes/post-routes.js');
const serviceProvidersRoutes = require('./routes/serviceProvider-router.js');
const userRoutes = require('./routes/user-router.js');
const stripeRoutes = require('./routes/stripe-routes.js');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Defining API routes
app.use('/api/posts', postRoutes);
app.use('/api/service-providers', serviceProvidersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// Start the server
app.listen(port, () => {
  console.log(`App running successfully on port http://localhost:${port}`);
});
