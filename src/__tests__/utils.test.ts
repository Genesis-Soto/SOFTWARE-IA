import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const condition = false;
    expect(cn('base', condition && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('merges conflicting tailwind color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('merges conflicting tailwind spacing classes', () => {
    expect(cn('mt-2', 'mt-4')).toBe('mt-4');
  });
});
