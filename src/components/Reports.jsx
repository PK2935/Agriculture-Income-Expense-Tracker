import React, { useState } from 'react';
import IncomeReport from './IncomeReport';
import ExpenseReport from './ExpenseReport';
import InventoryReport from './InventoryReport';
import '../styles/Reports.css'; // Import the updated CSS file

const ReportRenderer = ({ activeReport }) => {
  switch (activeReport) {
    case 'income':
      return <IncomeReport />;
    case 'expense':
      return <ExpenseReport />;
    case 'inventory':
      return <InventoryReport />;
    default:
      return null;
  }
};

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);

  return (
    <div className="report-container">
      <div className="report-header">
        <div>
          <button
            className={activeReport === 'income' ? 'active' : null}
            onClick={() => setActiveReport('income')}
          >
            Income Report
          </button>
          <button
            className={activeReport === 'expense' ? 'active' : null}
            onClick={() => setActiveReport('expense')}
          >
            Expense Report
          </button>
          <button
            className={activeReport === 'inventory' ? 'active' : null}
            onClick={() => setActiveReport('inventory')}
          >
            Inventory Report
          </button>
        </div>
      </div>
      <ReportRenderer activeReport={activeReport} />
    </div>
  );
};

export default Reports;
