import React, { useState, useEffect } from 'react';
import '../styles/ExpenseForm.css';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseApp, auth, db } from '../fb/firebase';

const ExpenseForm = () => {
  const [expenseHead, setExpenseHead] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadInitialData(user.uid);
      } else {
        setUserId(null);
        setExpenseHead('');
        setExpenses([]);
        setTotalExpense(0);
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
        if (userData.expense) {
          setExpenseHead(userData.expense.expenseHead || '');
          setExpenses(userData.expense.entries || []);
          setTotalExpense(userData.expense.totalExpense || 0);
        } else {
          setExpenses([]);
          setExpenseHead('');
          setTotalExpense(0);
        }
      }
    } catch (error) {
      alert('Error loading initial data:', error);
    }
  };

  const handleExpenseTypeChange = (event, index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].type = event.target.value;
    setExpenses(updatedExpenses);
  };

  const handleExpenseAmountChange = (event, index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].amount = parseFloat(event.target.value);
    setExpenses(updatedExpenses);
  };

  const handleExpenseDateChange = (event, index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].date = event.target.value;
    setExpenses(updatedExpenses);
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: expenses.length + 1,
      type: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleRemoveExpense = async (index) => {
    const expenseToRemove = expenses[index];

    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const expenseIndex = userData.expense.entries.findIndex(
            (expense) => expense.id === expenseToRemove.id
          );
          if (expenseIndex !== -1) {
            const updatedExpenses = [...userData.expense.entries];
            updatedExpenses.splice(expenseIndex, 1);
            await updateDoc(userRef, {
              'expense.entries': updatedExpenses,
              'expense.totalExpense': userData.expense.totalExpense - expenseToRemove.amount,
            });
          }
        }

        // Remove the expense from the local state
        const updatedExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(updatedExpenses);

        // Update the total expense amount
        const updatedTotalExpense = totalExpense - expenseToRemove.amount;
        setTotalExpense(updatedTotalExpense);
        alert("Expenses Removed Successfully !")
      } catch (error) {
        alert('Error deleting expense from Firestore:', error);
      }
    } else {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);

      // Update the total expense amount
      const updatedTotalExpense = totalExpense - expenses[index].amount;
      setTotalExpense(updatedTotalExpense);
    }
  };

  useEffect(() => {
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setTotalExpense(total);
  }, [expenses]);

  const handleSubmit = async () => {
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          'expense.expenseHead': expenseHead,
          'expense.totalExpense': totalExpense,
          'expense.entries': expenses,
        });
        alert('Expenses submitted successfully!');
      } catch (error) {
        alert('Error submitting expenses:', error);
      }
    }
  };

  return (
    <div className="expense-form">
      <h2>Expense Form</h2>
      <div className="total-expense">
        <label>Total Expense: ₹ {totalExpense}</label>
      </div>
      <div className="expense-entries">
        {expenses.map((expense, index) => (
          <div key={index} className="expense-entry">
            <label>Expense Type:</label>
            <select
              value={expense.type}
              onChange={(event) => handleExpenseTypeChange(event, index)}
            >
              <option value="Labor">Labor</option>
              <option value="Seeds">Seeds</option>
              <option value="Equipment">Equipment</option>
            </select>
            <label>Amount:</label>
            <input
              type="number"
              value={expense.amount}
              onChange={(event) => handleExpenseAmountChange(event, index)}
            />
            <label>Date:</label>
            <input
              type="date"
              value={expense.date}
              onChange={(event) => handleExpenseDateChange(event, index)}
            />
            <button
              type="button"
              onClick={() => handleRemoveExpense(index)}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddExpense} className="add-button">
        Add Expense
      </button>
      <button type="button" onClick={handleSubmit} className="submit-button">
        Submit Expenses
      </button>
    </div>
  );
};

export default ExpenseForm;