import App from 'views/weex.vue'
import dolphinweex from 'src/js/dolphinweex.js'
import exceptionReport from '@/js/exceptionReport.js'
import store from 'widget/store'

Vue.use(dolphinweex)
Vue.use(exceptionReport)
new Vue({
  el: '#root',
  store,
  render: h => h(App),
})
