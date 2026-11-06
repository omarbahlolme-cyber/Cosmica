/* Original subject symbols made from deterministic, path-batched star clusters. */
const NS = "http://www.w3.org/2000/svg", TAU = Math.PI * 2;
export const GALAXY_PALETTES = {
  languages: ["#ffad68", "#a73513", "#fff0d0"], science: ["#81dcf3", "#176c92", "#e8faff"], computing: ["#79b7ff", "#254fb6", "#d3edff"],
  engineering: ["#ff8d79", "#942a34", "#ffe0c5"], humanities: ["#e5bd70", "#97702b", "#fff3d2"], health: ["#c3b9ff", "#5f4cb4", "#f1eaff"],
  earth: ["#75e3c6", "#147569", "#d2fff1"], business: ["#edc38b", "#825325", "#fff0d5"], arts: ["#ecadfa", "#8c3c9a", "#ffe1fb"],
};
const point = (value) => Number(value.toFixed(2));
const polygon = (points, close = true) => points.map(([x, y], i) => `${i ? "L" : "M"}${point(x)} ${point(y)}`).join("") + (close ? "Z" : "");
const oval = (rx, ry, rotation = 0, cx = 0, cy = 0) => polygon(Array.from({ length: 90 }, (_, i) => {
  const t = i / 90 * TAU, x = Math.cos(t) * rx, y = Math.sin(t) * ry;
  return [cx + x * Math.cos(rotation) - y * Math.sin(rotation), cy + x * Math.sin(rotation) + y * Math.cos(rotation)];
}));
const gear = polygon(Array.from({ length: 48 }, (_, i) => {
  const angle = i / 48 * TAU - Math.PI / 2, radius = [53, 53, 68, 68, 53, 53][i % 6];
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}));
const SYMBOLS = {
  languages: { name: "translation-bubbles", paths: [
    "M-70-49H9Q21-49 21-37V7Q21 19 9 19H-31L-52 37V19H-70Q-82 19-82 7V-37Q-82-49-70-49Z",
    "M32-23H66Q79-23 79-10V35Q79 47 66 47H56V62L36 47H1Q-11 47-11 35V30",
    "M-60 5L-43-33L-26 5M-54-7H-32",
    "M32-7H62M47-16V-7M36-3Q41 17 64 30M59-3Q52 18 28 31",
  ] },
  science: { name: "atom", paths: [oval(76, 25), oval(76, 25, Math.PI / 3), oval(76, 25, -Math.PI / 3), oval(8, 8)] },
  computing: { name: "code-brackets", paths: ["M-34-43L-77 0L-34 43", "M34-43L77 0L34 43", "M19-54L-18 54"] },
  engineering: { name: "gear", paths: [gear, oval(24, 24)] },
  humanities: { name: "open-book", paths: [
    "M0-38C-23-55-48-58-75-46V39C-48 28-22 35 0 53C22 35 48 28 75 39V-46C48-58 23-55 0-38V53",
    "M-59-25Q-35-28-15-16M-59-5Q-35-8-15 4M-59 15Q-35 12-15 24",
    "M15-16Q35-28 59-25M15 4Q35-8 59-5M15 24Q35 12 59 15",
  ] },
  health: { name: "heart-pulse", paths: [
    "M0 58C-14 44-73 9-73-22C-73-60-23-69 0-35C23-69 73-60 73-22C73 9 14 44 0 58Z",
    "M-58-2H-30L-15-25L4 24L21-12H58",
  ] },
  earth: { name: "earth-globe", paths: [
    oval(63, 63),
    "M-47-40L-28-45L-12-35L-19-22L-8-9L-21 2L-40-5L-48-20L-60-19",
    "M-21 2L-6 12L-12 31L-26 52L-34 31L-31 13Z",
    "M3-52L15-40L33-44L48-28L59-13L42-4L25-12L15-4L18 13L2 27L-4 8L2-7L-7-17L6-32Z",
    "M37 28L54 24L57 38L42 45L32 39Z",
  ] },
  business: { name: "growth-chart", paths: [
    "M-72 50H78M-62 47V16H-37V47M-12 47V-7H13V47M38 47V-32H63V47",
    "M-71-9L-29-23L17-31L64-68M38-62L64-68L52-44",
  ] },
  arts: { name: "artist-palette", paths: [
    "M77-8C78-47 34-66-10-62C-57-59-82-23-77 13C-71 51-28 65 3 52C22 43-3 31 11 18C24 6 38 24 53 18C68 13 78 6 77-8Z",
    oval(10, 10, 0, -47, -7), oval(10, 10, 0, -27, -35), oval(10, 10, 0, 10, -43), oval(10, 10, 0, 44, -25),
  ] },
};
function element(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}
const dot = (x, y, radius) => {
  const r = point(radius);
  return `M${point(x - r)} ${point(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
};
const star = (x, y, r) => `M${point(x - r)} ${point(y)}l${point(r * .76)} ${point(-r * .24)}l${point(r * .24)} ${point(-r * .76)}l${point(r * .24)} ${point(r * .76)}l${point(r * .76)} ${point(r * .24)}l${point(-r * .76)} ${point(r * .24)}l${point(-r * .24)} ${point(r * .76)}l${point(-r * .24)} ${point(-r * .76)}Z`;
function randomSource(seed) {
  let value = seed | 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) | 0; return (value >>> 0) / 4294967296; };
}
const normal = (random) => Math.sqrt(-2 * Math.log(Math.max(.0001, random()))) * Math.cos(TAU * random());
function radial(id, color, stops) {
  const gradient = element("radialGradient", { id });
  stops.forEach(([offset, opacity]) => gradient.append(element("stop", { offset, "stop-color": color, "stop-opacity": opacity })));
  return gradient;
}
function clusterPaths(paths, random) {
  let fine = "", core = "", bright = "", dust = "", starCount = 0, anchorCount = 0;
  paths.forEach((d) => {
    // These paths only measure the design. The rendered symbol consists of stars.
    const contour = element("path", { d }), length = contour.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) throw new Error("Invalid subject cluster contour");
    const steps = Math.ceil(length / 2.5);
    for (let i = 0; i <= steps; i++) {
      const anchor = contour.getPointAtLength(i / steps * length);
      const x = anchor.x + normal(random) * .28, y = anchor.y + normal(random) * .28;
      core += dot(x, y, .55 + random() * .35); starCount++;
      for (let grain = 0; grain < 3; grain++) {
        fine += dot(x + normal(random) * 2.3, y + normal(random) * 2.3, .22 + random() * .40); starCount++;
      }
      if (anchorCount % 5 === 0) dust += dot(x + normal(random) * 1.5, y + normal(random) * 1.5, 3 + random() * 2.5);
      if (anchorCount % 17 === 0) { bright += star(x, y, 1.55 + random() * .9); starCount++; }
      anchorCount++;
    }
  });
  return { fine, core, bright, dust, starCount };
}
export function createSubjectGalaxy(id, metadata, prefix) {
  const symbol = SYMBOLS[id];
  if (!symbol) throw new Error("Unknown subject galaxy: " + id);
  const [accent, shadow, coreColor] = GALAXY_PALETTES[id], random = randomSource(metadata.seed || 12);
  const svg = element("svg", { class: "cs-galaxy-art", viewBox: "-130 -90 260 180", "aria-hidden": "true", focusable: "false", preserveAspectRatio: "xMidYMid meet", "data-subject-symbol": symbol.name, xmlns: NS });
  const defs = element("defs"), haloId = `${prefix}-${id}-halo`, cloudId = `${prefix}-${id}-cloud`;
  defs.append(radial(haloId, accent, [[0,.32],[.4,.12],[1,0]]), radial(cloudId, shadow, [[0,.36],[.5,.12],[1,0]])); svg.append(defs);
  const approach = element("g", { class: "cs-galaxy-approach" });
  const halo = element("ellipse", { cx: 0, cy: 0, rx: 125, ry: 84, fill: `url(#${haloId})` });
  const rotor = element("g", { class: "cs-galaxy-rotor" });
  rotor.append(element("ellipse", { cx: -17, cy: 9, rx: 110, ry: 61, fill: `url(#${cloudId})`, transform: "rotate(-23)" }));
  let field = "", arms = "";
  for (let i = 0; i < 280; i++) {
    const angle = random() * TAU, radius = 30 + Math.sqrt(random()) * 94;
    field += dot(Math.cos(angle) * radius, Math.sin(angle) * radius * .61, .18 + random() * .4);
  }
  for (let i = 0; i < 200; i++) {
    const t = random(), arm = i % 2 ? Math.PI : 0, angle = arm + t * 2.5 + .6, radius = 68 + t * 48;
    arms += dot(Math.cos(angle) * radius + normal(random) * 4, Math.sin(angle) * radius * .56 + normal(random) * 3, .2 + random() * .45);
  }
  rotor.append(element("path", { d: field, fill: accent, opacity: .34 }), element("path", { d: arms, fill: accent, opacity: .38 }));
  const particles = clusterPaths(symbol.paths, random);
  const cluster = element("g", { class: "cs-subject-cluster", "data-star-count": particles.starCount });
  cluster.append(
    element("path", { d: particles.dust, fill: accent, opacity: .055 }),
    element("path", { d: particles.fine, fill: accent, opacity: .72 }),
    element("path", { d: particles.core, fill: accent, stroke: accent, "stroke-width": 2.8, opacity: .13 }),
    element("path", { d: particles.core, fill: coreColor, opacity: .94 }),
  );
  const shimmer = element("path", { d: particles.bright, fill: "#fff8ec", opacity: .9, class: "cs-cluster-shimmer" });
  cluster.append(shimmer);
  const marker = element("g", { opacity: 0, class: "cs-galaxy-focus-star" });
  marker.append(element("circle", { r: 6, fill: accent, opacity: .22 }), element("path", { d: star(0,0,3), fill: "#fff4d4" }));
  approach.append(halo, rotor, cluster, marker); svg.append(approach);
  return { id, form: symbol.name, svg, approach, rotor, halo, marker, shimmer, angle: (random() - .5) * 12 };
}
