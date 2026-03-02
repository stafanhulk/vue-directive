import { type Directive, type DirectiveBinding, withModifiers } from 'vue';
import { getDirectiveKey } from '@/utils';

type ClickHandler = (event: MouseEvent, ...args: unknown[]) => void;

const DirectiveKey = getDirectiveKey('debounceClick') as symbol;

interface DebounceEl extends HTMLElement {
  [DirectiveKey]: {
    _debounceTimer: ReturnType<typeof setTimeout> | null;
    _maxWaitTimer: ReturnType<typeof setTimeout> | null;
    _debounceHandler: (e: Event) => void;
    _latestBinding: DirectiveBinding<ClickHandler>;
    _hasCalledOnce: boolean;
    _listenerOptions: AddEventListenerOptions;
    _eventName: 'click' | 'contextmenu';
    _leadingFired: boolean;
    _waiting: boolean;
    _lastEvent: MouseEvent | null;
  };
}

type VOnModifiers = typeof withModifiers extends (
  _: () => void,
  modifiers: infer M
) => void
  ? M
  : never;

/**
 * 创建防抖点击指令
 * @param maxWait - 防抖最长等待时间，超过则强制触发一次；小于等于0时禁用该特性
 * @returns
 */
const makeDebounceClick = (maxWait: number): Directive => {
  const MAX_WAIT = maxWait;

  const debounceClick: Directive = {
    mounted(el: DebounceEl, binding: DirectiveBinding<ClickHandler>) {
      el[DirectiveKey] = {
        _latestBinding: binding,
        _debounceTimer: null,
        _maxWaitTimer: null,
        _hasCalledOnce: false,
        _leadingFired: false,
        _waiting: false,
        _lastEvent: null,
        _eventName: 'click',
        _listenerOptions: {},
        _debounceHandler: () => {},
      };

      const directive = el[DirectiveKey];

      const modifiers = Object.getOwnPropertyNames(
        binding.modifiers
      ) as VOnModifiers;

      directive._debounceHandler = withModifiers((e: Event) => {
        const { modifiers, value } = directive._latestBinding;

        if (modifiers.once && directive._hasCalledOnce) {
          return;
        }

        const delay =
          typeof directive._latestBinding.arg === 'undefined'
            ? 300
            : Number(directive._latestBinding.arg);

        directive._lastEvent = e as MouseEvent;

        const invoke = (evt: MouseEvent) => {
          directive._hasCalledOnce = true;
          value?.(evt);
        };

        if (delay === 0) {
          invoke(e as MouseEvent);
          return;
        }

        // leading 模式：防抖周期内第一次触发时立即执行
        if (modifiers.leading && !directive._leadingFired) {
          directive._leadingFired = true;
          invoke(e as MouseEvent);
        } else {
          directive._waiting = true;
        }

        // 每次点击都重置定时器（核心防抖逻辑）
        if (directive._debounceTimer) {
          clearTimeout(directive._debounceTimer);
        }

        // 新一轮防抖：启动 maxWait 定时器，超过 MAX_WAIT 则强制触发一次（MAX_WAIT < 0 时跳过）
        if (MAX_WAIT > 0 && directive._maxWaitTimer === null) {
          directive._maxWaitTimer = setTimeout(() => {
            directive._maxWaitTimer = null;
            if (directive._debounceTimer) {
              clearTimeout(directive._debounceTimer);
              directive._debounceTimer = null;
            }
            if (directive._waiting && directive._lastEvent) {
              directive._waiting = false;
              invoke(directive._lastEvent);
            }
            directive._leadingFired = false;
          }, MAX_WAIT);
        }

        directive._debounceTimer = setTimeout(() => {
          directive._debounceTimer = null;
          if (directive._maxWaitTimer) {
            clearTimeout(directive._maxWaitTimer);
            directive._maxWaitTimer = null;
          }
          if (directive._waiting) {
            directive._waiting = false;
            invoke(e as MouseEvent);
          }
          directive._leadingFired = false;
        }, delay);
      }, modifiers);

      if (binding.modifiers.right) {
        // .right 需要监听 contextmenu 而非 click
        directive._eventName = 'contextmenu';
      }

      directive._listenerOptions = {
        capture: binding.modifiers.capture ?? false,
        passive: binding.modifiers.passive ?? false,
      };

      el.addEventListener(
        directive._eventName,
        directive._debounceHandler,
        directive._listenerOptions
      );
    },

    updated(el: DebounceEl, binding: DirectiveBinding) {
      const directive = el[DirectiveKey];

      // capture/passive 变化时需要重新绑定监听
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
          directive._debounceHandler,
          oldOptions
        );
        directive._listenerOptions = {
          capture: newCapture,
          passive: newPassive,
        };
        el.addEventListener(
          directive._eventName,
          directive._debounceHandler,
          directive._listenerOptions
        );
      }

      directive._latestBinding = binding;
    },

    unmounted(el: DebounceEl) {
      const directive = el[DirectiveKey];

      el.removeEventListener(
        directive._eventName,
        directive._debounceHandler,
        directive._listenerOptions
      );
      if (directive._debounceTimer) {
        clearTimeout(directive._debounceTimer);
      }
      if (directive._maxWaitTimer) {
        clearTimeout(directive._maxWaitTimer);
      }
    },
  };

  return debounceClick;
};

export { makeDebounceClick };

const debounceClickDirective = makeDebounceClick(-1);

export default debounceClickDirective;
