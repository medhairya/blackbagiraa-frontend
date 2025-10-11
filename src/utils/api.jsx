class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    console.log('API Service initialized with base URL:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    try {
      const authToken = JSON.parse(localStorage.getItem("authToken"));
      const token = authToken?.token;

      const isAuthRoute = endpoint === "api/user/login" || endpoint === "api/user/register";
      
      const headers = {
        "Content-Type": "application/json",
        ...(token && !isAuthRoute && { Authorization: `Bearer ${token}` }), 
      };

      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
      
        if(response.status === 400   || response.status===401 || response.status === 404){
          return {message:errorData.message,success:false}
        }
        throw new Error(errorData.message || "Unknown error");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// Get the base URL from environment variables with fallback
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const api = new ApiService(BASE_URL);
