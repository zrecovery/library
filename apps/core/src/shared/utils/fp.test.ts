import { describe, expect, test } from "bun:test";
import { compose, memoize, pipe } from "./fp";

describe("fp utilities", () => {
  describe("pipe", () => {
    test("should pipe value through functions", () => {
      const result = pipe(
        1,
        (x) => x + 1,
        (x) => x * 2,
      );
      expect(result).toBe(4);
    });

    test("should handle single function", () => {
      const result = pipe(5, (x) => x * 2);
      expect(result).toBe(10);
    });

    test("should handle empty functions array", () => {
      const result = pipe(3, ...[]);
      expect(result).toBe(3);
    });
  });

  describe("compose", () => {
    test("should compose functions from right to left", () => {
      const addOne = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const composed = compose(double, addOne);
      expect(composed(3)).toBe(8); // (3 + 1) * 2 = 8
    });

    test("should compose multiple functions", () => {
      const addOne = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const subtractThree = (x: number) => x - 3;
      const composed = compose(subtractThree, double, addOne);
      expect(composed(5)).toBe(9); // ((5 + 1) * 2) - 3 = 9
    });
  });

  describe("memoize", () => {
    test("should memoize function results", () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };
      const memoized = memoize(fn);

      memoized(5);
      memoized(5);
      memoized(5);

      expect(callCount).toBe(1);
    });

    test("should return different results for different arguments", () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };
      const memoized = memoize(fn);

      memoized(5);
      memoized(10);

      expect(callCount).toBe(2);
    });

    test("should handle object arguments", () => {
      let callCount = 0;
      const fn = (obj: { value: number }) => {
        callCount++;
        return obj.value * 2;
      };
      const memoized = memoize(fn);

      memoized({ value: 5 });
      memoized({ value: 5 });

      // Note: JSON.stringify will serialize both as {"value":5}
      expect(callCount).toBe(1);
    });
  });
});
