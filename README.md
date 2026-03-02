# vuse-directive

A collection of Vue 3 custom directives.

## Installation

```bash
npm install vuse-directive
# or
pnpm add vuse-directive
# or
yarn add vuse-directive
```

## Getting Started

### Plugin (register all directives globally)

```ts
import { createApp } from 'vue'
import App from './App.vue'
import VuseDirective from 'vuse-directive'

const app = createApp(App)
app.use(VuseDirective)
app.mount('#app')
```

### Single directive

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { throttleClick, debounceClick } from 'vuse-directive'

const app = createApp(App)
app.directive('throttle-click', throttleClick)
app.directive('debounce-click', debounceClick)
app.mount('#app')
```

### On-demand import (local registration)

```ts
import { throttleClick, debounceClick } from 'vuse-directive'
```

---

## Directives


| Directive          | Description                                                                    | Docs |
| ------------------ | ------------------------------------------------------------------------------ | ---- |
| `v-throttle-click` | Throttle click events — fires immediately, then locks for a cooldown period    |      |
| `v-debounce-click` | Debounce click events — fires after the user stops clicking for a set duration |      |


---

## `v-throttle-click`

Fires immediately on click, then ignores subsequent clicks until the cooldown ends.

```vue
<!-- Default: 300ms cooldown -->
<button v-throttle-click="handleClick">Submit</button>

<!-- Custom cooldown -->
<button v-throttle-click:1000="handleClick">Submit</button>

<!-- Async lock: blocks until the returned Promise settles -->
<button v-throttle-click.async="submitForm">Submit</button>

<!-- Async + trailing: re-fires the last blocked click after the Promise settles -->
<button v-throttle-click.async.trailing="submitForm">Submit</button>
```

**Key modifiers:** `.once` · `.trailing` · `.async` · `.right` · `.stop` · `.prevent`

---

## `v-debounce-click`

Fires after the user stops clicking for the specified delay (trailing by default).

```vue
<!-- Default: fires 300ms after the last click -->
<button v-debounce-click="handleClick">Search</button>

<!-- Custom delay -->
<button v-debounce-click:500="handleClick">Search</button>

<!-- Leading: fires immediately on first click, trailing if more clicks follow -->
<button v-debounce-click.leading="handleClick">Search</button>
```

**Key modifiers:** `.once` · `.leading` · `.right` · `.stop` · `.prevent`

### Max-wait cap

By default there is no max-wait limit. Use `makeDebounceClick` to guarantee the handler fires within a fixed window even during continuous clicks:

```ts
import { makeDebounceClick } from 'vuse-directive'

// Fires at most every 3000ms even if clicks never stop
app.directive('debounce-click', makeDebounceClick(3000))
```

---

## Issues

Found a bug or have a suggestion? Feel free to send an email to:

📮 stafanhulk@gmail.com
