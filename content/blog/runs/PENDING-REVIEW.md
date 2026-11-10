# One post out for review

| Post | Thread | Sent | State |
|---|---|---|---|
| `what-an-iso-9001-auditor-opens-first` | `1a1c61587c009f19` | 2026-11-10 | awaiting review, watched |
| `how-long-iso-9001-certification-takes` | `1a1c616385adf0bb` | 2026-11-10 | published |

Reply APPROVE on that thread and the next tick publishes it, within 30 minutes.

## The one-slot limit is fixed

`awaiting` is now a queue. It held a single post until 2026-11-10, when two
drafts were out at once and only one could be watched — a reply on the other
thread would have been seen by nothing. The weekly run's own `release` rule had
described that situation from the start ("send it on a NEW thread of its own,
leaving the older draft pending"), so the prose assumed a backlog the data
structure could not hold.

What changed:

- `awaiting` is an array. `readState` still reads the old single-object files,
  and `writeState` normalises on the way out, so nothing has to be migrated by
  hand and an old task prompt cannot revert the shape.
- Each queued post ages on its own clock. A draft that has gone quiet no longer
  silences one sent an hour ago — `shouldCheck` returns one entry per post.
- `addPending` / `resolvePending` / `updatePending` touch one slug. The watcher
  no longer clears the whole field to publish one post, which would have
  abandoned every other post out for review.
- `MAX_PENDING` (3) replaces the cap the single slot used to provide by
  accident. At capacity the weekly run escalates instead of releasing, so a
  reviewer who stops replying collects a chase rather than a post a week
  forever.
- `decideWeeklyRun` judges the queue by its OLDEST post, so a steady cadence of
  new drafts cannot keep an abandoned one permanently young.

Covered by `tests/unit/blogReviewQueue.test.ts`, including the legacy shape and
the case this came from: resolving one post leaves the other watched.

## Still true

While anything is awaiting review, Monday holds. Answering the thread above
also unblocks next week's post. To clear it deliberately:

```
node --input-type=module -e "
import { resolvePending } from './scripts/blog-review-state.mjs';
resolvePending('what-an-iso-9001-auditor-opens-first');
"
```

Delete this file once the draft is resolved.
