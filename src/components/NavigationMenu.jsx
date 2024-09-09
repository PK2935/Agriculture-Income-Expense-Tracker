import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../fb/firebase.js";
import { getUserDisplayName } from "../fb/firebase.js";
import profilePhoto from "../styles/user.png"; // Import the profile photo
import "../styles/NavigationMenu.css";

const NavigationMenu = ({ onFormSelect, activeForm }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(true); // State to control the menu

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const displayName = await getUserDisplayName(user.uid);
        setUserName(displayName);
      } else {
        setUserName("");
      }
    });

    return unsubscribe;
  }, []);

  const handleFormSelection = (form) => {
    if (form === "Reports") {
      navigate("/reports");
    } else if (form === "Dashboard") {
      navigate("/dashboard");
    } else {
      onFormSelect(form);
    }
  };

  const handleLogout = async () => {
    try {
      const confirmed = await new Promise((resolve) => {
        const result = window.confirm("Are you sure you want to logout?");
        resolve(result);
      });
      if (confirmed) {
        await auth.signOut();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Toggle menu state
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navigation-menu ${menuOpen ? "open" : "collapsed"}`}>
      <div className="menu-toggle" onClick={toggleMenu}>
        <i className="fas fa-chevron-left arrow-icon"></i>{" "}
        {/* Always use fa-chevron-left */}
      </div>
      <div className={`user-info ${menuOpen ? "open" : "collapsed"}`}>
        <div className="profile-photo-container">
          <img src={profilePhoto} alt="Profile" className="profile-photo" />
        </div>
        <div className="user-name">
          {menuOpen ? `Hello, ${userName}👋🏻` : ""}
        </div>
      </div>
      <ul>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("Dashboard")}
            className={`navigation-button dashboard ${
              activeForm === "Dashboard" ? "active" : ""
            }`}
          >
            <i className="fas fa-tachometer-alt"></i>{" "}
            {menuOpen ? "Dashboard" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("income")}
            className={`navigation-button income ${
              activeForm === "income" ? "active" : ""
            }`}
          >
            <i className="fas fa-money-bill-alt"></i> {menuOpen ? "Income" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("expense")}
            className={`navigation-button expense ${
              activeForm === "expense" ? "active" : ""
            }`}
          >
            <i className="fas fa-shopping-cart"></i> {menuOpen ? "Expense" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("transaction")}
            className={`navigation-button transaction ${
              activeForm === "transaction" ? "active" : ""
            }`}
          >
            <i className="fas fa-exchange-alt"></i>{" "}
            {menuOpen ? "Transaction" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("supply")}
            className={`navigation-button supply ${
              activeForm === "supply" ? "active" : ""
            }`}
          >
            <i className="fas fa-truck"></i>{" "}
            {menuOpen ? "Supply Management" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => handleFormSelection("Reports")}
            className={`navigation-button reports ${
              activeForm === "Reports" ? "active" : ""
            }`}
          >
            <i className="fas fa-chart-bar"></i> {menuOpen ? "Reports" : ""}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="navigation-button logout"
          >
            <i className="fas fa-sign-out-alt"></i> {menuOpen ? "Logout" : ""}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationMenu;
