import React, { useState, useEffect } from 'react';
import '../styles/SupplyForm.css';
import { updateSupplyInventory } from '../fb/firebase';
import { doc, updateDoc, deleteField, getDoc } from 'firebase/firestore';
import { auth, db } from '../fb/firebase';
import { FaPlus, FaTrash, FaMinus } from 'react-icons/fa';

const SupplyForm = () => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [userId, setUserId] = useState(null);
  const [supplyItems, setSupplyItems] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadInitialData(user.uid);
      } else {
        setUserId(null);
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
        if (userData.supplyInventory && userData.supplyInventory.items) {
          setSupplyItems(userData.supplyInventory.items);
        } else {
          setSupplyItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        const newItem = {
          itemName,
          quantity: parseFloat(quantity),
          totalQuantity: parseFloat(totalQuantity),
          unitPrice: parseFloat(unitPrice),
        };
        await updateSupplyInventory(userId, newItem);
        console.log('Supply submitted successfully!');
        setItemName('');
        setQuantity('');
        setTotalQuantity('');
        setUnitPrice('');
        await loadInitialData(userId);
        alert('Supplies Added!');
      } catch (error) {
        console.error('Error submitting supply:', error);
      }
    }
  };

  const handleUpdateItem = async (index, updatedItem) => {
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const updatedItems = userData.supplyInventory.items.map((item, i) =>
          i === index ? updatedItem : item
        );
        await updateDoc(userRef, {
          'supplyInventory.items': updatedItems,
        });
        console.log('Supply item updated successfully!');
        await loadInitialData(userId);
      } catch (error) {
        console.error('Error updating supply item:', error);
      }
    }
  };

  const handleDecrementItem = async (index) => {
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const updatedItems = userData.supplyInventory.items.map((item, i) =>
          i === index && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
        );
        await updateDoc(userRef, {
          'supplyInventory.items': updatedItems,
        });
        console.log('Supply item decremented successfully!');
        await loadInitialData(userId);
      } catch (error) {
        console.error('Error decrementing supply item:', error);
      }
    }
  };

  const handleDeleteItem = async (index) => {
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const updatedItems = userData.supplyInventory.items.filter((_, i) => i !== index);
        await updateDoc(userRef, {
          'supplyInventory.items': updatedItems.length > 0 ? updatedItems : deleteField(),
        });
        console.log('Supply item deleted successfully!');
        await loadInitialData(userId);
      } catch (error) {
        console.error('Error deleting supply item:', error);
      }
    }
  };

  return (
    <div>
      <h2>Supply Form</h2>
      <form className="supply-form" onSubmit={handleSubmit}>
        <label htmlFor="item-name">Item Name:</label>
        <input
          type="text"
          id="item-name"
          placeholder="Enter Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <label htmlFor="total-quantity">Total Quantity:</label>
        <input
          type="number"
          id="total-quantity"
          placeholder="Enter Total Quantity"
          value={totalQuantity}
          onChange={(e) => setTotalQuantity(e.target.value)}
          required
        />
        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          placeholder="Enter the Quantity required from total quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <label htmlFor="unit-price">Unit Price:</label>
        <input
          type="number"
          id="unit-price"
          placeholder="Enter Unit Price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <div className="supply-list">
        <h3>Supply List</h3>
        <ul>
          {supplyItems.map((item, index) => (
            <li key={index}>
              <span>{item.itemName}</span>
              <span>{item.quantity}</span>
              <span>{item.totalQuantity}</span>
              <span>{item.unitPrice}</span>
              <button onClick={() => handleUpdateItem(index, { ...item, quantity: item.quantity + 1 })}>
                <FaPlus />
              </button>
              <button onClick={() => handleDecrementItem(index)}>
                <FaMinus />
              </button>
              <button onClick={() => handleDeleteItem(index)}>
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SupplyForm;
