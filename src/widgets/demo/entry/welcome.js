import App from 'views/welcome'
import dolphinweex from 'src/js/dolphinweex.js'
import exceptionReport from '@/js/exceptionReport.js'

Vue.use(dolphinweex)
Vue.use(exceptionReport)
new Vue(Vue.util.extend({ el: '#root' }, App))
