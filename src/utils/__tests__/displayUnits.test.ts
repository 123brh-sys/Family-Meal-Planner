import { toDisplayQuantity } from '@/utils/displayUnits';

describe('toDisplayQuantity', () => {
  it('leaves metric quantities untouched when the system is metric', () => {
    expect(toDisplayQuantity(500, 'g', 'metric')).toEqual({ quantity: 500, unit: 'g' });
  });

  it('converts grams to ounces under a pound', () => {
    const { quantity, unit } = toDisplayQuantity(200, 'g', 'us');
    expect(unit).toBe('oz');
    expect(quantity).toBeCloseTo(7.05, 1);
  });

  it('converts to pounds once at least a pound', () => {
    const { quantity, unit } = toDisplayQuantity(1000, 'g', 'us');
    expect(unit).toBe('lb');
    expect(quantity).toBeCloseTo(2.2, 1);
  });

  it('converts ml to fl-oz under a cup', () => {
    const { quantity, unit } = toDisplayQuantity(100, 'ml', 'us');
    expect(unit).toBe('fl-oz');
    expect(quantity).toBeCloseTo(3.38, 1);
  });

  it('converts to cups once at least a cup', () => {
    const { quantity, unit } = toDisplayQuantity(500, 'ml', 'us');
    expect(unit).toBe('cup');
    expect(quantity).toBeCloseTo(2.11, 1);
  });

  it('passes through non-convertible units unchanged', () => {
    expect(toDisplayQuantity(2, 'cloves', 'us')).toEqual({ quantity: 2, unit: 'cloves' });
  });
});
