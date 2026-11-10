# Two posts are out for review, and only one of them is watched

Both review emails were sent on 2026-11-10 from an interactive session, after
the permission fix. `UNDELIVERED.md` is gone: nothing is undelivered now.

| Post | Thread | Sent | Watched |
|---|---|---|---|
| `how-long-iso-9001-certification-takes` | `1a1c616385adf0bb` | 2026-11-10 | **yes** |
| `what-an-iso-9001-auditor-opens-first`  | `1a1c61587c009f19` | 2026-11-10 | **no** |

## Why only one

`review-state.json` holds a single `awaiting` object, not a list, and every
consumer reads `state.awaiting` as one post: `shouldCheck`, `decideWeeklyRun`,
and the watcher's own classify step. So the state machine cannot express a
two-post backlog, and arming it for both is not possible without changing
`scripts/blog-review-state.mjs` and the watcher task together.

The newer post is the watched one, on the reasoning that it is the email most
likely to be answered first. That is a guess about behaviour, not a rule.

## What that means in practice

A reply on the watched thread is picked up within 30 minutes and acted on.

**A reply on the auditor thread will not be noticed by anything.** If that one
is approved first, it needs a human to say so, or to re-point the state file at
its thread id:

```
node --input-type=module -e "
import { writeState } from './scripts/blog-review-state.mjs';
writeState({ awaiting: { slug: 'what-an-iso-9001-auditor-opens-first', threadId: '1a1c61587c009f19', sentAt: '2026-11-10T15:30:00.000Z', revision: 1 } });
"
```

## The underlying gap

A review queue that can hold two items and a state file that can hold one is a
mismatch that only shows up the first time delivery falls behind — which is
exactly when it is least welcome. The weekly task already anticipates two
outstanding posts in its `release` state ("send it on a NEW thread of its own,
leaving the older draft pending"), so the prose contemplates a backlog the data
structure cannot represent.

Making `awaiting` an array is the fix, and it touches the state module, the
weekly task and the watcher task together. Not done here, because it is a
change to a scheduled task's control flow and was not what the session was
asked for. Delete this file once both posts are resolved.
