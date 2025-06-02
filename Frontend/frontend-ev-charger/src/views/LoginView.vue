<template>
  <div class="auth-container">
    <h2>{{ isRegistering ? 'Register' : 'Login' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">{{ isRegistering ? 'Register' : 'Login' }}</button>
    </form>
    <p>
      {{ isRegistering ? 'Already have an account?' : 'Don\'t have an account?' }}
      <a href="#" @click.prevent="toggleAuthMode">
        {{ isRegistering ? 'Login here' : 'Register here' }}
      </a>
    </p>
    <div v-if="message" :class="{ 'error-message': isError, 'success-message': !isError }">{{ message }}</div>
  </div>
</template>

<script>
import axios from 'axios' // Import axios

export default {
  name: 'LoginView',
  data () {
    return {
      email: '',
      password: '',
      isRegistering: false, // true for register mode, false for login mode
      message: '',
      isError: false
    }
  },
  methods: {
    toggleAuthMode () {
      this.isRegistering = !this.isRegistering
      this.message = '' // Clear messages when toggling
      this.isError = false
    },
    async handleSubmit () { // Renamed from 'login' to 'handleSubmit' for clarity with register logic
      this.message = '' // Clear previous messages
      this.isError = false

      // Corrected URL based on whether we are registering or logging in
      const url = this.isRegistering
        ? 'http://localhost:5000/api/auth/register' // Backend Register endpoint
        : 'http://localhost:5000/api/auth/login' // Backend Login endpoint

      try {
        const response = await axios.post(url, {
          email: this.email,
          password: this.password
        })

        // Handle success
        this.message = `Successfully ${this.isRegistering ? 'registered' : 'logged in'}!`
        this.isError = false

        // Store the token and user ID (IMPORTANT!)
        localStorage.setItem('userToken', response.data.token)
        localStorage.setItem('userId', response.data.id) // Store userId which is returned
        localStorage.setItem('userEmail', response.data.email) // Store email

        console.log('API Response:', response.data)
        console.log('Token stored:', localStorage.getItem('userToken'))
        console.log('User ID stored:', localStorage.getItem('userId'))

        // Notify the root App component to re-check login status and update UI
        // This assumes your App.vue has a checkLoginStatus method
        if (this.$root && typeof this.$root.checkLoginStatus === 'function') {
          this.$root.checkLoginStatus()
        }

        // Redirect to another page (e.g., ChargersView or MapView)
        this.$router.push('/chargers') // Redirect to /chargers page after success
      } catch (error) {
        // Handle errors from the backend
        this.isError = true
        if (error.response && error.response.data && error.response.data.message) {
          this.message = error.response.data.message
        } else {
          this.message = 'An unexpected error occurred.'
        }
        console.error('Authentication error:', error.response ? error.response.data : error)
      }
    }
  }
}
</script>

<style scoped>
/* Keeping your existing styles, just adjusting class names for consistency */
.auth-container { /* Changed from .login-container */
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  text-align: center; /* Added for centering text elements */
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
  text-align: left; /* Ensure labels/inputs align left */
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="email"],
input[type="password"] {
  width: 100%; /* Changed from calc(100% - 20px) for simpler width */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box; /* Ensures padding doesn't increase total width */
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px; /* Added some top margin */
}

button:hover {
  background-color: #45a049;
}

.error-message { /* Renamed from .error-message for consistency with my previous code */
  color: red;
  margin-top: 10px;
  text-align: center;
}

.success-message { /* Added for success messages */
  color: green;
  margin-top: 10px;
  text-align: center;
}

/* Style for the toggle link */
p a {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}

p a:hover {
  text-decoration: underline;
}
</style>
