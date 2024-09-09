import React, { useState, useEffect } from "react";
import { auth, db } from "../fb/firebase";
import { updateDoc, arrayUnion, getDoc, doc } from "../fb/firebase";
import "../styles/TransactionForm.css";

const TransactionForm = () => {
  const [transactionType, setTransactionType] = useState("Income");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRef, setUserRef] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isDateValid, setIsDateValid] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIncomeTypes(userData.income.entries.map((entry) => entry.source));
          setExpenseTypes(userData.expense.entries.map((entry) => entry.type));
          setUserRef(doc(db, "users", user.uid));
          const transactionHistory = userData.transactions || [];
          setTransactionHistory(transactionHistory);
        }
      } else {
        setUserId(null);
        setIncomeTypes([]);
        setExpenseTypes([]);
        setUserRef(null);
      }
    };

    fetchData();
  }, []);

  const handleTransactionTypeChange = (event) => {
    setTransactionType(event.target.value);
    if (event.target.value === "Income") {
      setSource(incomeTypes[0]);
    } else {
      setSource(expenseTypes[0]);
    }
  };

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    const currentDate = new Date();
    setIsDateValid(selectedDate.toDateString() === currentDate.toDateString());
    setDate(event.target.value);
  };

  const handleSubmit = async () => {
    if (userId && isDateValid) {
      try {
        const transaction = {
          transactionType,
          source,
          description,
          amount: parseFloat(amount),
          date,
        };
        await updateDoc(userRef, {
          transactions: arrayUnion({ ...transaction }),
        });
        setTransactionHistory([...transactionHistory, transaction]);
        alert("Transaction submitted successfully!");
      } catch (error) {
        alert("Error submitting transaction:", error);
      }
    } else if (!isDateValid) {
      alert("Please select the current date for the transaction.");
    }
  };

  const handleAddTransaction = () => {
    setTransactionType("Income");
    setSource("");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setIsDateValid(true);
  };

  return (
    <div className="transaction-container">
      <div className="transaction-form">
        <h2>Transaction Form</h2>
        <label>Transaction Type:</label>
        <select value={transactionType} onChange={handleTransactionTypeChange}>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        {transactionType === "Income" && (
          <>
            <label>Source:</label>
            <select value={source} onChange={handleSourceChange}>
              {incomeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </>
        )}
        {transactionType === "Expense" && (
          <>
            <label>Type:</label>
            <select value={source} onChange={handleSourceChange}>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </>
        )}
        <label>Description:</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter more about the transaction"
        />
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Transaction Amount"
        />
        <label>Date:</label>
        <input type="date" value={date} onChange={handleDateChange} />
        {!isDateValid && (
          <p style={{ color: "red" }}>
            Please select the current date for the transaction.
          </p>
        )}
        <button type="button" onClick={handleSubmit}>
          Submit Transaction
        </button>
        <button type="button" onClick={handleAddTransaction}>
          Add Transaction
        </button>
      </div>

      <div className="transaction-history">
        <h3>Transaction History</h3>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              <strong>{transaction.transactionType}</strong> -{" "}
              {transaction.source} - {transaction.description} -{" "}
              {transaction.amount} - {transaction.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionForm;
