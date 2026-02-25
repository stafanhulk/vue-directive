/* eslint-disable no-underscore-dangle */
import {
    withModifiers,
    type Directive,
    type DirectiveBinding
} from 'vue';

type ClickHandler = (event: MouseEvent, ...args: unknown[]) => any;

interface ThrottleEl extends HTMLElement {
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
}

type VOnModifiers = typeof withModifiers extends (_: any, modifiers: infer M) => void ? M : never;

const throttleClick: Directive = {
    mounted(el: ThrottleEl, binding: DirectiveBinding<ClickHandler>) {
        el._latestBinding = binding;
        el._throttleTimer = null;
        el._hasCalledOnce = false;

        el._trailingEvent = null;
        el._asyncPending = false;

        el._unmounted = false;

        const modifiers = Object.getOwnPropertyNames(binding.modifiers) as VOnModifiers;

        el._throttleHandler = withModifiers((e: Event) => {
            const {
                modifiers,
                value
            } = el._latestBinding;

            if (modifiers.once && el._hasCalledOnce) {
                return;
            }

            // async 模式：上一次还未完成时拦截
            if (modifiers.async && el._asyncPending) {
                if (modifiers.trailing) {
                    el._trailingEvent = e;
                }
                return;
            }

            const delay = typeof el._latestBinding.arg === 'undefined'
                ? 300
                : Number(el._latestBinding.arg);

            // 节流冷却期拦截
            if (delay > 0 && el._throttleTimer) {
                if (modifiers.trailing) {
                    el._trailingEvent = e;
                }
                return;
            }

            const invoke = (evt: MouseEvent) => {
                el._hasCalledOnce = true;
                el._trailingEvent = null;

                if (modifiers.async) {
                    el._asyncPending = true;
                    // value 需返回 Promise，无论 resolve 还是 reject 都解锁
                    Promise.resolve(value?.(evt)).finally(() => {
                        if (el._unmounted) {
                            return;
                        }

                        el._asyncPending = false;
                        // trailing：异步完成后补执行
                        if (modifiers.trailing && el._trailingEvent) {
                            el._throttleHandler(el._trailingEvent);
                        }
                    });
                }
                else {
                    value?.(evt);
                    // 非 async 时 trailing 由 setTimeout 回调处理
                }
            };

            if (delay === 0) {
                invoke(e as MouseEvent);
                return;
            }

            invoke(e as MouseEvent);

            el._throttleTimer = setTimeout(() => {
                el._throttleTimer = null;
                if (!modifiers.async && modifiers.trailing && el._trailingEvent) {
                    el._throttleHandler(el._trailingEvent);
                    el._trailingEvent = null;
                }
            }, delay);
        }, modifiers);

        // .right 需要监听 contextmenu 而非 click
        el._eventName = binding.modifiers.right ? 'contextmenu' : 'click';


        el._listenerOptions = {
            capture: binding.modifiers.capture ?? false,
            passive: binding.modifiers.passive ?? false,
        };

        el.addEventListener(el._eventName, el._throttleHandler, el._listenerOptions);
    },
    updated(el: ThrottleEl, binding: DirectiveBinding) {
        // capture/passive 变化时需要重新绑定监听（极少见，但保证正确性）
        const newCapture = binding.modifiers.capture ?? false;
        const newPassive = binding.modifiers.passive ?? false;
        const oldOptions = el._listenerOptions;

        if (newCapture !== oldOptions.capture || newPassive !== oldOptions.passive) {
            el.removeEventListener(el._eventName, el._throttleHandler, oldOptions);
            el._listenerOptions = {
                capture: newCapture,
                passive: newPassive
            };
            el.addEventListener(el._eventName, el._throttleHandler, el._listenerOptions);
        }

        el._latestBinding = binding;
    },
    unmounted(el: ThrottleEl) {
        el.removeEventListener(el._eventName, el._throttleHandler, el._listenerOptions);
        if (el._throttleTimer) {
            clearTimeout(el._throttleTimer);
        }

        el._unmounted = true;
        el._trailingEvent = null;
    },
};

export default throttleClick;
