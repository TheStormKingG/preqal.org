# UNDELIVERED

A blog post is committed and pushed but the review email was never sent.
Nothing is waiting on the reviewer, because the reviewer was never asked.

- **Slug:** `what-an-iso-9001-auditor-opens-first`
- **Title:** What an ISO 9001 auditor opens first in Guyana | Preqal
- **Status:** `draft` in `content/blog/index.json` — not live, not in the
  sitemap, not in the prerender list
- **Commit:** `dcdf328`, pushed to `origin/master`
- **Run date:** 2026-11-02 (fired 09:06 GYT); delivery attempted 2026-11-04
- **Review state:** NOT written. `content/blog/runs/review-state.json` still
  reads `{"awaiting": null}` on purpose. Arming the watcher for a thread that
  does not exist would make it poll for a reply that can never arrive and
  block next week behind a review that cannot complete.

## The email that should have gone out

The full body is committed at `content/blog/runs/2026-W45/review-email.txt`.
Send it to stefan.gravesande@gmail.com with the subject:

    Preqal blog draft — What an ISO 9001 auditor opens first

## The denial, verbatim

Two tools on the Gmail connector were tried, in this order. Both returned the
same refusal.

`mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__send_message`:

> Permission to use mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__send_message has
> been denied because Claude Code is running in don't ask mode.

`mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__create_draft`:

> Permission to use mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__create_draft has
> been denied because Claude Code is running in don't ask mode.

The connector itself is fine. Its read tools loaded normally at STEP 0. What
is blocked is the write, and it is blocked by the session's permission mode,
not by Gmail.

## To clear this

From an interactive session, with the Gmail connector allowed to send:

1. Read `content/blog/runs/2026-W45/review-email.txt`.
2. Send it to stefan.gravesande@gmail.com under the subject above.
3. Record the state so the watcher picks it up, using the real thread id:

```
node --input-type=module -e "
import { writeState } from './scripts/blog-review-state.mjs';
writeState({ awaiting: { slug: 'what-an-iso-9001-auditor-opens-first', threadId: '<threadId>', sentAt: new Date().toISOString(), revision: 1 } });
"
```

4. Delete this file.

Until step 3 runs, the weekly task will see nothing awaiting review and will
write a new post next Monday. That is the correct behaviour: this draft is not
blocking anything, it is simply unread.

## One thing the reviewer should know before reading

The post carries `AI-DETECTION: UNVERIFIED`. The single reading was 42.8% and
the gate requires a final under 40 with a 30-point drop, so the post is held on
that ground independently of the delivery failure. Neither ZeroGPT control
could be run: `content/blog/knowledge-base/control-machine.txt` does not exist
in this repository, and a known-human control could not be extracted from
`data/guides.tsx`. The email explains both at length.
