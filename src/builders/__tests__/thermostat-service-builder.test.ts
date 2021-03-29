import { getTemperatureFixer, MAX_TEMP, MIN_TEMP } from '../thermostat-service-builder';

describe('Thermostat service builder', () => {
  it('should fix the temperature', () => {
    const fixer = getTemperatureFixer(5, 40);
    expect(fixer(3)).toBe(MIN_TEMP);
    expect(fixer(43)).toBe(MAX_TEMP);
    expect(fixer(20)).toBe(20);
    expect(fixer(undefined)).toBe(MIN_TEMP);
  });
});
