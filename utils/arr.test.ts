import { mapOrder, removeDuplicateFromArray } from './arr';

describe('mapOrder', () => {
  it('returns empty array if input array is empty', () => {
    expect(mapOrder([], ['a', 'b'])).toEqual([]);
  });

  it('returns original array if order is empty', () => {
    expect(mapOrder(['x', 'y'], [])).toEqual(['x', 'y']);
  });

  it('uses default parameters when no args passed', () => {
    expect(mapOrder()).toEqual([]);
  });

  it('uses default order param when only arr is passed', () => {
    expect(mapOrder(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('sorts correctly when both elements are in order map', () => {
    expect(mapOrder(['b', 'a'], ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('sorts correctly when only "a" exists in order map', () => {
    expect(mapOrder(['a', 'x'], ['a'])).toEqual(['a', 'x']);
  });

  it('sorts correctly when only "b" exists in order map', () => {
    expect(mapOrder(['x', 'a'], ['a'])).toEqual(['x', 'a']);
  });

  it('sorts correctly when neither element exists in order map', () => {
    expect(mapOrder(['x', 'y'], ['z'])).toEqual(['x', 'y']);
  });
});

describe('removeDuplicateFromArray', () => {
  it('removes duplicate numbers', () => {
    const result = removeDuplicateFromArray([1, 2, 2, 3]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('removes duplicate strings', () => {
    const result = removeDuplicateFromArray(['a', 'b', 'a']);
    expect(result).toEqual(['a', 'b']);
  });

  it('handles empty array', () => {
    const result = removeDuplicateFromArray([]);
    expect(result).toEqual([]);
  });

  it('handles single-element array', () => {
    const result = removeDuplicateFromArray([42]);
    expect(result).toEqual([42]);
  });

  it('handles mixed types (1 and "1") as unique', () => {
    const result = removeDuplicateFromArray([1, '1', 1, '1']);
    expect(result).toEqual([1, '1']);
  });
});
