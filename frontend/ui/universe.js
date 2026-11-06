/* ========================================================================== 
   COSMICA UNIVERSE
   Subject registry, procedural cosmic web, spatial navigation, and sound design.
   ========================================================================== */
(() => {
  "use strict";
  if (!document.body.classList.contains("universe-page")) return;

  /* Subject registry: destinations remain explicit about their availability. */
  const galaxies = {
    languages: {
      name: "Languages", symbol: "Aa", color: "#b5a0ee", rgb: [184, 153, 243], hue: 266,
      x: .48, y: .48, seed: 12,
      description: "Different ways to speak. New ways to see the world. Explore writing systems, vocabulary, conversations, and grammar in your chosen language.",
      note: "All 12 language worlds are available. Choose a world to explore its learning paths.",
      worlds: [
        ["English", "English", "Aa", "english-world.html", "en"],
        ["French", "Français", "É", "world-french.html", "fr"],
        ["Spanish", "Español", "Ñ", "world-spanish.html", "es"],
        ["Arabic", "العربية", "ع", "world-arabic.html", "ar"],
        ["Japanese", "日本語", "あ", "world-japanese.html", "ja"],
        ["Chinese", "中文", "文", "world-chinese.html", "zh"],
        ["Korean", "한국어", "한", "world-korean.html", "ko"],
        ["German", "Deutsch", "ß", "world-german.html", "de"],
        ["Brazilian Portuguese", "Português do Brasil", "Ã", "world-portuguese.html", "pt-BR"],
        ["Hindi", "हिन्दी", "अ", "world-hindi.html", "hi"],
        ["Dutch", "Nederlands", "IJ", "world-dutch.html", "nl"],
        ["Swedish", "Svenska", "Å", "world-swedish.html", "sv"],
      ],
    },
    science: {
      name: "Science", symbol: "∑", color: "#a3c5f2", rgb: [133, 176, 249], hue: 215,
      x: .77, y: .23, seed: 71,
      description: "Follow a question from the smallest particles to the largest structures. Discover mathematics, experiment with ideas, and explore how our universe works.",
      note: "Open the mathematics studio.",
      worlds: [
        ["Mathematics", "Change a line and see its graph respond", "ƒ", "maths-lab.html", "en"],
        ["Physics", "Motion, energy, matter, and forces", "λ", null],
        ["Chemistry", "Atoms, structures, and transformations", "H₂", null],
        ["Biology", "Living systems and their connections", "ψ", null],
        ["Astronomy", "Stars, galaxies, and the universe", "✧", null],
      ],
    },
    computing: {
      name: "Computing", symbol: "</>", color: "#9ce0ce", rgb: [121, 221, 201], hue: 166,
      x: .20, y: .78, seed: 33,
      description: "Explore programs, algorithms, and intelligent systems.",
      note: "",
      worlds: [
        ["Programming", "Write, run, and understand code", "{ }", null],
        ["Computer Science", "Algorithms, logic, and systems", "01", null],
        ["Artificial Intelligence", "Models, data, and reasoning", "∴", null],
        ["Cybersecurity", "Understand and protect digital systems", "⌘", null],
      ],
    },
    engineering: {
      name: "Engineering", symbol: "⌁", color: "#efb0a0", rgb: [236, 157, 135], hue: 18,
      x: .80, y: .77, seed: 53,
      description: "Explore the design, models, and systems behind the things we build.",
      note: "",
      worlds: [
        ["Mechanical", "Motion, machines, and materials", "⚙", null],
        ["Electrical", "Circuits, power, and signals", "ϟ", null],
        ["Civil", "Structures, cities, and infrastructure", "△", null],
        ["Aerospace", "Flight, spacecraft, and propulsion", "↑", null],
      ],
    },
    humanities: {
      name: "Humanities", symbol: "φ", color: "#d6c390", rgb: [221, 190, 125], hue: 44,
      x: .20, y: .22, seed: 92,
      description: "Explore ideas, stories, cultures, and human experience across places and time.",
      note: "",
      worlds: [
        ["History", "People, events, and perspectives", "⌛", null],
        ["Philosophy", "Questions, arguments, and ideas", "φ", null],
        ["Society & Civics", "Communities, institutions, and citizenship", "§", null],
        ["Literature", "Stories, language, and interpretation", "Aa", null],
      ],
    },
    health: {
      name: "Health & Medicine", symbol: "+", color: "#e8a9c6", rgb: [233, 150, 189], hue: 334,
      x: .11, y: .48, seed: 116,
      description: "Explore the human body, anatomy, physiology, public health, and medical science.",
      note: "",
      worlds: [["Anatomy & Physiology", "Explore the structures and systems of the body", "+", null], ["Medical Science", "Understand mechanisms of health and disease", "μ", null], ["Public Health", "Health, prevention, and populations", "◎", null], ["Nutrition", "Food, metabolism, and human health", "✳", null]],
    },
    earth: {
      name: "Earth & Environment", symbol: "⊕", color: "#a9cf96", rgb: [157, 211, 147], hue: 110,
      x: .89, y: .46, seed: 132,
      description: "Explore Earth, climate, geology, ecology, and the environments we share.",
      note: "",
      worlds: [["Climate & Atmosphere", "Weather, climate, and a changing planet", "☁", null], ["Geology", "Earth's materials, processes, and deep history", "△", null], ["Ecology", "Organisms, habitats, and living networks", "❋", null], ["Oceans & Water", "Water systems from rivers to the deep ocean", "≈", null]],
    },
    business: {
      name: "Business & Economics", symbol: "↗", color: "#d6bc86", rgb: [222, 185, 117], hue: 39,
      x: .51, y: .87, seed: 159,
      description: "Explore resources, organizations, economic reasoning, financial literacy, and business.",
      note: "",
      worlds: [["Economics", "Resources, incentives, markets, and policy", "↗", null], ["Financial Literacy", "Understand budgets, saving, and financial concepts", "≋", null], ["Entrepreneurship", "From a useful idea to a sustainable organization", "✧", null], ["Management", "People, operations, and thoughtful decisions", "⋈", null]],
    },
    arts: {
      name: "Creativity", symbol: "✳", color: "#c8a5e9", rgb: [198, 147, 232], hue: 281,
      x: .49, y: .10, seed: 187,
      description: "Explore visual art, music, design, and creative media.",
      note: "",
      worlds: [["Visual Arts", "Drawing, painting, and visual expression", "✳", null], ["Music", "Sound, rhythm, harmony, and composition", "♫", null], ["Design", "Shape useful, meaningful experiences", "◈", null], ["Film & Media", "Stories told through image, movement, and sound", "▷", null]],
    },
  };


  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  const availableSubjects = Object.entries(galaxies).flatMap(([galaxyId, galaxy]) =>
    galaxy.worlds.map((world, index) => ({ world, index, galaxyId, galaxy })).filter(({ world }) => world[3])
  );
  const descriptions = {
    languages: ["Choose from 12 language courses.", ""],
    science: ["Explore mathematics and the natural world.", "Open the mathematics studio."],
    computing: ["Learn how software, computers, and digital systems work.", ""],
    engineering: ["Understand how things are designed and built.", ""],
    humanities: ["Explore history, ideas, literature, and society.", ""],
    health: ["Learn about the human body and health.", ""],
    earth: ["Explore our planet, its climate, and its living systems.", ""],
    business: ["Understand money, organizations, and economic decisions.", ""],
    arts: ["Explore art, music, design, and creative work.", ""],
  };
  Object.entries(descriptions).forEach(([id, [description, note]]) => {
    galaxies[id].description = description;
    galaxies[id].note = note;
  });
  let currentGalaxy = null;
  let sceneEngine = null;
  let fallbackReason = null;
  let motionEnabled = !reducedMotion.matches;
  let menuOpen = false;
  let announcementTimer;
  let soundEnabled = false;
  let audioContext;
  let lastSoundAt = 0;
  let menuOpener = null;
  const searchScope = "all";
  let catalogAnimation = null;
  let galaxyTravelAnimation = null;
  let scrollSaveTimer;
  let restoringHistory = false;
  let routeRevision = 0;
  let handledHistoryHref = location.href;
  const historyKey = "cosmicaHomeBrowser";
  const browsingPlaces = new Map();
  let menuTypeahead = "";
  let menuTypeaheadAt = 0;
  const normalizeSearch = (value) => String(value).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
  const searchTokens = (value) => [...new Set(normalizeSearch(value).trim().split(/\s+/).filter(Boolean))];
  const categoryAliases = { computing: ["coding", "code"] };
  const courseAliases = { Mathematics: ["math", "maths"], Programming: ["coding", "code"] };
  const matchesTokens = (tokens, fields) => {
    if (tokens.length === 1 && [...tokens[0]].length === 1) {
      return normalizeSearch(fields[0]).startsWith(tokens[0]);
    }
    return tokens.every((token) => fields.some((field) => normalizeSearch(field).includes(token)));
  };

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const icon = (name) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("ux-icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#ux-" + name);
    svg.append(use);
    return svg;
  };
  const announce = (message) => {
    const target = $("uxAnnouncement");
    if (!target) return;
    target.textContent = message;
    target.hidden = false;
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => { target.hidden = true; }, 4500);
  };
  const playSound = (kind = "select") => {
    if (!soundEnabled || !audioContext || document.hidden) return;
    if (performance.now() - lastSoundAt < 100) return;
    lastSoundAt = performance.now();
    try {
      if (audioContext.state === "suspended") void audioContext.resume().catch(() => {});
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "hover" ? 960 : 520, start);
      oscillator.frequency.exponentialRampToValueAtTime(440, start + 0.09);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(kind === "hover" ? 0.009 : 0.025, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.14);
    } catch { /* Optional sound never blocks navigation. */ }
  };
  const syncSound = () => {
    $("uxSound")?.setAttribute("aria-pressed", String(soundEnabled));
    $("uxSound")?.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
    $("uxSound")?.classList.toggle("is-sounding", soundEnabled);
    if ($("homeSoundLabel")) $("homeSoundLabel").textContent = soundEnabled ? "Sound on" : "Sound off";
  };
  $("uxSound")?.addEventListener("click", async () => {
    if (soundEnabled) {
      soundEnabled = false;
      if (audioContext) {
        const previous = audioContext;
        audioContext = null;
        void previous.close().catch(() => {});
      }
      syncSound();
      return;
    }
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (typeof AudioEngine !== "function") throw new Error("Audio unavailable");
      audioContext = new AudioEngine();
      if (audioContext.state === "suspended") await audioContext.resume();
      soundEnabled = true;
      syncSound();
      playSound();
    } catch {
      soundEnabled = false;
      if (audioContext) {
        const previous = audioContext;
        audioContext = null;
        void previous.close().catch(() => {});
      }
      syncSound();
      announce("Sound is unavailable in this browser.");
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!audioContext || !soundEnabled) return;
    if (document.hidden) void audioContext.suspend().catch(() => {});
    else void audioContext.resume().catch(() => {});
  });

  const menuTriggers = [...document.querySelectorAll("[data-toggle-subjects]")];
  const visibleMenuTrigger = () => menuTriggers.find((trigger) => {
    const bounds = trigger.getBoundingClientRect();
    return trigger.getClientRects().length && bounds.bottom > 0 && bounds.top < innerHeight;
  }) || $("homeHeroLink") || menuTriggers.find((trigger) => trigger.getClientRects().length);
  const syncMenu = (open, restoreFocus = false) => {
    menuOpen = Boolean(open);
    $("uxListView").hidden = !menuOpen;
    menuTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", String(menuOpen));
      trigger.setAttribute("aria-controls", "uxListView");
    });
    if ($("homeMenuBackdrop")) $("homeMenuBackdrop").hidden = !menuOpen;
    if (!currentGalaxy) $("homeHeroLink")?.setAttribute("aria-expanded", String(menuOpen));
    document.body.classList.toggle("is-menu-open", menuOpen);
    if (restoreFocus) {
      const target = menuOpener?.isConnected && menuOpener.getClientRects().length ? menuOpener : visibleMenuTrigger();
      target?.focus({ preventScroll: true });
    }
  };
  const focusMenuSelection = () => {
    const list = $("flightGalaxyItems");
    const selected = list.querySelector("[aria-current='page']") || list.querySelector("button");
    selected?.focus({ preventScroll: true });
    selected?.scrollIntoView({ block: "nearest", behavior: "instant" });
  };
  const openGalaxyMenu = (opener = document.activeElement) => {
    menuOpener = opener instanceof HTMLElement && opener !== document.body ? opener : visibleMenuTrigger();
    menuTypeahead = "";
    syncMenu(true);
    focusMenuSelection();
  };
  menuTriggers.forEach((trigger) => trigger.addEventListener("click", () => {
    if (menuOpen) syncMenu(false, true);
    else openGalaxyMenu(trigger);
  }));
  $("flightGalaxyItems").addEventListener("keydown", (event) => {
    if (!menuOpen || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = event.target.closest("button[data-galaxy]");
    if (!current) return;
    const buttons = [...$("flightGalaxyItems").querySelectorAll("button[data-galaxy]:not([disabled])")];
    const index = buttons.indexOf(current);
    let target;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      menuTypeahead = "";
      if (event.key === "Home") target = buttons[0];
      else if (event.key === "End") target = buttons[buttons.length - 1];
      else target = buttons[(index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length];
    } else if (event.key.length === 1 && /[\p{L}\p{N}]/u.test(event.key)) {
      const now = performance.now();
      const character = normalizeSearch(event.key);
      menuTypeahead = now - menuTypeaheadAt > 700 ? character : menuTypeahead + character;
      menuTypeaheadAt = now;
      const query = [...menuTypeahead].every((letter) => letter === character) ? character : menuTypeahead;
      const ordered = buttons.slice(index + 1).concat(buttons.slice(0, index + 1));
      target = ordered.find((button) => normalizeSearch(button.querySelector("strong")?.textContent || "").startsWith(query));
    }
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
  $("uxMapView")?.addEventListener("click", () => syncMenu(false, true));
  $("homeMenuBackdrop")?.addEventListener("click", () => syncMenu(false, true));
  mobileLayout.addEventListener("change", () => {
    const needsFocus = $("uxListView").contains(document.activeElement);
    syncMenu(false, needsFocus);
  });
  document.addEventListener("pointerdown", (event) => {
    // Dismissing the separate cookie notice should keep the galaxy index open.
    if (event.target.closest?.(".cookie-notice")) return;
    if (menuOpen && !$("uxListView").contains(event.target) && !menuTriggers.some((trigger) => trigger.contains(event.target))) syncMenu(false);
  });

  const previewCategory = (id) => {
    sceneEngine?.previewGalaxy?.(id);
    $("flightGalaxyItems").querySelectorAll("[data-galaxy]").forEach((button) => {
      button.classList.toggle("is-previewed", Boolean(id) && button.dataset.galaxy === id);
    });
    if (id) playSound("hover");
  };
  const previewSubject = (galaxyId, index) => {
    if (currentGalaxy === galaxyId) sceneEngine?.previewWorld?.(index);
    else sceneEngine?.previewGalaxy?.(galaxyId);
  };
  const clearSubjectPreview = () => {
    sceneEngine?.previewWorld?.(null);
    sceneEngine?.previewGalaxy?.(null);
  };
  const syncCategoryButtons = () => {
    $("flightGalaxyItems").querySelectorAll("[data-galaxy]").forEach((button) => {
      const selected = (button.dataset.galaxy || null) === currentGalaxy;
      button.classList.toggle("is-selected", selected);
      if (selected) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  };
  const renderCategories = () => {
    const list = $("flightGalaxyItems");
    list.replaceChildren();
    const entries = [
      ["", { name: "All galaxies", symbol: "✦", color: "#cab9ff", worlds: [], detail: "Galaxy map" }],
      ...Object.entries(galaxies),
    ];
    entries.forEach(([id, galaxy]) => {
      const button = node("button", "home-category ux-list-item");
      button.type = "button";
      button.dataset.galaxy = id;
      button.style.setProperty("--galaxy-color", galaxy.color);
      button.style.setProperty("--category-color", galaxy.color);
      const available = galaxy.worlds.filter((world) => world[3]).length;
      const copy = node("span", "home-category-copy");
      const detail = galaxy.detail || (available ? id === "languages" ? "12 language courses" : "Mathematics studio" : "Unavailable");
      copy.append(node("strong", "", galaxy.name), node("small", "", detail));
      const categoryIcon = node("span", "home-category-icon ux-list-symbol", galaxy.symbol);
      categoryIcon.setAttribute("aria-hidden", "true");
      button.append(categoryIcon, copy);
      if (available) {
        const count = node("span", "home-category-count", String(available));
        count.setAttribute("aria-hidden", "true");
        button.append(count);
      }
      else if (id) button.append(node("span", "home-category-dot"));
      button.addEventListener("click", () => id ? enterGalaxy(id) : returnToUniverse());
      button.addEventListener("pointerenter", () => previewCategory(id || null));
      button.addEventListener("pointerleave", () => {
        if (document.activeElement !== button) previewCategory(null);
      });
      button.addEventListener("focus", () => previewCategory(id || null));
      button.addEventListener("blur", () => previewCategory(null));
      list.append(button);
    });
    syncCategoryButtons();
  };

  const renderWorlds = () => {
    const filter = $("uxWorldFilter").value.trim();
    const tokens = searchTokens(filter);
    if ($("homeClearFilter")) $("homeClearFilter").hidden = !filter;
    const entries = currentGalaxy
      ? galaxies[currentGalaxy].worlds.map((world, index) => ({ world, index, galaxyId: currentGalaxy, galaxy: galaxies[currentGalaxy] }))
      : availableSubjects;
    const matches = entries.filter(({ world, galaxyId }) =>
      matchesTokens(tokens, [world[0], world[1], galaxies[galaxyId].name, ...(courseAliases[world[0]] || []), ...(categoryAliases[galaxyId] || [])])
    );
    const grid = $("uxWorldGrid");
    grid.replaceChildren();
    $("uxWorldCount").textContent = matches.length + (matches.length === 1 ? " subject" : " subjects") + (filter ? " found" : "");
    matches.forEach(({ world, index, galaxyId, galaxy }) => {
      const [name, subtitle, glyph, url, language] = world;
      const article = node("article", "ux-world-card");
      if (!url) article.classList.add("is-planned");
      article.dataset.worldIndex = String(index);
      article.dataset.galaxy = galaxyId;
      article.style.setProperty("--card-color", galaxy.color);
      article.style.setProperty("--hue", String((galaxy.hue + index * 17) % 360));
      const link = node(url ? "a" : "div", "ux-world-link");
      if (url) {
        link.href = url;
      }
      const art = node("span", "ux-world-art");
      const orb = node("span", "ux-world-orb", glyph);
      orb.setAttribute("aria-hidden", "true");
      art.append(orb);
      const copy = node("div", "home-world-copy");
      if (!currentGalaxy) copy.append(node("span", "home-card-category", galaxy.name));
      const sub = node("p", "home-world-description", subtitle);
      if (language && galaxyId === "languages") {
        sub.lang = language;
        sub.dir = "auto";
      }
      copy.append(node("h3", "", name), sub);
      link.append(art, copy);
      if (url === "maths-lab.html") {
        const state = node("span", "ux-world-state");
        state.append(node("span", "", "Open studio"), icon("arrow"));
        link.append(state);
      }
      article.append(link);
      article.addEventListener("pointerenter", () => previewSubject(galaxyId, index));
      article.addEventListener("pointerleave", () => {
        if (!article.contains(document.activeElement)) clearSubjectPreview();
      });
      article.addEventListener("focusin", () => previewSubject(galaxyId, index));
      article.addEventListener("focusout", (event) => {
        if (!article.contains(event.relatedTarget)) clearSubjectPreview();
      });
      grid.append(article);
    });
    if (!matches.length) {
      const empty = node("div", "home-empty");
      empty.append(node("p", "ux-empty", "No subjects match. Try another name."));
      const reset = node("button", "ux-text-button", "Clear filters");
      reset.type = "button";
      reset.addEventListener("click", () => {
        $("uxWorldFilter").value = "";
        renderWorlds();
        rememberBrowsingEdit();
        $("uxWorldFilter").focus();
      });
      empty.append(reset);
      if (filter) {
        const searchAll = node("button", "home-search-all", "Search all subjects");
        searchAll.type = "button";
        searchAll.addEventListener("click", () => openDialog("uxSearchDialog", searchAll, filter));
        empty.append(searchAll);
      }
      grid.append(empty);
    }
  };
  const routeCategory = () => {
    const id = location.hash.replace(/^#galaxy-/, "");
    return location.hash.startsWith("#galaxy-") && Object.hasOwn(galaxies, id) ? id : null;
  };
  const isCategoryRoute = () => !location.hash || location.hash === "#galaxies" || location.hash.startsWith("#galaxy-");
  const browsingSnapshot = () => ({
    version: 1,
    galaxyId: currentGalaxy,
    filter: $("uxWorldFilter").value.slice(0, 160),
    scrollY: Math.min(10000000, Math.max(0, Math.round(window.scrollY))),
  });
  const historyEnvelope = (snapshot) => ({
    ...(history.state && typeof history.state === "object" ? history.state : {}),
    [historyKey]: snapshot,
  });
  const rememberBrowsingState = () => {
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = null;
    if (restoringHistory || routeCategory() !== currentGalaxy) return;
    const snapshot = browsingSnapshot();
    // Keys can only be the nine registered galaxies or the overview (null).
    browsingPlaces.set(currentGalaxy, snapshot);
    try { history.replaceState(historyEnvelope(snapshot), "", location.href); }
    catch { /* Restricted history must not prevent browsing. */ }
  };
  const rememberBrowsingEdit = () => {
    // A deliberate edit supersedes pending scroll restoration, even before its frame.
    if (restoringHistory) {
      restoringHistory = false;
      routeRevision += 1;
    }
    rememberBrowsingState();
  };
  const savedBrowsingState = () => {
    const snapshot = history.state?.[historyKey];
    if (!snapshot || snapshot.version !== 1 || snapshot.galaxyId !== routeCategory()) return null;
    return {
      filter: typeof snapshot.filter === "string" ? snapshot.filter.slice(0, 160) : "",
      scrollY: Number.isFinite(snapshot.scrollY) ? Math.min(10000000, Math.max(0, snapshot.scrollY)) : 0,
    };
  };
  const updateRoute = (id) => {
    const hash = id ? "#galaxy-" + id : "#galaxies";
    try {
      if (location.hash !== hash) history.pushState(historyEnvelope(browsingSnapshot()), "", hash);
      else history.replaceState(historyEnvelope(browsingSnapshot()), "", location.href);
    } catch { /* Keep the selected category usable if history is unavailable. */ }
    handledHistoryHref = location.href;
  };
  const animateCatalog = () => {
    catalogAnimation?.cancel();
    catalogAnimation = null;
    if (!motionEnabled || reducedMotion.matches || typeof $("uxWorldGrid").animate !== "function") return;
    catalogAnimation = $("uxWorldGrid").animate(
      [{ opacity: 0.55, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 180, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
  };
  const cancelGalaxyTravel = () => {
    galaxyTravelAnimation?.cancel();
    galaxyTravelAnimation = null;
  };
  const visibleGalaxyBounds = (button) => {
    if (!button?.isConnected || !button.getClientRects().length) return null;
    const style = getComputedStyle(button);
    if (style.display === "none" || style.visibility === "hidden") return null;
    const bounds = button.getBoundingClientRect();
    return bounds.width > 1 && bounds.height > 1 && bounds.right > 0 && bounds.bottom > 0 &&
      bounds.left < innerWidth && bounds.top < innerHeight ? bounds : null;
  };
  const captureGalaxyTravel = (id) => {
    if (!motionEnabled || reducedMotion.matches || !sceneEngine) return null;
    const button = $("uxSpace").querySelector('.cs-galaxy-button[data-category="' + id + '"]');
    const bounds = visibleGalaxyBounds(button);
    return bounds ? { button, bounds } : null;
  };
  const playGalaxyTravel = (captured) => {
    if (!captured || !motionEnabled || reducedMotion.matches) return;
    const { button, bounds: before } = captured;
    const after = visibleGalaxyBounds(button);
    if (!after || typeof button.animate !== "function") return;
    const x = before.left + before.width / 2 - after.left - after.width / 2;
    const y = before.top + before.height / 2 - after.top - after.height / 2;
    const scaleX = Math.max(0.4, Math.min(2.5, before.width / after.width));
    const scaleY = Math.max(0.4, Math.min(2.5, before.height / after.height));
    if (Math.hypot(x, y) < 1 && Math.abs(scaleX - 1) < 0.005 && Math.abs(scaleY - 1) < 0.005) return;
    // Replace the computed transform once, preserving its existing centering.
    // Translations precede the baseline; scaling follows it around the center.
    const computed = getComputedStyle(button).transform;
    const baseline = computed === "none" ? "" : computed;
    const animation = button.animate([
      { transform: `translate(${x}px, ${y}px) ${baseline} scale(${scaleX}, ${scaleY})` },
      { transform: baseline || "none" },
    ], { duration: 460, easing: "cubic-bezier(.18,.7,.18,1)" });
    galaxyTravelAnimation = animation;
    animation.finished.then(() => {
      if (galaxyTravelAnimation === animation) galaxyTravelAnimation = null;
    }).catch(() => { /* Rapid navigation and pause cancel the previous arrival. */ });
  };
  window.addEventListener("scroll", () => {
    if (restoringHistory || scrollSaveTimer) return;
    scrollSaveTimer = window.setTimeout(() => {
      scrollSaveTimer = null;
      rememberBrowsingState();
    }, 100);
  }, { passive: true });
  window.addEventListener("pagehide", rememberBrowsingState);
  try { history.scrollRestoration = "manual"; } catch { /* Browser-owned scroll remains available. */ }
  const updateCategoryContent = () => {
    const galaxy = galaxies[currentGalaxy];
    const title = galaxy ? galaxy.name : "Choose a\nsubject";
    if ($("homeTitle")) $("homeTitle").textContent = title;
    if ($("homeDescription")) $("homeDescription").textContent = galaxy
      ? galaxy.description
      : "Browse languages, science, and more.";
    if ($("homeCategoryLabel")) $("homeCategoryLabel").hidden = Boolean(galaxy);
    $("homeGalaxyBreadcrumb").hidden = !galaxy;
    if ($("homeHeroLink")) {
      if (galaxy) {
        $("homeHeroLink").removeAttribute("aria-controls");
        $("homeHeroLink").removeAttribute("aria-expanded");
      } else {
        $("homeHeroLink").setAttribute("aria-controls", "uxListView");
        $("homeHeroLink").setAttribute("aria-expanded", String(menuOpen));
      }
      $("homeHeroLink").replaceChildren(node("span", "", galaxy ? "See subjects" : "All galaxies"), icon("arrow"));
    }
    $("uxGalaxyTitle").textContent = galaxy ? currentGalaxy === "languages" ? "Language courses" : "Subjects" : "Start learning";
    $("uxBreadcrumb").textContent = galaxy ? galaxy.name : "All galaxies";
    if ($("homeMobileCategory")) $("homeMobileCategory").textContent = galaxy ? galaxy.name : "Galaxies";
    if ($("homeGalaxySwitch")) $("homeGalaxySwitch").hidden = !galaxy;
    const filterLabel = galaxy ? "Search " + galaxy.name : "Filter available courses";
    $("uxWorldFilter").placeholder = filterLabel;
    $("uxWorldFilter").setAttribute("aria-label", filterLabel);
    $("uxGalaxyNote").textContent = galaxy ? galaxy.note : "";
    $("uxBack").hidden = !galaxy;
    $("uxGalaxyView").hidden = !galaxy;
    $("uxIntro").hidden = false;
    document.body.classList.toggle("has-selected-category", Boolean(galaxy));
    document.body.dataset.category = currentGalaxy || "all";
    document.body.style.setProperty("--selected-color", galaxy?.color || "#b5a0ee");
    syncCategoryButtons();
  };
  const focusCatalog = () => {
    if (!currentGalaxy) {
      window.scrollTo({ top: 0, behavior: "instant" });
      $("homeTitle")?.focus({ preventScroll: true });
      return;
    }
    const heading = $("uxGalaxyTitle");
    const bounds = heading.getBoundingClientRect();
    if (mobileLayout.matches) {
      $("uxGalaxyView").scrollIntoView({ block: "start", behavior: "instant" });
    } else if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
      heading.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
    heading.focus({ preventScroll: true });
  };
  const applyCategory = (id, pushRoute, moveFocus, snapshot = null) => {
    const travel = moveFocus && id !== currentGalaxy ? captureGalaxyTravel(id || currentGalaxy) : null;
    cancelGalaxyTravel();
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = null;
    catalogAnimation?.cancel();
    if (pushRoute) rememberBrowsingState();
    const destination = snapshot || (pushRoute ? browsingPlaces.get(id) : null);
    const revision = ++routeRevision;
    restoringHistory = Boolean(destination);
    currentGalaxy = id;
    $("uxWorldFilter").value = destination?.filter || "";
    updateCategoryContent();
    renderWorlds();
    if (id) sceneEngine?.enterGalaxy(id);
    else sceneEngine?.returnToUniverse();
    syncMenu(false);
    if (pushRoute) updateRoute(id);
    else handledHistoryHref = location.href;
    if (destination) {
      if (moveFocus) (currentGalaxy ? $("uxGalaxyTitle") : $("homeTitle"))?.focus({ preventScroll: true });
      window.scrollTo({ top: destination.scrollY, behavior: "instant" });
      requestAnimationFrame(() => {
        if (revision !== routeRevision) return;
        window.scrollTo({ top: destination.scrollY, behavior: "instant" });
        restoringHistory = false;
        rememberBrowsingState();
        playGalaxyTravel(travel);
      });
    } else {
      restoringHistory = false;
      if (moveFocus) focusCatalog();
      rememberBrowsingState();
      if (moveFocus && currentGalaxy) animateCatalog();
      playGalaxyTravel(travel);
    }
  };
  const enterGalaxy = (id, pushRoute = true, moveFocus = true, snapshot = null) => {
    if (!Object.hasOwn(galaxies, id)) return;
    applyCategory(id, pushRoute, moveFocus, snapshot);
    if (pushRoute) playSound();
  };
  const returnToUniverse = (pushRoute = true, moveFocus = true, snapshot = null) => {
    applyCategory(null, pushRoute, moveFocus, snapshot);
  };
  $("uxBack").addEventListener("click", () => returnToUniverse());
  document.querySelectorAll("[data-universe-home]").forEach((link) => {
    link.addEventListener("click", (event) => { event.preventDefault(); returnToUniverse(); });
  });
  const clearCatalogFilter = () => {
    $("uxWorldFilter").value = "";
    renderWorlds();
    clearSubjectPreview();
    rememberBrowsingEdit();
    $("uxWorldFilter").focus({ preventScroll: true });
  };
  $("homeClearFilter")?.addEventListener("click", clearCatalogFilter);
  $("uxWorldFilter").addEventListener("input", () => {
    renderWorlds();
    clearSubjectPreview();
    rememberBrowsingEdit();
  });
  $("uxWorldFilter").addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("uxWorldFilter").value) {
      event.preventDefault();
      event.stopPropagation();
      clearCatalogFilter();
    }
  });
  const readRoute = (focus = false, restore = true) => {
    const id = routeCategory();
    const snapshot = restore ? savedBrowsingState() : null;
    if (id) enterGalaxy(id, false, focus, snapshot);
    else returnToUniverse(false, focus, snapshot);
  };
  window.addEventListener("popstate", () => {
    if (isCategoryRoute()) readRoute(true);
  });
  window.addEventListener("hashchange", () => {
    if (handledHistoryHref !== location.href && isCategoryRoute()) readRoute(true);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && isCategoryRoute()) readRoute(false);
  });
  $("homeHeroLink")?.addEventListener("click", (event) => {
    event.preventDefault();
    if (!currentGalaxy) {
      openGalaxyMenu(event.currentTarget);
      return;
    }
    $("uxGalaxyView").scrollIntoView({ block: "start", behavior: motionEnabled ? "smooth" : "instant" });
    $("uxGalaxyTitle").focus({ preventScroll: true });
  });

  const highlightSearch = (element, value, tokens) => {
    if (!tokens.length) {
      element.textContent = value;
      return;
    }
    let normalized = "";
    let offset = 0;
    const positions = [];
    for (const character of value) {
      const plain = normalizeSearch(character);
      if (!plain && positions.length) positions[positions.length - 1].end = offset + character.length;
      for (let index = 0; index < plain.length; index++) positions.push({ start: offset, end: offset + character.length });
      normalized += plain;
      offset += character.length;
    }
    const ranges = [];
    for (const token of tokens) {
      let index = normalized.indexOf(token);
      while (index !== -1) {
        ranges.push({ start: positions[index].start, end: positions[index + token.length - 1].end });
        index = normalized.indexOf(token, index + token.length);
      }
    }
    ranges.sort((left, right) => left.start - right.start || left.end - right.end);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
      else merged.push({ ...range });
    }
    offset = 0;
    for (const range of merged) {
      element.append(document.createTextNode(value.slice(offset, range.start)), node("mark", "", value.slice(range.start, range.end)));
      offset = range.end;
    }
    element.append(document.createTextNode(value.slice(offset)));
  };
  const makeResult = (name, detail, action, url, tokens = []) => {
    const result = node(url ? "a" : "button");
    result.className = "ux-search-result";
    if (url) {
      result.href = url;
    } else result.type = "button";
    const copy = node("span", "");
    const title = node("strong");
    const subtitle = node("small");
    highlightSearch(title, name, tokens);
    highlightSearch(subtitle, detail, tokens);
    copy.append(title, subtitle);
    result.append(icon(url ? "orbit" : "grid"), copy, icon("arrow"));
    if (action) result.addEventListener("click", action);
    return result;
  };
  const renderSearch = () => {
    const query = normalizeSearch($("uxSearchInput").value).trim().replace(/\s+/g, " ");
    const tokens = [...new Set(query.split(" ").filter(Boolean))];
    const target = $("uxSearchResults");
    target.replaceChildren();
    const results = [];
    const addResult = (entry) => {
      const name = normalizeSearch(entry.name);
      const nativeName = normalizeSearch(entry.nativeName || "");
      const category = normalizeSearch(entry.category || "");
      const ownAliases = entry.aliases.map(normalizeSearch);
      const broadAliases = entry.categoryAliases.map(normalizeSearch);
      const fields = [name, nativeName, category, ...ownAliases, ...broadAliases];
      if (!matchesTokens(tokens, fields)) return;
      let rank = 100;
      if (query) {
        if (name === query) rank += 1000;
        else if (name.startsWith(query)) rank += 900;
        else if (nativeName === query) rank += 880;
        else if (nativeName.startsWith(query)) rank += 820;
        else if (tokens.every((token) => name.includes(token))) rank += 760;
        else if (ownAliases.includes(query)) rank += 720;
        else if (tokens.every((token) => [name, nativeName, ...ownAliases].some((field) => field.includes(token)))) rank += 650;
        else rank += tokens.filter((token) => name.includes(token) || nativeName.includes(token)).length * 80;
      }
      results.push({ ...entry, rank, order: results.length });
    };
    Object.entries(galaxies).forEach(([id, galaxy]) => {
      galaxy.worlds.forEach((world) => {
        addResult({
          name: world[0], nativeName: world[1], category: galaxy.name,
          aliases: courseAliases[world[0]] || [], categoryAliases: categoryAliases[id] || [],
          detail: galaxy.name,
          url: world[3],
          action: world[3] ? null : () => {
            dialogOpeners.delete($("uxSearchDialog"));
            $("uxSearchDialog").close();
            enterGalaxy(id);
            $("uxWorldFilter").value = world[0];
            renderWorlds();
            rememberBrowsingEdit();
          },
        });
      });
    });
    results.sort((left, right) => right.rank - left.rank || left.order - right.order);
    results.forEach((result) => target.append(makeResult(result.name, result.detail, result.action, result.url, tokens)));
    if ($("homeSearchCount")) $("homeSearchCount").textContent = results.length + (results.length === 1 ? " result" : " results");
    if ($("homeSearchReset")) $("homeSearchReset").hidden = !$("uxSearchInput").value;
    if (!target.children.length) target.append(node("p", "ux-empty", "No subjects found. Try a subject or language name."));
  };
  const dialogOpeners = new WeakMap();
  const openDialog = (id, opener = document.activeElement, initialQuery = "") => {
    const dialog = $(id);
    if (!dialog || dialog.open) return;
    if (id === "uxSearchDialog") {
      $("uxSearchInput").value = String(initialQuery).slice(0, 160);
      renderSearch();
    }
    dialogOpeners.set(dialog, opener);
    dialog.showModal();
    if (id === "uxSearchDialog") $("uxSearchInput").focus();
  };
  document.querySelectorAll("[data-open-dialog]").forEach((button) =>
    button.addEventListener("click", () => openDialog(button.dataset.openDialog, button))
  );
  document.querySelectorAll(".ux-dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((button) =>
      button.addEventListener("click", () => dialog.close())
    );
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      const opener = dialogOpeners.get(dialog);
      const active = document.activeElement;
      // The native close event can arrive after the learner has focused another
      // control. Restore abandoned focus without stealing that newer focus.
      if ((!active || active === document.body || dialog.contains(active)) && opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    });
  });
  $("uxSearchInput").addEventListener("input", renderSearch);
  $("homeSearchReset")?.addEventListener("click", () => {
    $("uxSearchInput").value = "";
    renderSearch();
    $("uxSearchInput").focus({ preventScroll: true });
  });
  document.querySelector('[data-search-scope="all"]')?.addEventListener("click", renderSearch);
  $("uxSearchDialog").addEventListener("keydown", (event) => {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    const fromInput = event.target === $("uxSearchInput");
    const result = event.target.closest?.("#uxSearchResults a[href], #uxSearchResults button");
    if (!fromInput && !result) return;
    if (!["ArrowDown", "ArrowUp"].includes(event.key) && !(result && ["Home", "End"].includes(event.key))) return;
    const options = [...$("uxSearchResults").querySelectorAll("a[href], button:not([disabled])")];
    if (!options.length) return;
    event.preventDefault();
    const current = options.indexOf(result);
    let next;
    if (event.key === "Home") next = options[0];
    else if (event.key === "End") next = options[options.length - 1];
    else if (fromInput) next = event.key === "ArrowDown" ? options[0] : options[options.length - 1];
    else next = options[current + (event.key === "ArrowDown" ? 1 : -1)] || $("uxSearchInput");
    next.focus({ preventScroll: true });
    if (next !== $("uxSearchInput")) next.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
  $("uxInfoExplore")?.addEventListener("click", () => {
    dialogOpeners.delete($("uxInfoDialog"));
    $("uxInfoDialog").close();
    enterGalaxy("languages");
  });
  document.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    const editing = event.target instanceof HTMLElement &&
      (event.target.matches("input, textarea, select") || event.target.isContentEditable);
    if (event.key === "Escape") {
      const dialog = document.querySelector(".ux-dialog[open]");
      if (dialog) {
        event.preventDefault();
        dialog.close();
      } else if (menuOpen) {
        event.preventDefault();
        syncMenu(false, true);
      } else if (currentGalaxy && !editing) {
        event.preventDefault();
        returnToUniverse();
      }
      return;
    }
    if (!editing && !menuOpen && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey &&
      event.key.toLowerCase() === "g" && !document.querySelector("dialog[open]")) {
      event.preventDefault();
      openGalaxyMenu();
      return;
    }
    if ((!editing && event.key === "/") || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      if (!document.querySelector("dialog[open]")) {
        event.preventDefault();
        openDialog("uxSearchDialog");
      }
    }
  });

  const space = $("uxSpace");
  const resetCamera = () => sceneEngine?.reset?.();
  $("uxHomeCamera")?.addEventListener("click", resetCamera);
  const syncMotion = () => {
    $("uxMotion")?.setAttribute("aria-pressed", String(motionEnabled));
    $("uxMotion")?.setAttribute("aria-label", motionEnabled ? "Pause motion" : "Turn motion on");
    if ($("homeMotionLabel")) $("homeMotionLabel").textContent = motionEnabled ? "Pause motion" : "Motion off";
    document.body.classList.toggle("motion-paused", !motionEnabled);
    if (!motionEnabled) {
      catalogAnimation?.cancel();
      cancelGalaxyTravel();
    }
    sceneEngine?.setMotion(motionEnabled);
  };
  $("uxMotion")?.addEventListener("click", () => {
    motionEnabled = !motionEnabled;
    syncMotion();
  });
  reducedMotion.addEventListener("change", () => {
    motionEnabled = !reducedMotion.matches;
    syncMotion();
  });
  const useFallback = (reason) => {
    if (!sceneEngine && fallbackReason) return;
    const active = document.activeElement;
    const recoverFocus = active instanceof HTMLElement && space.contains(active);
    sceneEngine?.destroy();
    sceneEngine = null;
    fallbackReason = reason;
    space.dataset.renderer = "fallback";
    document.body.classList.add("is-spatial-unavailable");
    if ($("homeSceneStatus")) $("homeSceneStatus").textContent = "Choose a galaxy from the list";
    if ($("uxHomeCamera")) $("uxHomeCamera").hidden = true;
    if (recoverFocus) (currentGalaxy ? $("uxGalaxyTitle") : $("homeTitle"))?.focus({ preventScroll: true });
    if (!currentGalaxy) syncMenu(true);
    announce("The animated view is unavailable. Choose a galaxy from the list.");
  };
  space.addEventListener("cosmica:contextlost", () => useFallback("context-lost"));
  space.addEventListener("cosmica:renderer-unavailable", () => useFallback("renderer-unavailable"));
  renderCategories();
  syncMenu(false);
  syncSound();
  try {
    if (!window.CosmicaRenderer?.createCosmicScene) throw new Error("Renderer unavailable");
    sceneEngine = window.CosmicaRenderer.createCosmicScene({
      mount: space,
      galaxies,
      onGalaxyEnter: (id) => enterGalaxy(id),
      onWorldSelect: (galaxyId, index) => {
        if (currentGalaxy !== galaxyId) enterGalaxy(galaxyId);
        const card = $("uxWorldGrid").querySelector('[data-world-index="' + index + '"]');
        const target = card?.querySelector("a");
        target?.focus({ preventScroll: true });
        card?.scrollIntoView({ block: "nearest", behavior: "instant" });
      },
      reducedMotion: reducedMotion.matches,
    });
    space.dataset.renderer = sceneEngine.getState?.().renderer || "svg";
    document.body.classList.remove("is-spatial-unavailable");
  } catch {
    useFallback(window.CosmicaRenderer?.createCosmicScene ? "initialization-failed" : "renderer-unavailable");
  }
  syncMotion();
  readRoute(false);
  if (!sceneEngine && !currentGalaxy) syncMenu(true);
  const getState = () => ({
    mode: currentGalaxy ? "galaxy" : "universe",
    selectedWorld: null,
    transitioning: false,
    motionEnabled,
    visible: Boolean(sceneEngine),
    contextLost: fallbackReason === "context-lost",
    galaxies: Object.keys(galaxies).length,
    worlds: currentGalaxy ? galaxies[currentGalaxy].worlds.length : availableSubjects.length,
    ...sceneEngine?.getState(),
    renderer: sceneEngine ? sceneEngine.getState?.().renderer || space.dataset.renderer || "svg" : "fallback",
    galaxyId: currentGalaxy,
    view: sceneEngine ? "map" : "list",
    spatialAvailable: Boolean(sceneEngine),
    fallbackReason,
    menuOpen,
    catalogVisible: !$("uxGalaxyView").hidden,
    filter: $("uxWorldFilter").value,
    searchScope,
    arrivalAnimating: galaxyTravelAnimation?.playState === "running",
  });
  window.cosmicaUniverse = { enterGalaxy, returnToUniverse, getState, resetCamera };

})();
