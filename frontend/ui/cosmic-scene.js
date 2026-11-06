import { createSpaceBackdrop } from "./space-backdrop.js";
import { createSubjectGalaxy as makeGalaxy, GALAXY_PALETTES as PALETTES } from "./subject-star-clusters.js";
/* Interactive galaxy navigation. Illustration is SVG; destinations remain HTML controls. */
const TAU = Math.PI * 2;
let sceneSequence = 0;
const POSITIONS = { languages: [69, 46], science: [87, 19], computing: [48, 68], engineering: [88, 66], humanities: [47, 38], health: [21, 56], earth: [68, 81], business: [29, 85], arts: [49, 13] };
export function createCosmicScene({ mount, galaxies, onGalaxyEnter, onHover, reducedMotion = false }) {
  if (!mount || !galaxies || !Object.keys(galaxies).length) throw new Error("A mount and galaxy registry are required.");
  const sceneId = `cosmica-galaxies-${++sceneSequence}`;
  const background = document.createElement("div");
  background.className = "cs-vector-scene";
  background.setAttribute("aria-hidden", "true");
  Object.assign(background.style, { display: "block", width: "100%", height: "100%", pointerEvents: "none" });
  const controls = document.createElement("div"); controls.className = "cs-category-controls cs-galaxy-map"; controls.setAttribute("role", "group"); controls.setAttribute("aria-label", "Galaxies");
  controls.style.zIndex = "2";
  controls.setAttribute("aria-description", "Use arrow keys to browse galaxies. Press Enter or Space to view subjects. Home and End reach the first and last galaxy.");
  const cleanup = [], records = [];
  let destroyed = false, raf = 0, selectedId = null, selectedWorld = null, previewId = null, previewIndex = null;
  let motionEnabled = !reducedMotion, visible = true, onScreen = true, interactionPaused = false;
  let hoveredId = null, focusedId = null, transition = null, travelProgress = 1, interruptedTransitions = 0;
  let lastFrame = 0, elapsed = 0, renderedFrames = 0, previewUntil = 0, zoom = 1, width = mount.clientWidth, height = mount.clientHeight;
  const camera = [0, 0, 62], coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  try {
    const backdrop = createSpaceBackdrop(background, sceneId, { compact: coarsePointer || width <= 640 });
    cleanup.push(() => backdrop.destroy());
    Object.entries(galaxies).forEach(([id, galaxy]) => {
      const record = makeGalaxy(id, galaxy, sceneId), button = document.createElement("button");
      button.className = "cs-category-button cs-galaxy-button"; button.type = "button"; button.dataset.category = id; button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Open ${galaxy.name} galaxy`);
      const [x, y] = POSITIONS[id] || [50, 50];
      button.style.setProperty("--scene-x", x + "%"); button.style.setProperty("--scene-y", y + "%"); button.style.setProperty("--scene-color", PALETTES[id]?.[0] || galaxy.color || "#83d7e4");
      const label = document.createElement("span"), action = document.createElement("span");
      label.className = "cs-category-name"; label.textContent = galaxy.name;
      action.className = "cs-galaxy-action"; action.textContent = "View subjects \u2197"; action.setAttribute("aria-hidden", "true");
      button.append(record.svg, label, action); record.button = button; records.push(record); controls.append(button);
    });
    mount.append(background, backdrop.nearLayer, controls); mount.dataset.sceneMode = "universe"; mount.dataset.renderer = "svg";
    const canDraw = () => !destroyed && visible && onScreen && !document.hidden;
    const settle = () => { if (transition) { camera[2] = transition.to; transition = null; travelProgress = 1; } };
    const draw = (now) => {
      let travel = 0;
      if (transition) { travelProgress = Math.min(1, (now - transition.start) / transition.duration); const t = travelProgress, eased = t * t * (3 - 2 * t); camera[2] = transition.from + (transition.to - transition.from) * eased; travel = Math.sin(t * Math.PI); if (t >= 1) settle(); }
      records.forEach((record, i) => {
        // Selected-galaxy layouts hide the other eight artworks completely.
        if (selectedId && record.id !== selectedId) return;
        const focused = previewId === record.id, selected = selectedId === record.id, a = record.angle + elapsed * (i % 2 ? -0.52 : 0.44);
        record.rotor.setAttribute("transform", `rotate(${a.toFixed(3)})`);
        record.shimmer.setAttribute("opacity", (.83 + Math.sin(elapsed * .8 + i) * .13).toFixed(3));
        const pulse = focused && motionEnabled && now < previewUntil ? Math.sin((1 - (previewUntil - now) / 180) * Math.PI) * 0.012 : 0;
        record.approach.setAttribute("transform", `scale(${(zoom * (1 + (focused ? 0.055 : 0) + pulse + (selected ? travel * 0.06 : 0))).toFixed(4)})`); record.halo.setAttribute("opacity", focused ? "1" : selected ? "0.85" : "0.65"); record.button.classList.toggle("is-previewed", focused);
        const markerIndex = selected ? previewIndex ?? selectedWorld : null; record.marker.setAttribute("opacity", markerIndex === null ? "0" : "1");
        if (markerIndex !== null) { const angle = markerIndex / (galaxies[record.id].worlds.length || 1) * TAU - 0.8; record.marker.setAttribute("transform", `translate(${(Math.cos(angle) * 77).toFixed(2)} ${(Math.sin(angle) * 77).toFixed(2)})`); }
      });
      backdrop.draw(elapsed); renderedFrames++;
    };
    const animate = (now) => {
      raf = 0; if (!canDraw()) return; const interval = coarsePointer ? 32 : 16;
      if (lastFrame && now - lastFrame < interval - 1) { raf = requestAnimationFrame(animate); return; }
      const delta = Math.min(0.06, lastFrame ? (now - lastFrame) / 1000 : 1 / 30); lastFrame = now; if (motionEnabled && !interactionPaused) elapsed += delta; draw(now);
      if ((motionEnabled && !interactionPaused) || transition || now < previewUntil) raf = requestAnimationFrame(animate);
    };
    const requestDraw = () => { if (canDraw() && !raf) raf = requestAnimationFrame(animate); };
    const preview = (id, index = null) => { if (destroyed) return; const nextId = id && Object.hasOwn(galaxies, id) ? id : null, changed = previewId !== nextId || previewIndex !== index; previewId = nextId; previewIndex = index; if (changed && motionEnabled && canDraw()) previewUntil = performance.now() + 180; requestDraw(); };
    const syncInteraction = () => {
      interactionPaused = Boolean(hoveredId || focusedId);
      // Overview navigation must hold still as soon as a destination is inspected.
      if (interactionPaused && !selectedId && transition) settle();
      mount.dataset.interactionPaused = String(interactionPaused); lastFrame = 0; requestDraw();
    };
    const controlPreview = () => { const id = hoveredId || focusedId; preview(id); onHover?.(id); syncInteraction(); };
    const travelTo = (depth) => {
      if (transition) interruptedTransitions++;
      const hasTravel = Math.abs(camera[2] - depth) > 0.001;
      if (!hasTravel || !motionEnabled || !canDraw()) {
        camera[2] = depth; transition = null; travelProgress = 1;
      } else {
        transition = { from: camera[2], to: depth, start: performance.now(), duration: 460 }; travelProgress = 0;
      }
      requestDraw();
    };
    const syncSelection = () => records.forEach((record) => record.button.setAttribute("aria-pressed", String(record.id === selectedId)));
    const enterGalaxy = (id) => { if (destroyed || !Object.hasOwn(galaxies, id)) return false; selectedId = id; selectedWorld = previewId = previewIndex = null; mount.dataset.sceneMode = "galaxy"; mount.dataset.galaxy = id; syncSelection(); travelTo(54); return true; };
    const returnToUniverse = () => { selectedId = selectedWorld = previewId = previewIndex = null; mount.dataset.sceneMode = "universe"; delete mount.dataset.galaxy; syncSelection(); travelTo(62); };
    records.forEach((record) => {
      const enter = (event) => { if (event.pointerType !== "touch") { hoveredId = record.id; controlPreview(); } }, leave = () => { hoveredId = null; controlPreview(); }, focus = () => { hoveredId = null; focusedId = record.id; controlPreview(); }, blur = () => { focusedId = null; controlPreview(); }, select = () => typeof onGalaxyEnter === "function" ? onGalaxyEnter(record.id) : enterGalaxy(record.id);
      record.button.addEventListener("pointerenter", enter); record.button.addEventListener("pointerleave", leave); record.button.addEventListener("focus", focus); record.button.addEventListener("blur", blur); record.button.addEventListener("click", select);
      cleanup.push(() => { record.button.removeEventListener("pointerenter", enter); record.button.removeEventListener("pointerleave", leave); record.button.removeEventListener("focus", focus); record.button.removeEventListener("blur", blur); record.button.removeEventListener("click", select); });
    });
    // Use the rendered positions, including the phone layout, to move through
    // the map. Focus previews a destination; only Enter, Space or a tap enters it.
    const navigateMap = (event) => {
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey || selectedId) return;
      const current = records.find((record) => record.button === event.target);
      if (!current) return;
      let target;
      if (event.key === "Home") target = records[0];
      else if (event.key === "End") target = records[records.length - 1];
      else {
        const direction = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[event.key];
        if (!direction) return;
        const bounds = current.button.getBoundingClientRect(), x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
        let best = Infinity;
        records.forEach((record) => {
          if (record === current) return;
          const next = record.button.getBoundingClientRect(), dx = next.left + next.width / 2 - x, dy = next.top + next.height / 2 - y;
          const forward = dx * direction[0] + dy * direction[1], sideways = Math.abs(dx * direction[1] - dy * direction[0]);
          const score = Math.hypot(dx, dy) + sideways * 1.5;
          if (forward > 1 && score < best) { best = score; target = record; }
        });
      }
      if (!target) return;
      event.preventDefault();
      target.button.focus({ preventScroll: true });
      target.button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    };
    controls.addEventListener("keydown", navigateMap); cleanup.push(() => controls.removeEventListener("keydown", navigateMap));
    const resize = () => { width = mount.clientWidth; height = mount.clientHeight; requestDraw(); }, handleVisibility = () => { lastFrame = 0; if (canDraw()) requestDraw(); else { settle(); cancelAnimationFrame(raf); raf = 0; } };
    document.addEventListener("visibilitychange", handleVisibility); cleanup.push(() => document.removeEventListener("visibilitychange", handleVisibility));
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(mount); cleanup.push(() => resizeObserver.disconnect());
    const intersectionObserver = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; handleVisibility(); }); intersectionObserver.observe(mount); cleanup.push(() => intersectionObserver.disconnect()); cleanup.push(() => cancelAnimationFrame(raf)); resize();
    return {
      enterGalaxy, returnToUniverse, previewGalaxy(id) { preview(id); }, previewWorld(index) { preview(null, Number.isInteger(index) && selectedId && galaxies[selectedId].worlds[index] ? index : null); },
      focusWorld(index) { if (destroyed || !selectedId || !Number.isInteger(index) || !galaxies[selectedId].worlds[index]) return false; selectedWorld = index; previewIndex = null; requestDraw(); return true; },
      clearWorldFocus() { selectedWorld = previewIndex = null; requestDraw(); },
      zoomBy(delta) { if (destroyed || !Number.isFinite(delta)) return; settle(); zoom = Math.min(1.15, Math.max(0.85, zoom + delta * 0.1)); camera[2] = Math.min(80, Math.max(40, camera[2] - delta * 10)); requestDraw(); },
      reset() { if (destroyed) return; selectedWorld = previewId = previewIndex = null; zoom = 1; travelTo(selectedId ? 54 : 62); },
      setMotion(enabled) { motionEnabled = Boolean(enabled); if (!motionEnabled) { settle(); previewUntil = 0; } lastFrame = 0; requestDraw(); },
      setVisible(value) { visible = Boolean(value); background.style.display = backdrop.nearLayer.style.display = visible ? "block" : "none"; controls.hidden = !visible; handleVisibility(); if (visible) resize(); },
      getState() { return { renderer: "svg", procedural: true, vector: true, mode: selectedId ? "galaxy" : "universe", galaxyId: selectedId, selectedWorld, previewGalaxy: previewId, previewWorld: previewIndex, transitioning: Boolean(transition), travelProgress, interruptedTransitions, motionEnabled, interactionPaused, visible, onScreen, renderedFrames, camera: [...camera], target: [0, 0, 0], viewport: { width, height }, galaxies: records.length, worlds: selectedId ? galaxies[selectedId].worlds.length : 0, galaxyForms: Object.fromEntries(records.map((record) => [record.id, record.form])), background: { stars: backdrop.starCount, depthLayers: backdrop.layerCount } }; },
      destroy() { if (destroyed) return; destroyed = true; cleanup.forEach((dispose) => dispose()); background.remove(); controls.remove(); delete mount.dataset.sceneMode; delete mount.dataset.renderer; delete mount.dataset.galaxy; delete mount.dataset.interactionPaused; },
    };
  } catch (error) { destroyed = true; cleanup.forEach((dispose) => dispose()); background.remove(); controls.remove(); delete mount.dataset.sceneMode; delete mount.dataset.renderer; delete mount.dataset.galaxy; delete mount.dataset.interactionPaused; throw error; }
}
