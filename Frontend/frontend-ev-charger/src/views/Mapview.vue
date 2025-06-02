<template>
  <div class="map-view-container">
    <h1>EV Charger Map Test</h1>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="loading" class="loading-message">Loading chargers...</p>

    <div style="height: 600px; width: 100%;">
      <LMap
        :zoom="mapZoom"
        :center="mapCenter"
        :useGlobalLeaflet="false"
        style="height: 100%; width: 100%;"
        ref="map"
        @ready="onMapReady" >
        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"></LTileLayer>

        <LMarker v-for="charger in chargers" :key="charger.id" :lat-lng="[charger.latitude, charger.longitude]">
          <LPopup>
            <div>
              <h3>{{ charger.name || 'EV Charger' }}</h3>
              <p>Status: {{ charger.status }}</p>
              <p>Power Output: {{ charger.powerOutput }} kW</p>
              <p>Connector: {{ charger.connectorType }}</p>
            </div>
          </LPopup>
        </LMarker>
      </LMap>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet marker icon issues with some bundlers
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'MapView',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  data () {
    return {
      loading: false,
      error: null,
      mapCenter: [22.5726, 88.3639], // Default center (e.g., Kolkata, India)
      mapZoom: 10,
      chargers: []
    }
  },
  methods: {
    async fetchChargers () {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching chargers from URL: http://localhost:5000/api/chargers')
        const token = localStorage.getItem('userToken')
        if (!token) {
          throw new Error('Authentication token not found. Please log in.')
        }

        const response = await axios.get('http://localhost:5000/api/chargers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.chargers = response.data
        console.log('Chargers data after fetch (MapView):', this.chargers)

        // Optional: Center map on the first charger if available, with robust checks
        if (this.chargers && this.chargers.length > 0 && this.chargers[0]) {
          if (typeof this.chargers[0].latitude === 'number' && typeof this.chargers[0].longitude === 'number') {
            this.mapCenter = [this.chargers[0].latitude, this.chargers[0].longitude]
            this.mapZoom = 13
          } else {
            console.warn('First charger found but missing valid latitude/longitude for map centering. Using default center.')
          }
        }
      } catch (err) {
        this.error = 'Failed to load chargers: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching chargers (MapView):', err)
      } finally {
        this.loading = false
      }
    },
    onMapReady (mapInstance) { // ADDED: New method for @ready event
      console.log('Leaflet map is ready! InvalidateSize called.', mapInstance)
      mapInstance.invalidateSize()
    }
  },
  mounted () {
    this.fetchChargers()
    // REMOVED: The old $nextTick with setTimeout block from here
  }
}
</script>

<style scoped>
.map-view-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  padding: 10px;
  margin-top: 15px;
  text-align: center;
}

.loading-message {
  font-size: 1.2em;
  color: #666;
  margin-top: 30px;
}
</style>
