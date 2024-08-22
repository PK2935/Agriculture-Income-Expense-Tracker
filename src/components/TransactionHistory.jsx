// TransactionHistory.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../fb/firebase';

const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const history = userData.transactions || [];
          setTransactionHistory(history);
        }
      }
    };

    fetchTransactionHistory();
  }, []);

  return (
    <div className="transaction-history-page">
      <h2>Transaction History</h2>
      <ul>
        {transactionHistory.map((transaction, index) => (
          <li key={index}>
            <strong>{transaction.transactionType}</strong> - {transaction.source} - {transaction.description} - {transaction.amount} - {transaction.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;