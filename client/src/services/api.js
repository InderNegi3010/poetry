// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api';

export const bahrAPI = {
  // Check Bahr for given text
  async checkBahr(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/check-bahr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking Bahr:', error);
      throw error;
    }
  },

  // Get all analyses
  async getAnalyses() {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analyses:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  }
};