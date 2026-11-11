import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/theme.css'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const applyTheme = (isDark) => {
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
}
applyTheme(prefersDark.matches)
prefersDark.addEventListener('change', (e) => applyTheme(e.matches))

const app = createApp(App)

app.use(router)

app.mount('#app')
