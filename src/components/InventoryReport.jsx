import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { auth, db } from '../fb/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import 'chart.js/auto';
import '../styles/Reports.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InventoryReport = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeFromUserData = onSnapshot(userRef, (doc) => {
          const userData = doc.data();
          if (userData.supplyInventory && userData.supplyInventory.items) {
            setInventoryData(userData.supplyInventory.items);
            setIsDataLoaded(true);
          }
        });
        return () => unsubscribeFromUserData();
      } else {
        setUserId(null);
        setInventoryData([]);
        setIsDataLoaded(false);
      }
    });
    return unsubscribe;
  }, [userId]);

  const generateInventoryData = () => {
    let filteredData = inventoryData;
    if (filterMonth) {
      filteredData = filteredData.filter(item => new Date(item.date).getMonth() + 1 === parseInt(filterMonth));
    }
    if (filterYear) {
      filteredData = filteredData.filter(item => new Date(item.date).getFullYear() === parseInt(filterYear));
    }

    const labels = filteredData.map((item) => `${item.itemName} (${item.quantity}/${item.totalQuantity})`);
    const data = filteredData.map((item) => {
      const percentageLeft = ((item.totalQuantity - item.quantity) / item.totalQuantity * 100).toFixed(2);
      return parseFloat(percentageLeft);
    });
    return { labels, data };
  };

  const { labels, data } = generateInventoryData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Inventory',
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'x',
    scales: {
      x: {
        title: {
          display: true,
          text: 'Item Name (Quantity/Total Quantity)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Remaining Percentage',
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  const downloadPdf = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current.canvas);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('inventory-report.pdf');
      alert("PDF Generated 🎉");
    }
  };

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="report-container">
      <h2>Inventory Report</h2>
      <div className="filter-container">
        <label htmlFor="month">Month:</label>
        <select id="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">All</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <label htmlFor="year">Year:</label>
        <select id="year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All</option>
          {/* Add options for the relevant years */}
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <Bar ref={chartRef} data={chartData} options={options} />
      <div className="download-buttons">
        <button onClick={downloadPdf}>Download PDF</button>
      </div>
    </div>
  );
};

export default InventoryReport;
