# 2026-W46 blog run — BLOCKED on repo writes, post is finished and parked here

The week produced a complete, gate-checked post. It could not be written into
the repository, because every write to the repo was denied by this session
permission mode. Nothing in the working tree was touched. Nothing was
committed and nothing was pushed.

This file is what an interactive session needs to land it.

## What is blocked, exactly

The `Write` tool was refused at three different repo paths:

- `content/blog/knowledge-base/control-machine.txt`
- `content/blog/runs/2026-W46/01-topic.json`
- `.blog-workspace/write-probe.txt` (gitignored scratch, still refused)

each with:

> Permission to use Write has been denied because Claude Code is running in
> don't ask mode.

A write to the session scratchpad succeeded, so the denial is scoped to the
repo rather than to the tool. `Bash` is also partly denied, by command shape
rather than wholesale: read-only `node` one-liners inside the repo ran fine,
while a loop with `sleep`, and any `node` script that called `writeFileSync`,
were refused. `WebFetch` and `WebSearch` were refused outright, in this
session and in both research subagents, which did their fetching through the
browser pane instead.

I did not route around this with shell redirection. Writing the file with
`cat > …` is the same act the `Write` denial refused, so doing it that way
would defeat the intent of the denial rather than work within it.

## Also worth knowing before you land it

`HEAD` is on `feat/qhse-control-page`, not `master`. The task commit step
pushes to `master`. Had the writes succeeded, the post would have been
committed onto the feature branch and would not have deployed. Check the
branch before you commit.

## Files to create

1. `content/blog/posts/how-long-iso-9001-certification-takes.json`
   from `how-long-iso-9001-certification-takes.json` in this directory.

2. `public/blog-figures/how-long-iso-9001-certification-takes/fig-1.svg`
   from `fig-1.svg` in this directory.

3. `content/blog/knowledge-base/control-machine.txt`
   from `control-machine.txt` in this directory. The AI-detection stage has
   required this known-machine control since the protocol was written and it
   has never existed on disk, which is why last week recorded both controls as
   impossible to run. It is deliberately corporate prose and it measured 100%.

4. The manifest row below, prepended to the `posts` array in
   `content/blog/index.json`.

## The manifest row — INCOMPLETE, needs a thumbnail

```json
{
  "slug": "how-long-iso-9001-certification-takes",
  "title": "How long ISO 9001 certification takes in Guyana | Preqal",
  "description": "Six to twelve months is what the national standards bureau tells companies to expect. Here is where those months go, and what stretches them to three years.",
  "published": "2026-11-09",
  "updated": "2026-11-09",
  "status": "draft",
  "topic": "quality-management",
  "readMinutes": 6,
  "ogImage": "PENDING — /blog-photos/how-long-iso-9001-certification-takes/<name>.<hash>-og.jpg",
  "thumbnail": {
    "src": "PENDING — blog-photos/how-long-iso-9001-certification-takes/<name>.<hash>",
    "alt": "PENDING"
  }
}
```

**Do not commit the row with `thumbnail` left as `PENDING`.**
`tests/unit/blogThumbnails.test.ts` fails the build when a post has no
thumbnail or names a file that is not on disk, so that placeholder blocks the
whole site deploy, not just this post.

## The photographs are the one piece of real work still outstanding

`content/blog/knowledge-base/imagery.md` requires two or three real
photographs per post plus a thumbnail. None were fetched, because
`scripts/fetch-blog-photo.mjs` has to write into `public/blog-photos/` and
that write is denied in the same way. `public/blog-photos/how-long-iso-9001-certification-takes/`
does not exist.

To finish, from a session that can write:

```
node scripts/fetch-blog-photo.mjs --slug how-long-iso-9001-certification-takes \
  --id photo-<id> --name <basename> --credit "<Photographer>" --page "<unsplash path>"
node scripts/make-og-crops.mjs how-long-iso-9001-certification-takes/<basename>
```

Then add two or three `photo` blocks to the post JSON and fill the thumbnail
row. The two rules that have each been broken once already still apply: no
white or Caucasian subjects, and look at every candidate on a contact sheet
before shipping it, because alt text is not a description.

Subjects that fit this particular argument, which is about elapsed time and
sustained work rather than paperwork: work in progress on a processing line,
a shift changeover, somebody writing up a record at a workstation, a small
management team going through figures together.

## Gates — what actually ran, and what it said

