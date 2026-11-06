/* Original deep-space scenery: cached vector background and composited starlight. */
const NS = "http://www.w3.org/2000/svg", TAU = Math.PI * 2;
const n = (value) => Number(value.toFixed(2));
function element(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}
function randomSource(seed) {
  let value = seed | 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) | 0; return (value >>> 0) / 4294967296; };
}
const normal = (random) => Math.sqrt(-2 * Math.log(Math.max(.0001, random()))) * Math.cos(TAU * random());
const dot = (x, y, radius) => {
  const r = n(radius);
  return `M${n(x-r)} ${n(y)}a${r} ${r} 0 1 0 ${r*2} 0a${r} ${r} 0 1 0 ${-r*2} 0`;
};
function radial(id, color, stops) {
  const node = element("radialGradient", { id });
  stops.forEach(([offset, opacity]) => node.append(element("stop", { offset, "stop-color": color, "stop-opacity": opacity })));
  return node;
}
function glow(cx, cy, rx, ry, id, extra = {}) {
  return element("ellipse", { cx: n(cx), cy: n(cy), rx: n(rx), ry: n(ry), fill: `url(#${id})`, ...extra });
}
export function createSpaceBackdrop(host, prefix, { compact = false } = {}) {
  const random = randomSource(64191), root = element("g", { class: "cs-space-backdrop", "data-depth-layers": 3 });
  const defs = element("defs"), cloudIds = ["blue", "violet", "cyan", "rose"].map((name) => `${prefix}-space-${name}`);
  ["#294f8c", "#5a3f8b", "#285b70", "#754258"].forEach((color, i) => {
    defs.append(radial(cloudIds[i], color, [[0,.44],[.32,.22],[.68,.07],[1,0]]));
  });
  const darkId = `${prefix}-space-dust`, shadeId = `${prefix}-space-shade`;
  defs.append(
    radial(darkId, "#020611", [[0,.67],[.4,.4],[1,0]]),
    radial(shadeId, "#01030a", [[0,.82],[.45,.45],[1,0]]),
  );
  root.append(defs, element("rect", { width: 1440, height: 900, fill: "#030611" }));

  const nebula = element("g", { class: "cs-space-nebula" });
  for (let i = 0; i < 22; i++) {
    const t = i / 21, x = -70 + t * 1580 + normal(random) * 17, y = 835 - t * 790 + Math.sin(t * TAU) * 95 + normal(random) * 20;
    const rx = 125 + random() * 120, ry = 38 + random() * 65;
    nebula.append(glow(x, y, rx, ry, cloudIds[i % 4], { transform: `rotate(-27 ${n(x)} ${n(y)})`, opacity: .35 + random() * .55 }));
    if (i % 2 === 0) {
      const dustX = x + normal(random) * 25, dustY = y + normal(random) * 30;
      nebula.append(glow(dustX, dustY, rx * .67, ry * .55, darkId, { transform: `rotate(-30 ${n(dustX)} ${n(dustY)})` }));
    }
  }
  for (let i = 0; i < 26; i++) {
    const t = random(), x = 60 + t * 1320 + normal(random) * 42, y = 810 - t * 770 + Math.sin(t * TAU) * 95 + normal(random) * 58;
    nebula.append(glow(x, y, 28 + random() * 85, 15 + random() * 42, cloudIds[i % 4], { opacity: .18 + random() * .22 }));
  }
  root.append(nebula);

  const layers = [], counts = compact ? [1050, 310, 19] : [1550, 460, 29];
  let starCount = 0;
  counts.slice(0, 2).forEach((count, layerIndex) => {
    const layer = element("g", { class: "cs-space-star-layer", "data-depth": layerIndex });
    let cool = "", warm = "";
    for (let i = 0; i < count; i++) {
      const x = -14 + random() * 1468, y = -14 + random() * 928;
      const radius = layerIndex ? .48 + random() * .43 : .19 + random() * .37;
      const particle = dot(x, y, radius);
      if (i % 9 === 0) warm += particle; else cool += particle;
    }
    layer.append(element("path", { d: cool, fill: layerIndex ? "#c6def8" : "#9bb7dd", opacity: layerIndex ? .74 : .48 }),
      element("path", { d: warm, fill: "#f1dfca", opacity: layerIndex ? .68 : .43 }));
    root.append(layer); layers.push(layer); starCount += count;
  });

  // Fine, irregular concentrations follow the cloud band, rather than a grid.
  let galacticDust = "";
  const dustCount = compact ? 480 : 760;
  for (let i = 0; i < dustCount; i++) {
    const t = random(), x = -40 + t * 1540 + normal(random) * 35, y = 845 - t * 815 + Math.sin(t * TAU) * 95 + normal(random) * 49;
    galacticDust += dot(x, y, .18 + random() * .32);
  }
  root.append(element("path", { d: galacticDust, fill: "#d4cbea", opacity: .4 })); starCount += dustCount;

  // Keep the large SVG painting static. Small HTML stars can twinkle in their
  // own compositor layers without repainting every cloud and distant star.
  const near = document.createElement("div"), twinkles = [];
  near.className = "cs-space-star-layer cs-space-near-layer";
  near.setAttribute("aria-hidden", "true");
  near.dataset.depth = "2";
  Object.assign(near.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "1", overflow: "hidden" });
  for (let i = 0; i < counts[2]; i++) {
    const x = 15 + random() * 1410, y = 15 + random() * 870, r = .85 + random() * .62;
    const star = document.createElement("span");
    Object.assign(star.style, { position: "absolute", left: `${n(x / 1440 * 100)}%`, top: `${n(y / 900 * 100)}%`, width: `${n(r * 13)}px`, height: `${n(r * 13)}px`, transform: "translate(-50%,-50%)", opacity: ".8", willChange: "opacity", pointerEvents: "none", background: `radial-gradient(circle,${i % 5 ? "#e4efff" : "#ffe5c3"} 0 6%,#b7d7ff66 9%,#accfff18 25%,transparent 68%)` });
    if (i % 3 === 0) {
      const glint = document.createElement("span");
      Object.assign(glint.style, { position: "absolute", inset: "20%", background: "linear-gradient(90deg,transparent 45%,#c5ddf677 50%,transparent 55%),linear-gradient(transparent 45%,#c5ddf677 50%,transparent 55%)" });
      star.append(glint);
    }
    near.append(star); twinkles.push({ node: star, phase: random() * TAU });
  }
  layers.push(near); starCount += counts[2];
  // Keep the heading's reading area calm while leaving the symbols in front.
  root.append(glow(125, 155, 570, 380, shadeId));
  // A generated SVG background image is cached by the browser independently of
  // the animated foreground. Keeping thousands of SVG particles inline caused
  // the entire cloud field to repaint whenever a nearby symbol animated.
  const image = element("svg", { xmlns: NS, viewBox: "0 0 1440 900", width: 1440, height: 900 });
  image.append(root);
  const source = new XMLSerializer().serializeToString(image);
  host.classList.add("cs-space-backdrop");
  host.dataset.depthLayers = "3";
  Object.assign(host.style, { backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", willChange: "transform" });
  let lastStep = -1;
  return {
    starCount,
    layerCount: layers.length,
    nearLayer: near,
    draw(elapsed) {
      // Slow background drift needs fewer updates than foreground interaction.
      const step = Math.floor(elapsed * 15);
      if (step === lastStep) return;
      lastStep = step;
      host.style.transform = `translate3d(${n(Math.sin(elapsed * .035) * 1.5)}px,${n(Math.cos(elapsed * .03) * 1.5)}px,0) scale(1.01)`;
      twinkles.forEach(({ node, phase }) => { node.style.opacity = (.69 + Math.sin(elapsed * .55 + phase) * .19).toFixed(3); });
    },
    destroy() { near.remove(); },
  };
}
