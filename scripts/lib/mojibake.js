const CP1252_BYTE_BY_CHAR = Object.freeze({
  "\u20AC": 0x80,
  "\u201A": 0x82,
  "\u0192": 0x83,
  "\u201E": 0x84,
  "\u2026": 0x85,
  "\u2020": 0x86,
  "\u2021": 0x87,
  "\u02C6": 0x88,
  "\u2030": 0x89,
  "\u0160": 0x8a,
  "\u2039": 0x8b,
  "\u0152": 0x8c,
  "\u017D": 0x8e,
  "\u2018": 0x91,
  "\u2019": 0x92,
  "\u201C": 0x93,
  "\u201D": 0x94,
  "\u2022": 0x95,
  "\u2013": 0x96,
  "\u2014": 0x97,
  "\u02DC": 0x98,
  "\u2122": 0x99,
  "\u0161": 0x9a,
  "\u203A": 0x9b,
  "\u0153": 0x9c,
  "\u017E": 0x9e,
  "\u0178": 0x9f,
});

const toUnicodeEscape = (char) =>
  `\\u${char.codePointAt(0).toString(16).padStart(4, "0").toUpperCase()}`;

const MOJIBAKE_TRAIL_CLASS = [
  "\\u0080-\\u00BF",
  ...Object.keys(CP1252_BYTE_BY_CHAR).map((char) => toUnicodeEscape(char)),
].join("");

const MOJIBAKE_SEGMENT_RE = new RegExp(`(?:[\\u00C2-\\u00F4][${MOJIBAKE_TRAIL_CLASS}]{1,3})+|\\uFFFD`, "g");
const LIKELY_MOJIBAKE_RE = new RegExp(MOJIBAKE_SEGMENT_RE.source);

const findLikelyMojibakeMatches = (value) =>
  String(value || "").match(MOJIBAKE_SEGMENT_RE) || [];

const hasLikelyMojibake = (value) => findLikelyMojibakeMatches(value).length > 0;

const countLikelyMojibake = (value) => findLikelyMojibakeMatches(value).length;

const decodeMojibakeSegment = (segment) => {
  const bytes = [];
  for (const char of String(segment || "")) {
    if (char === "\uFFFD") {
      return segment;
    }
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }
    const cp1252Byte = CP1252_BYTE_BY_CHAR[char];
    if (typeof cp1252Byte !== "number") {
      return segment;
    }
    bytes.push(cp1252Byte);
  }

  let repaired = "";
  try {
    repaired = Buffer.from(bytes).toString("utf8");
  } catch {
    return segment;
  }

  if (!repaired || repaired === segment || repaired.includes("\uFFFD")) {
    return segment;
  }

  return repaired;
};

const repairMojibake = (value) => {
  let text = String(value || "");

  for (let pass = 0; pass < 3; pass += 1) {
    if (!hasLikelyMojibake(text)) {
      break;
    }

    const repaired = text.replace(MOJIBAKE_SEGMENT_RE, (match) => {
      const candidate = decodeMojibakeSegment(match);
      if (!candidate || candidate === match) {
        return match;
      }
      return countLikelyMojibake(candidate) > countLikelyMojibake(match) ? match : candidate;
    });

    if (!repaired || repaired === text) {
      break;
    }

    text = repaired;
  }

  return text;
};

const repairDeepText = (value) => {
  if (typeof value === "string") {
    return repairMojibake(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => repairDeepText(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, repairDeepText(item)])
    );
  }
  return value;
};

module.exports = {
  LIKELY_MOJIBAKE_RE,
  findLikelyMojibakeMatches,
  hasLikelyMojibake,
  countLikelyMojibake,
  repairMojibake,
  repairDeepText,
};
