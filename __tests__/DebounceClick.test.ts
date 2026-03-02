import { mount } from '@vue/test-utils';
import debounceClick, { makeDebounceClick } from '@/directives/DebounceClick';

describe('v-debounce-click', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ✅ 基础防抖（trailing）：连续点击只在静默期结束后触发一次
  it('debounces clicks and fires once after delay (trailing)', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    wrapper.trigger('click');
    wrapper.trigger('click');

    // 静默期内不触发
    expect(handler).toHaveBeenCalledTimes(0);

    // 静默期结束后触发一次
    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ 自定义延迟：:500
  it('respects custom delay via arg', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click:500="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    wrapper.trigger('click');

    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ delay=0：不防抖，每次点击立即触发
  it('fires immediately when delay is 0', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click:0="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    wrapper.trigger('click');

    expect(handler).toHaveBeenCalledTimes(2);
  });

  // ✅ .leading：防抖周期内第一次点击立即执行（leading），
  //            冷却期内有再次点击时尾部也会触发一次（trailing），之后重置周期
  it('.leading fires immediately on first click; trailing fires if clicks happened during debounce', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click.leading="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    // 第一次点击立即触发（leading）
    wrapper.trigger('click');
    expect(handler).toHaveBeenCalledTimes(1);

    // 冷却期内再次点击，不立即触发，但设置 _waiting = true
    wrapper.trigger('click');
    expect(handler).toHaveBeenCalledTimes(1);

    // 冷却期结束：_waiting=true 触发一次 trailing，共 2 次，周期重置
    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(2);

    // 新周期，再次 leading 立即触发
    wrapper.trigger('click');
    expect(handler).toHaveBeenCalledTimes(3);
  });

  // ✅ .leading 且冷却期内无再次点击：不触发 trailing
  it('.leading does not fire trailing when no clicks happen during debounce', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click.leading="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click'); // 立即触发
    expect(handler).toHaveBeenCalledTimes(1);

    // 冷却期内没有再次点击
    jest.advanceTimersByTime(300);
    // _waiting 始终为 false，不触发 trailing
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ .once：只触发一次
  it('.once modifier fires only once', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click.once="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(1);

    wrapper.trigger('click');
    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ maxWait 启用（makeDebounceClick(3000)）：连续点击超过 3000ms 时强制触发一次
  it('fires after maxWait even if clicks keep resetting the debounce timer', () => {
    const handler = jest.fn();
    const debounceClickWithMaxWait = makeDebounceClick(3000);

    const wrapper = mount({
      directives: { debounceClickWithMaxWait },
      template: '<button v-debounce-click-with-max-wait:500="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    // 每隔 400ms 点击一次，delay=500ms 导致防抖定时器一直被重置
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');
    jest.advanceTimersByTime(400);
    wrapper.trigger('click');

    // 累计时间约 2800ms，尚未达到 3000ms maxWait，也未停止点击
    expect(handler).toHaveBeenCalledTimes(0);

    // 再推进 200ms，累计超过 maxWait(3000ms)，强制触发一次
    jest.advanceTimersByTime(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ maxWait 禁用（makeDebounceClick(-1)，即默认指令）：连续点击不会被 maxWait 强制触发
  it('does not fire based on maxWait when maxWait <= 0 (default, negative)', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click:500="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    // 每隔 400ms 点击一次，持续超过 3000ms，防抖定时器一直被重置
    for (let i = 0; i < 10; i++) {
      wrapper.trigger('click');
      jest.advanceTimersByTime(400);
    }

    // 累计时间 4000ms，maxWait 已禁用，不应有任何触发
    expect(handler).toHaveBeenCalledTimes(0);

    // 停止点击，等待防抖延迟结束，此时才触发一次
    jest.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ maxWait 禁用（makeDebounceClick(0)）：0 同样表示不需要最大等待时间
  it('does not fire based on maxWait when maxWait <= 0 (zero)', () => {
    const handler = jest.fn();
    const debounceClickNoMaxWait = makeDebounceClick(0);

    const wrapper = mount({
      directives: { debounceClickNoMaxWait },
      template: '<button v-debounce-click-no-max-wait:500="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    // 每隔 400ms 点击一次，持续超过 3000ms，防抖定时器一直被重置
    for (let i = 0; i < 10; i++) {
      wrapper.trigger('click');
      jest.advanceTimersByTime(400);
    }

    // 累计时间 4000ms，maxWait 已禁用，不应有任何触发
    expect(handler).toHaveBeenCalledTimes(0);

    // 停止点击，等待防抖延迟结束，此时才触发一次
    jest.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ✅ 卸载后不再触发
  it('cleans up on unmount', () => {
    const handler = jest.fn();

    const wrapper = mount({
      directives: { debounceClick },
      template: '<button v-debounce-click="onClick">btn</button>',
      setup: () => ({ onClick: handler }),
    });

    wrapper.trigger('click');
    wrapper.unmount();

    jest.advanceTimersByTime(300);
    expect(handler).toHaveBeenCalledTimes(0);
  });
});
