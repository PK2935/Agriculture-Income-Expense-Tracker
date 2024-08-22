import React, { useState } from 'react';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import TransactionForm from './TransactionForm';
import SupplyForm from './SupplyForm';
import Reports from './Reports';
import Dashboard from './Dashboard';
import '../styles/FormDisplay.css'; // Import CSS file for styling

const FormDisplay = ({ selectedForm }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const handleIncomeSubmit = (incomeData) => {
    console.log('Income data submitted:', incomeData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

  const handleExpenseSubmit = (expenseData) => {
    console.log('Expense data submitted:', expenseData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

  const handleTransactionSubmit = (transactionData) => {
    console.log('Transaction data submitted:', transactionData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

  const handleSupplySubmit = (supplyData) => {
    console.log('Supply data submitted:', supplyData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

  if (selectedForm === 'Reports') {
    return <Reports />;
  } else if (selectedForm === 'Dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="form-display-container">
      <div className="form-container">
        {selectedForm === 'income' && <IncomeForm onSubmit={handleIncomeSubmit} />}
        {selectedForm === 'expense' && <ExpenseForm onSubmit={handleExpenseSubmit} />}
        {selectedForm === 'transaction' && <TransactionForm onSubmit={handleTransactionSubmit} />}
        {selectedForm === 'supply' && <SupplyForm onSubmit={handleSupplySubmit} />}
      </div>
      {selectedForm === 'Reports' && (
        <div className="reports-container">
          <Reports />
        </div>
      )}
      {formSubmitted && (
        <div className={`form-message ${submissionError ? 'error-message' : 'success-message'} show`}>
          {submissionError ? 'An error occurred. Please try again.' : 'Form submitted successfully!'}
        </div>
      )}
    </div>
  );
};

export default FormDisplay;