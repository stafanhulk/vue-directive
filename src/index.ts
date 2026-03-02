import type { App } from 'vue';
import debounceClick, { makeDebounceClick } from './directives/DebounceClick';
import throttleClick from './directives/ThrottleClick';

export { throttleClick, debounceClick, makeDebounceClick };

export default {
  install: (app: App) => {
    app.directive('throttle-click', throttleClick);
    app.directive('debounce-click', debounceClick);
  },
};
