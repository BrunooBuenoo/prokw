import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faCogs, 
  faChartLine, 
  faDesktop, 
  faWrench, 
  faChartBar, 
  faUsers, 
  faUserCircle, 
  faSignOutAlt, 
  faPlus, 
  faSearch, 
  faBell, 
  faBars, 
  faStore, 
  faBuilding,
  faExclamationTriangle, 
  faDollarSign, 
  faTimesCircle, 
  faInfoCircle, 
  faFilePdf, 
  faDownload, 
  faCalendar,
  faEye,
  faEdit,
  faInbox,
  faArrowUp,
  faArrowDown,
  faSpinner,
  faFileExcel,
  faUserPlus,
  faUserSlash,
  faUserCheck,
  faSyncAlt,
  faCheckCircle,
  faTimes,
  faPause,
  faPlay
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'

// Add FontAwesome icons to library
library.add(
  faCogs, 
  faChartLine, 
  faDesktop, 
  faWrench, 
  faChartBar, 
  faUsers, 
  faUserCircle, 
  faSignOutAlt, 
  faPlus, 
  faSearch, 
  faBell, 
  faBars, 
  faStore, 
  faBuilding,
  faExclamationTriangle, 
  faDollarSign, 
  faTimesCircle, 
  faInfoCircle, 
  faFilePdf, 
  faDownload, 
  faCalendar,
  faEye,
  faEdit,
  faInbox,
  faArrowUp,
  faArrowDown,
  faSpinner,
  faFileExcel,
  faUserPlus,
  faUserSlash,
  faUserCheck,
  faSyncAlt,
  faCheckCircle,
  faTimes,
  faPause,
  faPlay
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)

app.mount('#app')