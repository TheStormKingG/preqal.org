import { describe, it, expect } from 'vitest';
import { classifyReply, stripQuotedReply } from '../../scripts/blog-review-state.mjs';

/* Every review email we send ends with "Reply APPROVE to publish, or REJECT
   with what you want changed", and every mail client quotes the whole thing
   under the reply. So the quoted text reliably contains BOTH keywords.

   The classifier read a fixed 400-character window of the raw reply, which
   meant the verdict depended on how long the reviewer's signature happened to
   be: a long signature pushed the quote out of the window and the reply read
   as approve, a short one did not and the same word came back ambiguous. That
   is not a property of the reply at all. The cases below are the real shapes
   a reply arrives in. */

const QUOTE = `
On Tue, 10 Nov 2026 at 11:31 AM, Stefan Gravesande <
stefan.gravesande@gmail.com> wrote:

> This is the post Monday's scheduled run wrote. It is a day late because
> the run could not write to the repository or send mail - both refused by
> its permission mode - and it parked everything in a scratchpad that was due
> to be cleared. That is fixed now.
>
> Reply APPROVE to publish, or REJECT with what you want changed.
`;

/* Note the wrap: Gmail splits "On ... wrote:" across two lines when the
   address is long, so a single-line marker regex does not match it. The
   quoted-line filter is what actually carries these cases. */

describe('review reply classification', () => {
  const signatures: Array<[string, string]> = [
    ['no signature', 'Approve\n'],
    ['phone signature', 'Approve\n\nSent from my iPhone\n'],
    ['short signature', 'Approve\n\nRegards,\nStefan\n'],
    [
      'full desktop signature',
      "Approve\n\n  Regards,\n\n  Dr. Gravesande <http://www.linkedin.com/in/drgravesande>\n\n[image: Dr. Gravesande's LinkedIn Profile]\n<http://www.linkedin.com/in/drgravesande>\n",
    ],
  ];

  for (const [name, sig] of signatures) {
    it(`a one-word approval is an approval — ${name}`, () => {
      expect(classifyReply(sig + QUOTE).verdict).toBe('approve');
    });
  }

  it('the verdict does not depend on signature length', () => {
    const verdicts = signatures.map(([, sig]) => classifyReply(sig + QUOTE).verdict);
    expect(new Set(verdicts).size, `got ${verdicts.join(', ')}`).toBe(1);
  });

  it('a rejection under a quote is still a rejection', () => {
    const r = classifyReply('REJECT: tighten the opening' + QUOTE);
    expect(r.verdict).toBe('reject');
    // The instructions must not carry the quoted original back into the task.
    expect(r.instructions).toBe('REJECT: tighten the opening');
    expect(r.instructions).not.toContain('Reply APPROVE');
  });

  /* The guard this fix must not break: an edit request riding on the word
     approve is consent to nothing. It has to stay ambiguous. */
  it('approval carrying a change request is still ambiguous', () => {
    expect(classifyReply('Approve but change the title' + QUOTE).verdict).toBe('ambiguous');
  });

  it('a reply that is only the quoted original is empty, not an approval', () => {
    expect(classifyReply(QUOTE).verdict).toBe('ambiguous');
  });

  it('strips the quote without eating the reply', () => {
    expect(stripQuotedReply('Approve' + QUOTE)).toBe('Approve');
  });
});
