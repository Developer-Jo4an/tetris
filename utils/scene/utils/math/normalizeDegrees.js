export default function normalizeDegrees(value) {
  value = value % 360;

  if (value < 0)
    value += 360;

  return value;
}
