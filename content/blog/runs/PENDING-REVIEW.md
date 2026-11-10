# One post out for review

`how-long-iso-9001-certification-takes` was approved on 2026-11-10 and
published by the watcher unassisted: it classified the reply, flipped the
status, committed `74ad2cb` and pushed. That was the first delivery either
scheduled task had made in over a week.

The watcher is now pointed at the remaining draft.

| Post | Thread | Sent | State |
|---|---|---|---|
| `what-an-iso-9001-auditor-opens-first` | `1a1c61587c009f19` | 2026-11-10 | **awaiting review, watched** |
| `how-long-iso-9001-certification-takes` | `1a1c616385adf0bb` | 2026-11-10 | published |

Reply APPROVE on that thread and the next tick publishes it, within 30 minutes.

## Two things a later reader should know

**The state file holds one post, not a list.** `awaiting` is a single object
and every consumer — `shouldCheck`, `decideWeeklyRun`, the watcher's classify
step — reads it as one. While both posts were out, only one could be watched.
The weekly task's own `release` state already describes leaving an older draft
pending while a newer one goes out on its own thread, so the prose contemplates
a backlog the data structure cannot represent. Making `awaiting` an array is
the fix; it touches the state module and both scheduled tasks together.

**While a post is awaiting review, Monday holds.** With this one armed and
sent today, `decideWeeklyRun` returns `hold` on 16 November — six days, inside
`STALE_AFTER_DAYS`. So answering this thread also unblocks next week's post. If
it is going to go unanswered, clearing the state is better than leaving it:

```
node --input-type=module -e "
import { writeState } from './scripts/blog-review-state.mjs';
writeState({ awaiting: null });
"
```

Delete this file once the draft is resolved.
