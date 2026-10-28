/**
 * @Description Joins the truthy class names into one className string
 * @param classList
 */
export const classNames = (...classList: (string | false | null | undefined)[]): string =>
  classList.filter((className) => Boolean(className)).join(' ');
