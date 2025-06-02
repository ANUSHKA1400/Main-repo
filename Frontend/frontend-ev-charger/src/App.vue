<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/chargers">Chargers</router-link> |
      <router-link to="/map">Map</router-link> | <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <a v-else @click="logout" href="#">Logout</a>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      loggedInStateTrigger: false
    }
  },
  computed: {
    isLoggedIn () {
      return !!localStorage.getItem('userToken')
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      this.loggedInStateTrigger = !this.loggedInStateTrigger
      this.$router.push('/login')
    },
    checkLoginStatus () {
      this.loggedInStateTrigger = !this.loggedInStateTrigger
    }
  },
  mounted () {
    this.checkLoginStatus()
  }
}
</script>

<style>
/* Your existing styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-moz-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
