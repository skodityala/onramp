import { bench, describe } from 'vitest';
import { checkAtomicity } from '../src/core/atomicity';

describe('checkAtomicity performance', () => {
  const short = 'Open the laptop.';
  const typical = 'Write a 5 page essay on WWI, due Friday.';
  const long = 'Write ' + 'x'.repeat(2000);

  bench('short input', () => { checkAtomicity(short, 30); });
  bench('typical assignment', () => { checkAtomicity(typical, 3600); });
  bench('long input (2000 chars)', () => { checkAtomicity(long, 3600); });
});
