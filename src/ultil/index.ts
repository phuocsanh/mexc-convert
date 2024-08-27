export function containsDigitGreaterThanOrEqualTo2(input: string): boolean {
  for (let char of input) {
    const digit = parseInt(char, 10);
    if (!isNaN(digit) && digit >= 2) {
      return true;
    }
  }
  return false;
}
