const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
// const { getAnalytics } = require('firebase/analytics');
const { getFirestore } = require('firebase/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your Firebase project configuration details
const firebaseConfig = {
  apiKey: "AIzaSyDsBUqCm-90utMyNEJTqjOQ8K8SRzbj8uI",
  authDomain: "agri-management-system.firebaseapp.com",
  databaseURL: "https://agri-management-system-default-rtdb.firebaseio.com",
  projectId: "agri-management-system",
  storageBucket: "agri-management-system.appspot.com",
  messagingSenderId: "688826818540",
  appId: "1:688826818540:web:707aaf4b3e0ad95fc6aac9",
  measurementId: "G-E0BQ9231ST"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);
const db = getFirestore();

// Define data models (replace with your specific structures)
const incomeHeadModel = {
  id: String,
  name: String,
  description: String, // Optional
};

const expenseHeadModel = {
  id: String,
  name: String,
  description: String, // Optional
};

const transactionModel = {
  id: String,
  date: Date,
  amount: Number,
  type: String, // "income" or "expense"
  incomeHeadId: String, // Optional for income transactions
  expenseHeadId: String, // Optional for expense transactions
  description: String, // Optional
};

const inventoryItemModel = {
  id: String,
  name: String,
  unit: String, // Optional (e.g., "kg", "pcs")
  quantity: Number,
  description: String, // Optional
};

// Routes

// Route to fetch all income heads
app.get('/api/income-heads', async (req, res) => {
  try {
    const incomeHeadsRef = db.collection('incomeHeads');
    const snapshot = await incomeHeadsRef.get();
    const incomeHeads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    res.json(incomeHeads);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching income heads');
  }
});

// Implement similar API endpoints for other models
// For example:

// Route to fetch all expense heads
app.get('/api/expense-heads', async (req, res) => {
  try {
    const expenseHeadsRef = db.collection('expenseHeads');
    const snapshot = await expenseHeadsRef.get();
    const expenseHeads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    res.json(expenseHeads);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching expense heads');
  }
});

// Route to create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = req.body;
    const transactionRef = await db.collection('transactions').add(newTransaction);
    res.json({ message: 'Transaction added successfully', id: transactionRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating transaction');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
