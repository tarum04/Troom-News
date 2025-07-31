import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import Avatar from './Avatar';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { updateProfile } from '../services/profileService';
import './ProfileForm.css';
import defaultAvatar from '../../../assets/image/Profile.jpg'; // import default avatar

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    about: user?.about || '',
    profilePicture: user?.profilePicture || null
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    about: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleAvatarChange = (imageData) => {
    setFormData({
      ...formData,
      profilePicture: imageData
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const updatedUser = await updateProfile(user.id, formData);
      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      {successMessage && <div className="form-success">{successMessage}</div>}
      
      <div className="profile-avatar-section">
        <Avatar 
          src={formData.profilePicture || defaultAvatar} 
          alt={formData.name} 
          size="large" 
          onChange={handleAvatarChange} 
        />
        <button type="button" className="avatar-edit-btn">Edit Profile</button>
      </div>
      
      <div className="profile-form-fields">
        <Input
          label="Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          placeholder="Enter your name"
          required
          error={formErrors.name}
          onChange={handleChange}
        />
        
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
        
        <div className="form-group">
          <label htmlFor="about" className="input-label">About</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            placeholder="Tell something about yourself"
            className="textarea-field"
            onChange={handleChange}
            rows={4}
          ></textarea>
        </div>
        
        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
