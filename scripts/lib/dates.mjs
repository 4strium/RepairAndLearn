import config from "../../src/site.config.mjs";

const { locale, timezone } = config;

/**
 * Les dates saisies dans les fichiers de contenu sont « murales » (heure de Paris),
 * sans fuseau : "2026-11-14 14:00". On les convertit ici en instant absolu,
 * en tenant compte de l'heure d'été / d'hiver.
 */
export function parisToDate(input) {
  const m = String(input)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) throw new Error(`Date invalide : "${input}" (attendu : AAAA-MM-JJ HH:mm)`);
  const [, y, mo, d, h = "00", mi = "00"] = m;
  const asUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  // Décalage de Paris à cet instant (approximation puis correction).
  let guess = asUtc - offsetMinutes(new Date(asUtc)) * 60000;
  guess = asUtc - offsetMinutes(new Date(guess)) * 60000;
  return new Date(guess);
}

function offsetMinutes(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

const fmt = (opts) => new Intl.DateTimeFormat(locale, { timeZone: timezone, ...opts });

const f = {
  full: fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  long: fmt({ day: "numeric", month: "long", year: "numeric" }),
  dayMonth: fmt({ weekday: "long", day: "numeric", month: "long" }),
  day: fmt({ day: "numeric" }),
  month: fmt({ month: "short" }),
  year: fmt({ year: "numeric" }),
  time: fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatFull = (d) => cap(f.full.format(d));
export const formatLong = (d) => f.long.format(d);
export const formatDayMonth = (d) => cap(f.dayMonth.format(d));
export const formatDay = (d) => f.day.format(d);
export const formatMonthShort = (d) => f.month.format(d).replace(".", "");
export const formatYear = (d) => f.year.format(d);

/** "14h00" */
export function formatTime(d) {
  return f.time.format(d).replace(":", "h");
}

/** Pour les guides : "2026-10-12" -> Date (midi UTC pour éviter tout décalage de jour). */
export function dateOnly(input) {
  const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) throw new Error(`Date invalide : "${input}" (attendu : AAAA-MM-JJ)`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
}

export const formatGuideDate = (d) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(d);
