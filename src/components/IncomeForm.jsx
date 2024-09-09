import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "../styles/IncomeForm.css";
import { auth, db, doc, getDoc, updateDoc } from "../fb/firebase.js";
import { v4 as uuidv4 } from "uuid";

// state variables to manage form inputs
const IncomeForm = () => {
  const [incomeTitle, setIncomeTitle] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [entries, setEntries] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [userId, setUserId] = useState(null);

  // total income of all submitted entries
  const calculateTotalIncome = useCallback(() => {
    const total = entries.reduce((acc, entry) => acc + Number(entry.amount), 0);
    setTotalIncome(total);
  }, [entries]);

  // if user logged in then it sets the user id and loads the data from firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        loadInitialData(user.uid);
      } else {
        setUserId(null);
        setIncomeTitle("");
        setIncomeAmount("");
        setIncomeSource("");
        setEntries([]);
        setTotalIncome(0);
      }
    });

    return unsubscribe;
  }, []);

  const loadInitialData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.income) {
          setIncomeTitle(userData.income.incomeTitle || "");
          setIncomeAmount(userData.income.incomeAmount || "");
          setIncomeSource(userData.income.incomeSource || "");
          setEntries(userData.income.entries || []);
          setTotalIncome(userData.income.totalIncome || 0);
        } else {
          setEntries([]);
          setIncomeTitle("");
          setIncomeAmount("");
          setIncomeSource("");
          setTotalIncome(0);
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: uuidv4(),
        title: "",
        source: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveEntry = async (index) => {
    const entryToRemove = entries[index];

    if (userId && entryToRemove.id) {
      try {
        // Find the entry in the Firestore data and delete it
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const entryIndex = userData.income.entries.findIndex(
            (entry) => entry.id === entryToRemove.id
          );
          if (entryIndex !== -1) {
            const updatedEntries = [...userData.income.entries];
            updatedEntries.splice(entryIndex, 1);
            await updateDoc(userRef, {
              "income.entries": updatedEntries,
              "income.totalIncome":
                userData.income.totalIncome - Number(entryToRemove.amount),
            });
          }
        }

        // Remove the entry from the local state
        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);

        // Update the total income amount
        const updatedTotalIncome = totalIncome - Number(entryToRemove.amount);
        setTotalIncome(updatedTotalIncome);

        alert("Entry deleted successfully!");
      } catch (error) {
        alert("Error deleting entry from Firestore:", error);
        alert("Error deleting entry");
      }
    } else {
      const updatedEntries = entries.filter((_, i) => i !== index);
      setEntries(updatedEntries);

      // Update the total income amount
      const updatedTotalIncome = totalIncome - Number(entryToRemove.amount);
      setTotalIncome(updatedTotalIncome);
    }
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEntries = [...entries];
    updatedEntries[index][name] = value;
    setEntries(updatedEntries);
    calculateTotalIncome();
  };

  const handleSubmit = async () => {
    if (userId) {
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          "income.incomeTitle": incomeTitle,
          "income.incomeAmount": incomeAmount,
          "income.incomeSource": incomeSource,
          "income.totalIncome": totalIncome,
          "income.entries": entries,
        });
        alert("Income data submitted successfully!");
      } catch (error) {
        console.error("Error submitting income data:", error);
        alert("Error submitting income data");
      }
    }
  };
  return (
    <form className="income-form">
      <div>
        <label className="total-income">Total Income: ₹ {totalIncome}</label>
      </div>
      <div className="entries-container">
        {entries.map((entry, index) => (
          <div key={index} className="form-entry">
            <label>Entry {index + 1}:</label>
            <input
              type="text"
              name="title"
              value={entry.title}
              onChange={(e) => handleInputChange(index, e)}
              placeholder="Title"
            />
            <input
              type="text"
              name="source"
              value={entry.source}
              onChange={(e) => handleInputChange(index, e)}
              placeholder="Source"
            />
            <input
              type="number"
              name="amount"
              value={entry.amount}
              onChange={(e) => handleInputChange(index, e)}
              placeholder="Income Amount"
            />
            <input
              type="date"
              name="date"
              value={entry.date}
              onChange={(e) => handleInputChange(index, e)}
            />
            <button
              className="remove-btn"
              onClick={(e) => {
                e.preventDefault();
                handleRemoveEntry(index);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button className="add-btn" type="button" onClick={handleAddEntry}>
        Add Entry
      </button>
      <button className="submit-btn" type="button" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
};

export default IncomeForm;
