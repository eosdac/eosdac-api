import { isEmptyArray } from '../dto.utils';

describe('"DTO Utils" unit tests', () => {
  it('should return true for empty array', () => {
    const result = isEmptyArray([]);

    expect(result).toEqual(true);
  });

  it('should return false for empty array', () => {
    const result = isEmptyArray([1]);

    expect(result).toEqual(false);
  });

  it('should return false for non-array input', () => {
    const result = isEmptyArray(1);

    expect(result).toEqual(false);
  });
});
