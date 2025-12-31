// API client for Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.getAuthToken = null; // Will be set by auth context
  }

  setAuthTokenGetter(getter) {
    this.getAuthToken = getter;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token if available
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async getUserById(id) {
    return this.request(`/api/users/${id}`);
  }

  async getUserByFirebaseUid(firebaseUid) {
    return this.request(`/api/users/firebase/${firebaseUid}`);
  }

  async registerUser(userData, token) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async getUserByUsername(username) {
    return this.request(`/api/users/username/${username}`);
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Event endpoints
  async getEvents() {
    return this.request('/api/events');
  }

  async getEventById(id) {
    return this.request(`/api/events/${id}`);
  }

  async getEventsByUserId(userId) {
    return this.request(`/api/events/user/${userId}`);
  }

  async getPublicEventsByUserId(userId) {
    return this.request(`/api/events/user/${userId}/public`);
  }

  async createEvent(eventData) {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking endpoints
  async getBookings() {
    return this.request('/api/bookings');
  }

  async getBookingById(id) {
    return this.request(`/api/bookings/${id}`);
  }

  async getBookingsByUserId(userId) {
    return this.request(`/api/bookings/user/${userId}`);
  }

  async getBookingsByEventId(eventId) {
    return this.request(`/api/bookings/event/${eventId}`);
  }

  async getBookingsByUserAndDateRange(userId, startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return this.request(`/api/bookings/user/${userId}/range?${params}`);
  }

  async createBooking(bookingData) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id, bookingData) {
    return this.request(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(id) {
    return this.request(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Availability endpoints
  async getAvailabilityByUserId(userId) {
    return this.request(`/api/availability/user/${userId}`);
  }

  async createAvailability(availabilityData) {
    return this.request('/api/availability', {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  }

  async updateAvailability(id, availabilityData) {
    return this.request(`/api/availability/${id}`, {
      method: 'PUT',
      body: JSON.stringify(availabilityData),
    });
  }

  async deleteAvailability(id) {
    return this.request(`/api/availability/${id}`, {
      method: 'DELETE',
    });
  }

  // Google Calendar endpoints
  async getGoogleAuthUrl() {
    return this.request('/api/google-calendar/auth-url');
  }

  async exchangeGoogleToken(code) {
    return this.request('/api/google-calendar/exchange-token', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
