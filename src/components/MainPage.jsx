import React, { useState } from 'react';
import Header from './Header';
import NavigationMenu from './NavigationMenu';
import FormDisplay from './FormDisplay';
import '../styles/MainPage.css';

const MainPage = ({ user }) => {
  const [selectedForm, setSelectedForm] = useState('income');

  const handleFormSelection = (form) => {
    setSelectedForm(form);
  };

  return (
    <div className="main-page-container">
      <Header />
      <div className="main-content">
        <div className="dashboard-section">
          <NavigationMenu onFormSelect={handleFormSelection} />
        </div>
        <div className="form-section">
          <FormDisplay selectedForm={selectedForm} />
        </div>
      </div>
    </div>
  );
};

export default MainPage;