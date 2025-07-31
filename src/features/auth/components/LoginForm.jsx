import React, { useState } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import './LoginForm.css';
const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData.email, formData.password);
    }
  };
  
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      
      <Input
        label="Email"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        placeholder="Enter your email"
        required
        error={formErrors.email}
        onChange={handleChange}
      />
      
      <Input
        label="Password"
        type="password"
        id="password"
        name="password"
        value={formData.password}
        placeholder="Enter your password"
        required
        error={formErrors.password}
        onChange={handleChange}
      />
      
      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
