import { type Directive, type DirectiveBinding, withModifiers } from 'vue';
import { getDirectiveKey } from '@/utils';

type ClickHandler = (event: MouseEvent, ...args: unknown[]) => void;

const DirectiveKey = getDirectiveKey('throttleClick') as symbol;

interface ThrottleEl extends HTMLElement {
  [DirectiveKey]: {
    _throttleTimer: ReturnType<typeof setTimeout> | null;
    _throttleHandler: (e: Event) => void;
    _latestBinding: DirectiveBinding<ClickHandler>;
    _hasCalledOnce: boolean;
    _listenerOptions: AddEventListenerOptions;
    _eventName: 'click' | 'contextmenu';
    // 记录冷却期内最后一次事件
    _trailingEvent: Event | null;
    // 异步回调是否正在执行
    _asyncPending: boolean;
    // 是否已卸载
    _unmounted: boolean;
  };
}

type VOnModifiers = typeof withModifiers extends (
  _: () => void,
  modifiers: infer M
) => void
  ? M
  : never;

const throttleClick: Directive = {
  mounted(el: ThrottleEl, binding: DirectiveBinding<ClickHandler>) {
    el[DirectiveKey] = {
      _latestBinding: binding,
      _throttleTimer: null,
      _hasCalledOnce: false,
      _trailingEvent: null,
      _asyncPending: false,
      _unmounted: false,
      _eventName: 'click',
      _listenerOptions: {},
      _throttleHandler: () => {},
    };

    const directive = el[DirectiveKey];

    const modifiers = Object.getOwnPropertyNames(
      binding.modifiers
    ) as VOnModifiers;

    directive._throttleHandler = withModifiers((e: Event) => {
      const { modifiers, value } = directive._latestBinding;

      if (modifiers.once && directive._hasCalledOnce) {
        return;
      }

      // async 模式：上一次还未完成时拦截
      if (modifiers.async && directive._asyncPending) {
        if (modifiers.trailing) {
          directive._trailingEvent = e;
        }
        return;
      }

      const delay =
        typeof directive._latestBinding.arg === 'undefined'
          ? 300
          : Number(directive._latestBinding.arg);

      // 节流冷却期拦截
      if (delay > 0 && directive._throttleTimer) {
        if (modifiers.trailing) {
          directive._trailingEvent = e;
        }
        return;
      }

      const invoke = (evt: MouseEvent) => {
        directive._hasCalledOnce = true;
        directive._trailingEvent = null;

        if (modifiers.async) {
          directive._asyncPending = true;
          // value 需返回 Promise，无论 resolve 还是 reject 都解锁
          Promise.resolve(value?.(evt)).finally(() => {
            directive._asyncPending = false;

            if (directive._unmounted) {
              return;
            }
            // trailing：异步完成后补执行
            if (modifiers.trailing && directive._trailingEvent) {
              directive._throttleHandler(directive._trailingEvent);
            }
          });
        } else {
          value?.(evt);
          // 非 async 时 trailing 由 setTimeout 回调处理
        }
      };

      if (delay === 0) {
        invoke(e as MouseEvent);
        return;
      }

      invoke(e as MouseEvent);

      directive._throttleTimer = setTimeout(() => {
        directive._throttleTimer = null;
        if (
          !modifiers.async &&
          modifiers.trailing &&
          directive._trailingEvent
        ) {
          directive._throttleHandler(directive._trailingEvent);
          directive._trailingEvent = null;
        }
      }, delay);
    }, modifiers);

    // .right 需要监听 contextmenu 而非 click
    directive._eventName = binding.modifiers.right ? 'contextmenu' : 'click';

    directive._listenerOptions = {
      capture: binding.modifiers.capture ?? false,
      passive: binding.modifiers.passive ?? false,
    };

    el.addEventListener(
      directive._eventName,
      directive._throttleHandler,
      directive._listenerOptions
    );
  },
  updated(el: ThrottleEl, binding: DirectiveBinding) {
    const directive = el[DirectiveKey];
    console.log('[lwb]', directive);

    // capture/passive 变化时需要重新绑定监听（极少见，但保证正确性）
    // 理论上不会发生变化，但为了严谨性，还是判断一下
    const newCapture = binding.modifiers.capture ?? false;
    const newPassive = binding.modifiers.passive ?? false;
    const oldOptions = directive._listenerOptions;

    if (
      newCapture !== oldOptions.capture ||
      newPassive !== oldOptions.passive
    ) {
      el.removeEventListener(
        directive._eventName,
        directive._throttleHandler,
        oldOptions
      );
      directive._listenerOptions = {
        capture: newCapture,
        passive: newPassive,
      };
      el.addEventListener(
        directive._eventName,
        directive._throttleHandler,
        directive._listenerOptions
      );
    }

    directive._latestBinding = binding;
  },
  unmounted(el: ThrottleEl) {
    const directive = el[DirectiveKey];

    el.removeEventListener(
      directive._eventName,
      directive._throttleHandler,
      directive._listenerOptions
    );
    if (directive._throttleTimer) {
      clearTimeout(directive._throttleTimer);
    }

    directive._unmounted = true;
    directive._trailingEvent = null;
  },
};

export default throttleClick;
