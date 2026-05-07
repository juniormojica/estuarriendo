import { describe, expect, it } from 'vitest';
import { safeParseDraft } from './draftStorage';

describe('safeParseDraft', () => {
  it('returns fallback for missing input', () => {
    const fallback = { step: 1 };
    expect(safeParseDraft(null, fallback)).toEqual(fallback);
  });

  it('returns fallback for malformed json', () => {
    const fallback = { step: 1 };
    expect(safeParseDraft('{bad', fallback)).toEqual(fallback);
  });

  it('returns fallback for primitive json', () => {
    const fallback = { step: 1 };
    expect(safeParseDraft('"text"', fallback)).toEqual(fallback);
    expect(safeParseDraft('123', fallback)).toEqual(fallback);
    expect(safeParseDraft('true', fallback)).toEqual(fallback);
    expect(safeParseDraft('null', fallback)).toEqual(fallback);
  });

  it('returns fallback for array json', () => {
    const fallback = { step: 1 };
    expect(safeParseDraft('[1,2,3]', fallback)).toEqual(fallback);
  });

  it('returns parsed object for valid object json', () => {
    const fallback = { step: 1 };
    const parsed = safeParseDraft<{ step: number; data?: string }>('{"step":3,"data":"ok"}', fallback);
    expect(parsed).toEqual({ step: 3, data: 'ok' });
  });
});
