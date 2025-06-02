<template>
  <div class="chargers">
    <h1>Your EV Chargers</h1>

    <div class="filters-section">
      <h2>Filter Chargers</h2>
      <div class="filter-controls">
        <div class="form-group">
          <label for="status-filter">Status:</label>
          <select id="status-filter" v-model="filterStatus">
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="charging">Charging</option> <option value="maintenance">Maintenance</option>
            <option value="active">Active</option> <option value="inactive">Inactive</option> </select>
        </div>

        <div class="form-group">
          <label for="connector-type-filter">Connector Type:</label>
          <select id="connector-type-filter" v-model="filterConnectorType">
            <option value="">All</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS1">CCS1</option> <option value="CCS2">CCS2</option> <option value="CHAdeMO">CHAdeMO</option>
            <option value="J1772">J1772</option> </select>
        </div>

        <div class="form-group">
          <label for="power-min-filter">Power (Min kW):</label>
          <input type="number" id="power-min-filter" v-model.number="filterPowerMin" placeholder="e.g., 50">
        </div>
        <div class="form-group">
          <label for="power-max-filter">Power (Max kW):</label>
          <input type="number" id="power-max-filter" v-model.number="filterPowerMax" placeholder="e.g., 150">
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="apply-button">Apply Filters</button>
          <button @click="clearFilters" class="clear-button">Clear Filters</button>
        </div>
      </div>
    </div>

    <div class="add-charger-form">
      <h2>Add New Charger</h2>
      <form @submit.prevent="addCharger">
        <div class="form-group">
          <label for="name">Charger Name:</label> <input type="text" id="name" v-model="newCharger.name" required>
        </div>
        <div class="form-group">
          <label for="latitude">Latitude:</label> <input type="number" id="latitude" v-model.number="newCharger.latitude" step="any" required>
        </div>
        <div class="form-group">
          <label for="longitude">Longitude:</label> <input type="number" id="longitude" v-model.number="newCharger.longitude" step="any" required>
        </div>
        <div class="form-group">
          <label for="powerOutput">Power Output (kW):</label> <input type="number" id="powerOutput" v-model.number="newCharger.powerOutput" required>
        </div>
        <div class="form-group">
          <label for="connectorType">Connector Type:</label> <select id="connectorType" v-model="newCharger.connectorType" required>
            <option value="">Select Type</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS1">CCS1</option>
            <option value="CCS2">CCS2</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="J1772">J1772</option>
            </select>
        </div>
        <div class="form-group">
          <label for="status">Status:</label> <select id="status" v-model="newCharger.status" required>
            <option value="available">Available</option>
            <option value="charging">Charging</option>
            <option value="maintenance">Maintenance</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">Description (Optional):</label>
          <textarea id="description" v-model="newCharger.description"></textarea>
        </div>
        <button type="submit">Add Charger</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>

    <div v-if="editingCharger" class="edit-charger-form">
      <h2>Edit Charger</h2>
      <form @submit.prevent="updateCharger">
        <div class="form-group">
          <label for="edit-name">Charger Name:</label> <input type="text" id="edit-name" v-model="editingCharger.name" required>
        </div>
        <div class="form-group">
          <label for="edit-latitude">Latitude:</label> <input type="number" id="edit-latitude" v-model.number="editingCharger.latitude" step="any" required>
        </div>
        <div class="form-group">
          <label for="edit-longitude">Longitude:</label> <input type="number" id="edit-longitude" v-model.number="editingCharger.longitude" step="any" required>
        </div>
        <div class="form-group">
          <label for="edit-powerOutput">Power Output (kW):</label> <input type="number" id="edit-powerOutput" v-model.number="editingCharger.powerOutput" required>
        </div>
        <div class="form-group">
          <label for="edit-connectorType">Connector Type:</label> <select id="edit-connectorType" v-model="editingCharger.connectorType" required>
            <option value="">Select Type</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS1">CCS1</option>
            <option value="CCS2">CCS2</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="J1772">J1772</option>
            </select>
        </div>
        <div class="form-group">
          <label for="edit-status">Status:</label> <select id="edit-status" v-model="editingCharger.status" required>
            <option value="available">Available</option>
            <option value="charging">Charging</option>
            <option value="maintenance">Maintenance</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-description">Description (Optional):</label>
          <textarea id="edit-description" v-model="editingCharger.description"></textarea>
        </div>
        <button type="submit" class="update-button">Save Changes</button>
        <button type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>

    <div v-if="loading" class="loading-message">Loading chargers...</div>
    <div v-else-if="chargers.length === 0" class="no-chargers">
      <p>No chargers found. Add one now!</p>
    </div>
    <div v-else class="charger-list">
      <div v-for="charger in chargers" :key="charger.id" class="charger-item"> <h3>{{ charger.name }}</h3> <p><strong>Lat/Lng:</strong> {{ charger.latitude }}, {{ charger.longitude }}</p> <p><strong>Connector:</strong> {{ charger.connectorType }}</p> <p><strong>Power:</strong> {{ charger.powerOutput }} kW</p> <p><strong>Status:</strong> {{ charger.status }}</p> <p v-if="charger.description"><strong>Description:</strong> {{ charger.description }}</p>
        <small>Added: {{ new Date(charger.createdAt).toLocaleDateString() }}</small>
        <div class="charger-actions">
          <button @click="startEdit(charger)" class="edit-button">Edit</button>
          <button @click="deleteCharger(charger.id)" class="delete-button">Delete</button> </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ChargersView',
  data () {
    return {
      chargers: [], // This will hold the fetched chargers
      newCharger: { // Data model for the new charger form
        name: '', // Renamed from location
        latitude: null, // NEW FIELD
        longitude: null, // NEW FIELD
        powerOutput: null, // Renamed from powerRating
        connectorType: '', // Renamed from type
        status: 'available', // NEW FIELD with default value
        description: ''
      },
      editingCharger: null, // Holds the charger object currently being edited
      error: null,
      loading: true, // To show loading state
      // Filter data properties
      filterStatus: '',
      filterConnectorType: '',
      filterPowerMin: '',
      filterPowerMax: ''
    }
  },
  async created () {
    // When the component is created, fetch chargers with no filters initially
    await this.fetchChargersWithFilters()
  },
  methods: {
    async fetchChargers (queryParams = '') { // Added queryParams parameter
      this.loading = true
      this.error = null // Clear previous errors
      try {
        const token = localStorage.getItem('userToken') // Get the user token

        if (!token) {
          this.error = 'No authentication token found. Please log in.'
          this.loading = false
          this.$router.push('/login') // Redirect to login if token is missing
          return
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}` // Attach the token to the Authorization header
          }
        }

        // Construct the full URL with query parameters
        const fullUrl = queryParams ? `http://localhost:5000/api/chargers?${queryParams}` : 'http://localhost:5000/api/chargers'

        console.log('Fetching chargers from URL:', fullUrl)

        // Make the GET request to your backend API
        const response = await axios.get(fullUrl, config)
        this.chargers = response.data

        console.log('Chargers data after fetch (ChargersView):', this.chargers)
      } catch (err) {
        this.error = 'Failed to fetch chargers. Please try again.'
        console.error('Error fetching chargers:', err)
        // Handle unauthorized access (e.g., token expired)
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userToken')
          localStorage.removeItem('userId') // Ensure userId is removed too
          localStorage.removeItem('userEmail')
          // No need to remove 'userName' as it's not stored or returned
          this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },

    async fetchChargersWithFilters () {
      const params = new URLSearchParams()

      if (this.filterStatus) {
        params.append('status', this.filterStatus)
      }
      if (this.filterConnectorType) {
        params.append('connectorType', this.filterConnectorType)
      }
      // Only append if not empty and not null
      if (this.filterPowerMin !== '' && this.filterPowerMin !== null) {
        params.append('powerOutput_min', this.filterPowerMin) // Renamed to powerOutput_min
      }
      if (this.filterPowerMax !== '' && this.filterPowerMax !== null) {
        params.append('powerOutput_max', this.filterPowerMax) // Renamed to powerOutput_max
      }

      await this.fetchChargers(params.toString())
    },

    applyFilters () {
      this.fetchChargersWithFilters()
    },

    clearFilters () {
      this.filterStatus = ''
      this.filterConnectorType = ''
      this.filterPowerMin = ''
      this.filterPowerMax = ''
      this.fetchChargersWithFilters()
    },

    async addCharger () {
      this.error = null // Clear previous errors for adding charger
      const token = localStorage.getItem('userToken')
      const userId = localStorage.getItem('userId') // Get the userId

      if (!token) {
        this.error = 'No authentication token found. Please log in to add a charger.'
        this.$router.push('/login')
        return
      }
      if (!userId) { // Ensure userId is available for association
        this.error = 'User ID not found. Please log in again.'
        this.$router.push('/login')
        return
      }

      // Basic validation based on backend required fields
      if (!this.newCharger.name || !this.newCharger.latitude || !this.newCharger.longitude ||
          !this.newCharger.powerOutput || !this.newCharger.connectorType || !this.newCharger.status) {
        this.error = 'Please fill in all required fields: Name, Latitude, Longitude, Power Output, Connector Type, and Status.'
        return
      }
      if (isNaN(this.newCharger.latitude) || isNaN(this.newCharger.longitude)) {
        this.error = 'Latitude and Longitude must be numbers.'
        return
      }
      if (isNaN(this.newCharger.powerOutput) || this.newCharger.powerOutput <= 0) {
        this.error = 'Power Output must be a positive number.'
        return
      }

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        // Construct the payload matching backend's expected fields
        const payload = {
          userId: userId, // Associate charger with the logged-in user
          name: this.newCharger.name,
          latitude: parseFloat(this.newCharger.latitude), // Ensure float
          longitude: parseFloat(this.newCharger.longitude), // Ensure float
          status: this.newCharger.status,
          powerOutput: parseFloat(this.newCharger.powerOutput), // Ensure float
          connectorType: this.newCharger.connectorType,
          description: this.newCharger.description || null // Send null if empty
        }

        // Make the POST request to add a new charger
        const response = await axios.post('http://localhost:5000/api/chargers', payload, config)
        console.log('Charger added successfully:', response.data)

        // Clear the form fields after successful submission
        this.newCharger = {
          name: '',
          latitude: null,
          longitude: null,
          powerOutput: null,
          connectorType: '',
          status: 'available', // Reset to default status
          description: ''
        }

        // Refresh the list of chargers to include the newly added one
        await this.fetchChargersWithFilters()
      } catch (err) {
        console.error('Error adding charger:', err)
        if (err.response && err.response.data && err.response.data.message) {
          this.error = `Failed to add charger: ${err.response.data.message}`
        } else {
          this.error = 'An unexpected error occurred while adding the charger.'
        }
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userToken')
          localStorage.removeItem('userId')
          localStorage.removeItem('userEmail')
          this.$router.push('/login')
        }
      }
    },

    startEdit (charger) {
      // Create a copy to avoid directly modifying the charger in the list
      // Ensure all fields expected by the form are present
      this.editingCharger = {
        id: charger.id, // Use 'id' from backend
        name: charger.name,
        latitude: charger.latitude,
        longitude: charger.longitude,
        powerOutput: charger.powerOutput,
        connectorType: charger.connectorType,
        status: charger.status,
        description: charger.description
      }
      this.error = null // Clear any existing errors
    },

    cancelEdit () {
      this.editingCharger = null // Clear the editingCharger
      this.error = null
    },

    async updateCharger () {
      this.error = null
      if (!this.editingCharger || !this.editingCharger.id) { // Changed _id to id
        this.error = 'No charger selected for editing.'
        return
      }

      const token = localStorage.getItem('userToken')
      if (!token) {
        this.error = 'No authentication token found. Please log in to update a charger.'
        this.$router.push('/login')
        return
      }

      // Basic validation for updated fields
      if (!this.editingCharger.name || !this.editingCharger.latitude || !this.editingCharger.longitude ||
          !this.editingCharger.powerOutput || !this.editingCharger.connectorType || !this.editingCharger.status) {
        this.error = 'Please fill in all required fields: Name, Latitude, Longitude, Power Output, Connector Type, and Status.'
        return
      }
      if (isNaN(this.editingCharger.latitude) || isNaN(this.editingCharger.longitude)) {
        this.error = 'Latitude and Longitude must be numbers.'
        return
      }
      if (isNaN(this.editingCharger.powerOutput) || this.editingCharger.powerOutput <= 0) {
        this.error = 'Power Output must be a positive number.'
        return
      }

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        // Construct the payload for update
        const payload = {
          name: this.editingCharger.name,
          latitude: parseFloat(this.editingCharger.latitude),
          longitude: parseFloat(this.editingCharger.longitude),
          status: this.editingCharger.status,
          powerOutput: parseFloat(this.editingCharger.powerOutput),
          connectorType: this.editingCharger.connectorType,
          description: this.editingCharger.description || null
        }

        // Send PUT request to update the charger
        const response = await axios.put(`http://localhost:5000/api/chargers/${this.editingCharger.id}`, payload, config) // Changed _id to id
        console.log('Charger updated successfully:', response.data)

        // Find and replace the updated charger in the local array
        const index = this.chargers.findIndex(c => c.id === response.data.id) // Changed _id to id
        if (index !== -1) {
          this.chargers[index] = response.data
        }

        this.editingCharger = null // Clear the editing state
      } catch (err) {
        console.error('Error updating charger:', err)
        if (err.response && err.response.data && err.response.data.message) {
          this.error = `Failed to update charger: ${err.response.data.message}`
        } else {
          this.error = 'An unexpected error occurred while updating the charger.'
        }
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userToken')
          localStorage.removeItem('userId')
          localStorage.removeItem('userEmail')
          this.$router.push('/login')
        } else if (err.response && err.response.status === 404) {
          this.error = 'Charger not found or might have been deleted.'
          await this.fetchChargersWithFilters() // Re-fetch to sync
        }
      }
    },

    async deleteCharger (id) { // Changed _id to id
      this.error = null
      if (!confirm('Are you sure you want to delete this charger?')) {
        return // User cancelled the deletion
      }

      const token = localStorage.getItem('userToken')
      if (!token) {
        this.error = 'No authentication token found. Please log in to delete a charger.'
        this.$router.push('/login')
        return
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        await axios.delete(`http://localhost:5000/api/chargers/${id}`, config) // Changed _id to id
        console.log(`Charger with ID ${id} deleted successfully.`)

        // Remove the deleted charger from the local chargers array to update UI
        this.chargers = this.chargers.filter(charger => charger.id !== id) // Changed _id to id
        if (this.editingCharger && this.editingCharger.id === id) { // Changed _id to id
          this.editingCharger = null // Clear editing if the deleted item was being edited
        }
      } catch (err) {
        console.error('Error deleting charger:', err)
        if (err.response && err.response.data && err.response.data.message) {
          this.error = `Failed to delete charger: ${err.response.data.message}`
        } else {
          this.error = 'An unexpected error occurred while deleting the charger.'
        }
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('userToken')
          localStorage.removeItem('userId')
          localStorage.removeItem('userEmail')
          this.$router.push('/login')
        } else if (err.response && err.response.status === 404) {
          this.error = 'Charger not found or already deleted.'
          // Re-fetch chargers to sync the list in case it was deleted by someone else
          await this.fetchChargersWithFilters()
        }
      }
    }
  }
}
</script>

