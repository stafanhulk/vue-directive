import ElementPlus from 'element-plus';
import { createApp } from 'vue';
import 'element-plus/dist/index.css';
import CustomDirective from '@/index';
import App from './App.vue';

const app = createApp(App);
app.use(ElementPlus);
app.use(CustomDirective);

app.mount('#app');
