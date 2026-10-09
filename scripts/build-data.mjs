// Reads data/Vistify_Top15_Photo_Checked.xlsx and writes src/data/vistify.json.
// Every value shown in the dashboard comes from that workbook.
// Usage: npm run data [path/to/workbook.xlsx]
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] ?? path.join(root, "data", "Vistify_Top15_Photo_Checked.xlsx");
const target = path.join(root, "src", "data", "vistify.json");

const text = (cell) => {
  let v = cell?.value;
  if (v == null) return "";
  if (typeof v === "object") v = v.text ?? v.result ?? (v.richText ? v.richText.map((r) => r.text).join("") : "");
  return String(v).replace(/\r/g, "").trim();
};

const wb = new ExcelJS.Workbook();
await wb.xlsx.read((await import("node:fs")).createReadStream(source));

const sheet = (name) => {
  const ws = wb.worksheets.find((w) => w.name.trim().toLowerCase() === name.toLowerCase());
  if (!ws) throw new Error(`Sheet "${name}" not found. Found: ${wb.worksheets.map((w) => w.name).join(", ")}`);
  return ws;
};

const rows = (ws) => {
  const out = [];
  ws.eachRow({ includeEmpty: true }, (row, n) => {
    const cells = [];
    for (let c = 1; c <= Math.max(ws.actualColumnCount, 8); c++) cells.push(text(row.getCell(c)));
    out.push({ n, cells });
  });
  return out;
};

// Restaurants: header in row 1, blank spacer rows allowed.
const restWs = sheet("Restuarants");
const restRows = rows(restWs);
const restHeader = restRows[0].cells.slice(0, 8);
const restaurants = restRows
  .slice(1)
  .filter((r) => r.cells[0])
  .map((r) => ({
    chain: r.cells[0],
    verdict: r.cells[1],
    difficulty: r.cells[2],
    photos: r.cells[3],
    units: r.cells[4],
    segment: r.cells[5],
    angle: r.cells[6],
    source: r.cells[7],
  }));
// The sheet keeps the label for the two hidden pages in a stray cell, e.g. "Read Me | Checked & Dropped".
const hiddenLabel =
  restRows.flatMap((r) => r.cells).find((c) => c.includes("|")) ?? "Read Me | Checked & Dropped";

// Contacts: header row 1, one contact per row, blank rows separate companies.
const contactRows = rows(sheet("ContactInfo"));
const contacts = contactRows
  .slice(1)
  .filter((r) => r.cells[0] && r.cells[1])
  .map((r) => ({
    company: r.cells[0],
    name: r.cells[1],
    title: r.cells[2],
    email: r.cells[3],
    phone: r.cells[4],
  }));

// Sample emails: no header. Brand/label in column A, email body in column C.
const emails = rows(sheet("SampleEmails"))
  .filter((r) => r.cells[2])
  .map((r) => ({ brand: r.cells[0], body: r.cells[2] }));

// Read Me: blank-line separated groups. First group = title + byline, then heading + lines.
const readMeLines = rows(sheet("Read Me")).map((r) => r.cells[0]);
const groups = [];
let current = [];
for (const line of readMeLines) {
  if (line) current.push(line);
  else if (current.length) (groups.push(current), (current = []));
}
if (current.length) groups.push(current);
const [head, ...rest] = groups;
const readMe = {
  title: head[0],
  byline: head[1] ?? "",
  sections: rest.map(([heading, ...lines]) => ({ heading, lines })),
};

// Checked & Dropped: header row 1.
const droppedRows = rows(sheet("Checked & Dropped"));
const dropped = droppedRows
  .slice(1)
  .filter((r) => r.cells[0])
  .map((r) => ({ chain: r.cells[0], verdict: r.cells[1], photos: r.cells[2] }));

const data = {
  sheets: { readMe: "Read Me", dropped: "Checked & Dropped" },
  hiddenLabel,
  headers: {
    restaurants: restHeader,
    contacts: contactRows[0].cells.slice(0, 5),
    dropped: droppedRows[0].cells.slice(0, 3),
  },
  restaurants,
  contacts,
  emails,
  readMe,
  dropped,
};

await writeFile(target, JSON.stringify(data, null, 2) + "\n");
console.log(
  `Wrote ${path.relative(root, target)}: ${restaurants.length} restaurants, ${contacts.length} contacts, ` +
    `${emails.length} emails, ${readMe.sections.length} read-me sections, ${dropped.length} dropped.`,
);
