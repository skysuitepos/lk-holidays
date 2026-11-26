# Sri Lankan Holidays API

A free, static JSON API for Sri Lankan public, bank and mercantile holidays and Poya days, one file per year.

## Usage

```
GET https://<username>.github.io/lk-holidays/{year}.json
```

```bash
curl https://<username>.github.io/lk-holidays/2026.json
```

```js
const year = 2026;
const res = await fetch(`https://<username>.github.io/lk-holidays/${year}.json`);
if (!res.ok) throw new Error(`No data for ${year}`); // 404 = year not published yet
const holidays = await res.json();
```

## Response

A JSON array, sorted by `start`:

```json
[
  {
    "uid": "sl_130",
    "summary": "Independence Day",
    "categories": ["Public", "Bank", "Mercantile"],
    "start": "2026-02-04",
    "end": "2026-02-05"
  }
]
```

| Field | Description |
|---|---|
| `uid` | Stable unique ID. Never reused; kept if dates are corrected. |
| `summary` | Holiday name. |
| `categories` | One or more of `Public`, `Bank`, `Mercantile`, `Poya`. |
| `start` | First day of the holiday (`YYYY-MM-DD`). |
| `end` | **Exclusive**: the day *after* the holiday (iCalendar all-day convention). |

## Availability

Served by GitHub Pages: free, CDN-backed, CORS-enabled, no API key. No SLA. Responses may be cached for up to ~10 minutes after an update. Years that are not published return a 404.

## Data accuracy

Poya days and religious holidays are announced by the Government of Sri Lanka and are sometimes revised. Please open an issue or pull request with a link to the official notice if you spot an error.

## Contributing

Edit or add `{year}.json`, then run `node scripts/validate.mjs` (Node 18+, no install needed). CI runs the same check on every pull request.

## License

Code: MIT. Data: CC0 (public domain dedication).
