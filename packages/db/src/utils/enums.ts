// TODO: Does not work as expected -- sets the varchar field length to the number of variants (not the intended behavior)
export function enumToPgEnum(
  enumeration: Record<string, string>,
): [string, ...string[]] {
  return Object.values(enumeration).map((value: string) => `${value}`) as [
    string,
    ...string[],
  ];
}