<style scoped>
/* (Your existing styles remain unchanged) */
.chargers {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

/* Styles for the Add Charger Form */
.add-charger-form {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  border: 1px solid #e0e0e0;
}

.add-charger-form h2 {
  text-align: center;
  color: #007bff;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 18px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  font-size: 0.95em;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select { /* Added select to form group styling */
  width: calc(100% - 24px); /* Adjust for padding and border */
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus,
.form-group select:focus { /* Added select to focus styling */
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

.add-charger-form button {
  width: 100%;
  padding: 14px;
  background-color: #28a745; /* Green for add */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.add-charger-form button:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.error-message {
  color: #dc3545; /* Red for errors */
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  padding: 10px;
  margin-top: 15px;
  text-align: center;
  font-size: 0.9em;
}

/* Styles for Edit Charger Form */
.edit-charger-form {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  border: 1px solid #007bff; /* Highlight with a blue border */
}

.edit-charger-form h2 {
  text-align: center;
  color: #007bff;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.edit-charger-form button.update-button {
  background-color: #007bff; /* Blue for update */
  margin-right: 10px;
  width: calc(50% - 5px); /* Adjust width for two buttons side-by-side */
  float: left; /* To align next to cancel button */
}

.edit-charger-form button.update-button:hover {
  background-color: #0056b3;
}

.edit-charger-form button.cancel-button {
  background-color: #6c757d; /* Gray for cancel */
  width: calc(50% - 5px); /* Adjust width */
  float: right; /* To align next to update button */
}

.edit-charger-form button.cancel-button:hover {
  background-color: #5a6268;
}

/* Clear float after buttons in edit form */
.edit-charger-form form::after {
  content: "";
  display: table;
  clear: both;
}

/* Styles for charger list */
.loading-message, .no-chargers {
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-top: 30px;
}

.charger-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.charger-item {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.charger-item h3 {
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5em;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.charger-item p {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.5;
}

.charger-item strong {
  color: #333;
}

.charger-item small {
  display: block;
  margin-top: 15px;
  color: #888;
  font-size: 0.85em;
  text-align: right;
}

.charger-actions {
  margin-top: auto; /* Push buttons to the bottom */
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around; /* Space out the buttons */
  gap: 10px;
}

.charger-actions button {
  flex: 1; /* Make buttons take equal width */
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.charger-actions .edit-button {
  background-color: #ffc107; /* Yellow for edit */
  color: #333;
}

.charger-actions .edit-button:hover {
  background-color: #e0a800;
}

.charger-actions .delete-button {
  background-color: #dc3545; /* Red for delete */
  color: white;
}

.charger-actions .delete-button:hover {
  background-color: #c82333;
}

/* Filter section styling */
.filters-section {
  background: #f0f8ff; /* Light blue background */
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  border: 1px solid #cceeff;
}

.filters-section h2 {
  text-align: center;
  color: #0056b3; /* Darker blue */
  margin-bottom: 25px;
  font-size: 1.8em;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end; /* Align items to the bottom for consistent layout */
}

.filter-actions {
  grid-column: 1 / -1; /* Make buttons span all columns */
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.filter-actions button {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  font-size: 1.05em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.filter-actions .apply-button {
  background-color: #007bff;
  color: white;
}

.filter-actions .apply-button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.filter-actions .clear-button {
  background-color: #6c757d;
  color: white;
}

.filter-actions .clear-button:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

</style>
