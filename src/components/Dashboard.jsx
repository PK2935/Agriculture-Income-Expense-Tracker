import React, { useState, useEffect } from 'react';
import { auth, db, getDoc, doc } from '../fb/firebase';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [supplyItems, setSupplyItems] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadInitialData(user.uid);
      } else {
        setUserId(null);
        setTotalIncome(0);
        setTotalExpense(0);
        setNetBalance(0);
        setTransactionHistory([]);
        setSupplyItems([]);
      }
    });

    return unsubscribe;
  }, []);

  const loadInitialData = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.income) {
          setTotalIncome(userData.income.totalIncome || 0);
        }
        if (userData.expense) {
          setTotalExpense(userData.expense.totalExpense || 0);
        }
        setNetBalance(userData.income.totalIncome - userData.expense.totalExpense);
        setTransactionHistory(userData.transactions || []);
        setSupplyItems(userData.supplyInventory.items || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-row">
        <div className="dashboard-box">
          <h3>Total Income Amount</h3>
          <p>₹ {totalIncome}</p>
        </div>
        <div className="dashboard-box">
          <h3>Total Expense Amount</h3>
          <p>₹ {totalExpense}</p>
        </div>
        <div className="dashboard-box">
          <h3>Net Balance</h3>
          <p>₹ {netBalance}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-box">
          <h3>Transaction History</h3>
          <ul>
            {transactionHistory.map((transaction, index) => (
              <li key={index}>
                <strong>{transaction.transactionType}</strong> - {transaction.source} - {transaction.description} - {transaction.amount} - {transaction.date}
              </li>
            ))}
          </ul>
        </div>
        <div className="dashboard-box">
          <h3>Supply Items</h3>
          <ul>
            {supplyItems.map((item, index) => (
              <li key={index}>
                <span>{item.itemName}</span> - <span>Quantity: {item.quantity}</span> - <span>Unit Price: {item.unitPrice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
