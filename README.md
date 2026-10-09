# Visitify Dashboard

Interactive prospect dashboard for Visitify, powered by Kamana. Built with Vite, React, TypeScript, Tailwind CSS and shadcn/ui-style components.

## Pages

Laid out like the **Layout** sheet: logo top-left, "Powered by Kamana" beneath it, and the three tabs on the row to its right.

| Tab | Source sheet | Columns |
| --- | --- | --- |
| Restaurants | `Restuarants` | Chain, Photo verdict, Sale difficulty, What recent photos show, Approx. US units, Segment, Why now / Vistify angle, Source / note |
| Contact Info | `ContactInfo` | Company, Contact Name, Title, Email, Phone |
| Sample Emails | `SampleEmails` | Brand, Email |

The bottom-right **Read Me | Checked & Dropped** button opens the two hidden sheets in a side drawer.

### Everything is linked

- Click a **restaurant name** (or "N contacts →") → jumps to **Contact Info** and highlights that company's contacts.
- "Sample email →" jumps to **Sample Emails** and highlights that brand's email.
- Company names in Contact Info and Sample Emails link back to the restaurant row.
- A banner on the target tab explains the highlight and offers **Back to …** / **Clear**.
- The stat cards and the verdict / difficulty bars are clickable filters.
- Search, filter, sort (column headers) and **Export** (CSV of the current rows) on every table.

## Data

All values come from `data/Vistify_Top15_Photo_Checked.xlsx`. To refresh after the sheet changes:

```bash
npm run data               # re-reads data/Vistify_Top15_Photo_Checked.xlsx → src/data/vistify.json
npm run data path/to.xlsx  # or point at another copy
```

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Structure

```
src/components/ui/         shadcn primitives + data-table (adapted from datatable-1), toolbar, pagination
src/components/dashboard/  stat cards, distribution bars, badges, focus banner …
src/features/              one file per tab + the hidden-pages drawer
src/lib/                   data helpers, tab/highlight navigation, tones, csv, toast
```

## Notes

- Colours come from the Kamana OS Dashboard: teal-green `#009b9b` / `#007b7d`, soft green `#eaf8f7` for highlights, white cards on `#f4f7f7`. Tokens live in `src/index.css`.
- `src/components/visitify-logo.tsx` is a placeholder for the "Visitify Logo" cell — replace it with the real logo.
