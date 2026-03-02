/**
 * 兼容性处理，Symbol 在 IE 中不支持，使用字符串代替
 * @param directiveName - 指令名称
 * @returns - 指令唯一键
 */
export const getDirectiveKey = (directiveName: string) => {
  if (typeof Symbol === 'function') {
    return Symbol(directiveName);
  }

  return `__${directiveName}__`;
};
