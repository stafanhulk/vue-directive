import { mount } from '@vue/test-utils';
import throttleClick from '@/directives/ThrottleClick';

describe('v-throttle-click', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ✅ 基础节流：300ms 内多次点击只触发一次
  it('throttles clicks within default 300ms interval', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { throttleClick },
      template: '<button v-throttle-click="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    wrapper.trigger('click');
    wrapper.trigger('click');

    expect(handler).toHaveBeenCalledTimes(1);

    // 冷却结束后可以再次触发
    jest.advanceTimersByTime(300);
    wrapper.trigger('click');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  // ✅ .once：只触发一次
  it('.once modifier fires only once', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { throttleClick },
      template: '<button v-throttle-click.once="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    jest.advanceTimersByTime(300);
    wrapper.trigger('click');
    jest.advanceTimersByTime(300);
    wrapper.trigger('click');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ .trailing：冷却期内最后一次补触发
  it('.trailing fires the last blocked click after cooldown', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { throttleClick },
      template: '<button v-throttle-click.trailing="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click'); // 立即触发
    wrapper.trigger('click'); // 冷却期内，记录为 trailing

    expect(handler).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300); // 冷却结束，补触发 trailing
    expect(handler).toHaveBeenCalledTimes(2);
  });

  // ✅ .async：上一次 Promise 未完成时，新点击被拦截
  it('.async blocks new clicks while previous Promise is pending', async () => {
    let resolve!: () => void;
    const asyncHandler = jest.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        })
    );

    const wrapper = mount({
      directives: { throttleClick },
      template: '<button v-throttle-click.async="onClick">btn</button>',
      setup: () => ({ onClick: asyncHandler }),
    });

    await wrapper.trigger('click'); // 触发，Promise pending
    await wrapper.trigger('click'); // 被拦截

    expect(asyncHandler).toHaveBeenCalledTimes(1);

    resolve(); // Promise 完成
    // 1. 推进节流计时器，解除节流锁
    jest.advanceTimersByTime(300);
    // 2. 清空 Promise 微任务队列，确保 finally 回调已执行（asyncPending = false）
    await Promise.resolve();
    await Promise.resolve();

    await wrapper.trigger('click'); // 现在可以再次触发
    expect(asyncHandler).toHaveBeenCalledTimes(2);
  });

  // ✅ 卸载后不再触发
  it('cleans up on unmount', async () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { throttleClick },
      template: '<button v-throttle-click="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    expect(handler).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    wrapper.trigger('click');
    jest.advanceTimersByTime(300);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
