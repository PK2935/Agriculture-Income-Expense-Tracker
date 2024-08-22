import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { auth, db } from '../fb/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import 'chart.js/auto';
import '../styles/Reports.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

const ExpenseReport = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeFromUserData = onSnapshot(userRef, (doc) => {
          const userData = doc.data();
          if (userData.expense && userData.expense.entries) {
            setExpenseData(userData.expense.entries);
          }
        });
        return () => unsubscribeFromUserData();
      } else {
        setUserId(null);
        setExpenseData([]);
      }
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (chartRef.current) {
      canvasRef.current = chartRef.current.canvas;
    }
  }, [chartRef]);

  const filterExpenseData = () => {
    return expenseData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() + 1 === parseInt(selectedMonth) &&
        entryDate.getFullYear() === parseInt(selectedYear)
      );
    });
  };

  const generateExpenseData = () => {
    const filteredData = filterExpenseData();
    const labels = filteredData.map((entry) => entry.type);
    const data = filteredData.map((entry) => entry.amount);
    return { labels, data };
  };

  const { labels, data } = generateExpenseData();
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1000,
        stepSize: 200,
      },
    },
  };

  const downloadPdf = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('expense-report.pdf');
      alert("PDF Generated 🎉");
    } else {
      console.error('Chart canvas not found');
    }
  };

  return (
    <div className="report-container">
      <div className="filter-container">
        <label>
          Month:
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {[...Array(12).keys()].map((month) => (
              <option key={month + 1} value={month + 1}>
                {format(new Date(0, month), 'MMMM')}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            min="2000"
            max={new Date().getFullYear()}
          />
        </label>
      </div>
      <Bar ref={chartRef} data={chartData} options={options} />
      <div className="download-buttons">
        <button onClick={downloadPdf}>Download PDF</button>
      </div>
    </div>
  );
};

export default ExpenseReport;