| Gate | Result |
|---|---|
| Topic (G1) | PASS. See `01-topic.json` content reproduced below. |
| Sources (G2) | **PASS WITH UNVERIFIED.** 14 OK, 0 MISSING, 2 UNVERIFIED. 9 distinct URLs for 16 claims, none over the 3-per-page cap. Both cluster edges declared. |
| Structure | PASS. 5 sections, 2 to 4 `p` blocks each, exactly 4 FAQs, all ids unique. |
| Voice (G4) | PASS on every hard counter. mean 14.9 words, 27.2% of sentences at 8 words or fewer, 0 sentences over 45 words. |
| AI detection (G5) | **UNVERIFIED in part, and the gate calibration is broken. See below.** |
| Figures (G6) | PASS. On-palette hexes only, no `class=`, 4,102 bytes, `viewBox` equals `width`/`height`, aspect 2.13, every number traced to the body or a claim. |
| Layout (G7) | NOT RUN. Needs the post on disk and a dev server. |
| Build (G8) | NOT RUN. Needs the post on disk. |

The two UNVERIFIED sources are both `www.iso.org/quality-management/iso-9001-2026`,
returning HTTP 403 to a scripted fetch. That is the exact refusal
`scripts/blog-verify-sources.mjs` documents in its own comments. It is not
evidence the quotes are wrong and not evidence they are right. The claims are
c12 and c13, and the two facts resting on them are the three-year transition
window to the new edition and the five-step transition description, both in
section 4.

## AI detection — read this before judging the post on a number

Path: `playwright-chromium-local`, driven serially, one fresh
`browser.newContext()` per probe. Instrument validated before any score was
believed: the page echoed the submitted text back, and its own result area
reported a character count equal to the submission, so the identity assertion
in protocol 6.3 passed at 0% drift. `98.4%` and `<1%` were confirmed to be
vendor marketing copy present on every result.

| Probe | Score | Verdict |
|---|---|---|
| control, known human (`data/guides.tsx`) | **82.2%** | AI/GPT Generated |
| control, known machine | **100%** | AI/GPT Generated |
| s1 | 72.5% | AI/GPT Generated |
| s2 | **UNVERIFIED** | 3 attempts, reproducible 60s timeout |
| s3 | 0% | Human written |
| s4 | 0% | Human written |
| s5 | 55.3% | AI/GPT Generated |

Two findings, and the second is the important one.

**The gate cannot be met as calibrated.** `humanize-gate.json` wants a final
score under 40, and it justifies that with "the founder's own prose scores 0
and genuinely corporate prose scores 100, so the detector discriminates".
That calibration no longer holds. Prose from `data/guides.tsx`, written by
Dr. Gravesande before this pipeline existed and already published on the site,
measured **82.2%** today. A threshold that fails the house voice is not
measuring the house voice.

**The readings are not stable across a single post.** Five sections written to
one contract in one sitting scored 72.5, UNVERIFIED, 0, 0 and 55.3. That
spread on deliberately homogeneous prose is a property of the instrument, not
of the writing.

So no rewrite rounds were run. Protocol 6.4 exists for exactly this case and
says a control that misbehaves makes the branch UNVERIFIED rather than a pass.
Chasing a sub-40 score here would have meant rewriting prose that is already
in voice, against a number that calls Stefan's own published writing 82.2%
machine. The honest status is **AI-DETECTION: UNVERIFIED — post held**, which
it is anyway on `status: "draft"`.

Worth a decision from the owner: either recalibrate `humanize-gate.json`
against a fresh measurement of the founder's own writing, or drop the absolute
threshold and keep only the relative one.

## Topic evidence (G1)

- Chosen: how long ISO 9001 certification takes in Guyana, stage by stage.
- Cluster: the ISO-9001-cost cluster, roughly 99 impressions across six
  phrasings, 0 clicks, from the figures carried in the task prompt
  (Google Search Console, 90 days to 2026-10-03; site totals 640 impressions,
  26 clicks, average position 15.3).
- `freshness: absent`. `content/seo/` does not exist in this checkout, so no
  search-console CSV backs those numbers on disk. They are reported as
  carried, not as current.
- Cannibalisation check against `/guides/iso-9001-cost-guyana/`: its four h2s
  are "Separate the three costs first", "What actually drives the price",
  "How Preqal prices it" and "Cheap paper versus a working system", so a cost
  post would have split the signal. Its only treatment of elapsed time is one
  FAQ, "How long does ISO 9001 certification take?", answered generally. This
  post answers that stage by stage and links up to the guide as hub.
- The protocol's four-week plan for this cluster listed "what the three bills
  actually are" and "how long each stage really takes". The first is already
  the guide's own opening h2, so the timeline was the remaining one.
- No overlap with the four existing posts.

## A standing fact correction, flagged not applied

The research found that the successor to the International Accreditation Forum
is **Global Accreditation Cooperation Incorporated, "Global ACI"**, at
global-aci.org, and not "GAC". The reported evidence is a line on
`https://www.iso.org/certification.html` reading that Global ACI has assumed
the former roles of the International Accreditation Forum and the
International Laboratory Accreditation Cooperation.

The global `CLAUDE.md` carries a standing "IAF to GAC" fix, and the post
published on 2026-10-22 is about this exact transition. I have not changed
anything on the strength of a subagent report, and this post does not rely on
the claim. It is worth verifying directly and then correcting in both places.
