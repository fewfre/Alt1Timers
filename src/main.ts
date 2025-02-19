import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

if (window.alt1) window.alt1.identifyAppUrl("./appconfig.json");

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
