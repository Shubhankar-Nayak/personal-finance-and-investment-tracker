import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registerUser = async (formData: {
  name: string;
  email: string;
  password: string;
  otp: string;
  hash: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
  return response.data; // Should contain { user, token }
};
