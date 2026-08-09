# Trello board generation source

> ⚠️ **Generation source — keep until all batches (T001–T063) are created
> on the Trello board, then delete this directory.** The files are
> derivable again from `docs/spec.md` via the speckit/trello skills.

- `tasks.md` — the task breakdown (T001–T063) the trello-task skill reads.
- `trello-cards.md` — the full manifest of all 63 cards, with batch order,
  list assignments, labels, and estimates.

## How to create the next batch

1. Open `trello-cards.md`.
2. Find your batch (the file is organized by batch/phase).
3. Copy the batch's fenced `markdown` blocks — first line = card title,
   the rest = card description.
4. Paste each block into the Trello card composer.
5. Apply the `📋 Card setup` line manually (list, labels, estimate).

Batch → list mapping: batches 1–3 (T001–T023) → **To Do**; batches 4–10
(T024–T063) → **Backlog**.

Current board status is tracked on the Trello board itself, not here.
