import { formatRelativeDay, greeting } from '@/lib/greeting';

function at(hour: number, minute = 0): Date {
  return new Date(2026, 9, 15, hour, minute); // Oct 15 2026, local time
}

describe('greeting', () => {
  it('says good morning before noon', () => {
    expect(greeting(at(0))).toBe('Good morning');
    expect(greeting(at(11, 59))).toBe('Good morning');
  });

  it('says good afternoon from noon to 5pm', () => {
    expect(greeting(at(12))).toBe('Good afternoon');
    expect(greeting(at(16, 59))).toBe('Good afternoon');
  });

  it('says good evening from 5pm onwards', () => {
    expect(greeting(at(17))).toBe('Good evening');
    expect(greeting(at(23, 59))).toBe('Good evening');
  });
});

describe('formatRelativeDay', () => {
  const now = at(15, 30);

  it('labels the same day as Today', () => {
    expect(formatRelativeDay(at(10, 24).toISOString(), now)).toMatch(/^Today, \d{1,2}:\d{2} [AP]M$/);
  });

  it('labels the previous day as Yesterday', () => {
    const yesterday = new Date(2026, 9, 14, 16, 2);
    expect(formatRelativeDay(yesterday.toISOString(), now)).toMatch(/^Yesterday, \d{1,2}:\d{2} [AP]M$/);
  });

  it('falls back to month and day for older dates', () => {
    const older = new Date(2026, 9, 3, 9, 15);
    expect(formatRelativeDay(older.toISOString(), now)).toMatch(/^Oct 3, \d{1,2}:\d{2} [AP]M$/);
  });
});
