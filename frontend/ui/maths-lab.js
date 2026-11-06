/* Mathematics studio: one linear model driving graph, equation, table, and feedback. */
(() => {
  "use strict";

  const storageKey = "cosmica:maths:linear-functions:v1";
  const initial = { slope: 1.5, intercept: 2, mode: "line" };
  const state = { ...initial };
  const $ = (id) => document.getElementById(id);
  const graph = $("function-graph");
  if (!graph) return;
  const ns = "http://www.w3.org/2000/svg";
  const fmt = (value) => {
    const rounded = Math.round(value * 100) / 100;
    return Object.is(rounded, -0) ? "0" : String(rounded);
  };
  const spoken = (value) => value < 0 ? `negative ${fmt(Math.abs(value))}` : fmt(value);
  const evaluate = (x) => state.slope * x + state.intercept;
  const svgNode = (tag, attributes, text) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* Connected representations share the same model and plotting bounds. */
  function drawGraph() {
    const tank = state.mode === "tank";
    const domain = tank ? { minX: 0, maxX: 8, minY: 0, maxY: 16 } : { minX: -6, maxX: 6, minY: -10, maxY: 10 };
    const bounds = { x: 70, y: 28, width: 600, height: 330 };
    const px = (x) => bounds.x + ((x - domain.minX) / (domain.maxX - domain.minX)) * bounds.width;
    const py = (y) => bounds.y + bounds.height - ((y - domain.minY) / (domain.maxY - domain.minY)) * bounds.height;
    const grid = $("graph-grid");
    const axes = $("graph-axes");
    const labels = $("graph-labels");
    const points = $("graph-points");
    [grid, axes, labels, points].forEach((group) => group.replaceChildren());
    for (let x = domain.minX; x <= domain.maxX; x += tank ? 1 : 2) {
      grid.append(svgNode("line", { x1: px(x), y1: bounds.y, x2: px(x), y2: bounds.y + bounds.height, stroke: "#232938", "stroke-width": 0.7 }));
      labels.append(svgNode("text", { x: px(x), y: bounds.y + bounds.height + 23, "text-anchor": "middle", class: "grid-label" }, fmt(x)));
    }
    for (let y = domain.minY; y <= domain.maxY; y += 2) {
      grid.append(svgNode("line", { x1: bounds.x, y1: py(y), x2: bounds.x + bounds.width, y2: py(y), stroke: "#232938", "stroke-width": 0.7 }));
      labels.append(svgNode("text", { x: bounds.x - 13, y: py(y) + 3.5, "text-anchor": "end", class: "grid-label" }, fmt(y)));
    }
    axes.append(svgNode("line", { x1: px(0), y1: bounds.y, x2: px(0), y2: bounds.y + bounds.height, stroke: "#596174", "stroke-width": 1 }));
    axes.append(svgNode("line", { x1: bounds.x, y1: py(0), x2: bounds.x + bounds.width, y2: py(0), stroke: "#596174", "stroke-width": 1 }));
    $("function-line").setAttribute("d", `M ${px(domain.minX)} ${py(evaluate(domain.minX))} L ${px(domain.maxX)} ${py(evaluate(domain.maxX))}`);
    for (let x = domain.minX; x <= domain.maxX; x += 1) {
      const y = evaluate(x);
      if (y < domain.minY || y > domain.maxY) continue;
      points.append(svgNode("circle", { cx: px(x), cy: py(y), r: x === 0 ? 5.5 : 2.7, fill: x === 0 ? "#9ee9ce" : "#bcb1ef", stroke: "#10151f", "stroke-width": x === 0 ? 2.5 : 1.3 }));
    }
    $("x-axis-label").textContent = tank ? "x · time (minutes)" : "x · input";
    $("y-axis-label").textContent = tank ? "y · water (litres)" : "y · output";
  }

  function render() {
    const { slope, intercept, mode } = state;
    const tank = mode === "tank";
    $("slope").min = tank ? "0" : "-4";
    $("slope-number").min = tank ? "0" : "-4";
    $("intercept").min = tank ? "0" : "-6";
    $("intercept-number").min = tank ? "0" : "-6";
    $("slope").value = slope;
    $("slope-number").value = slope;
    $("intercept").value = intercept;
    $("intercept-number").value = intercept;
    const coefficient = slope === 1 ? "x" : slope === -1 ? "−x" : slope === 0 ? "0" : `${fmt(slope).replace("-", "−")}x`;
    const constant = intercept === 0 ? "" : ` ${intercept < 0 ? "−" : "+"} ${fmt(Math.abs(intercept))}`;
    $("equation-output").textContent = coefficient + constant;
    $("graph-mode").textContent = tank ? "A filling tank" : "Linear function";
    $("input-heading").textContent = tank ? "Minutes · x" : "Input · x";
    $("output-heading").textContent = tank ? "Litres · y" : "Output · y";
    const cells = $("values-row").querySelectorAll("td");
    cells.forEach((cell, index) => { cell.textContent = fmt(evaluate(index)); });
    $("value-caption").textContent = tank ? "Minutes elapsed and litres of water in the tank" : "Input and output values for the current linear function";
    const direction = slope > 0 ? "rises" : slope < 0 ? "falls" : "stays level";
    const step = slope === 0 ? "The output stays the same as x changes." : `Every step in x ${slope < 0 ? "subtracts" : "adds"} ${fmt(Math.abs(slope))} ${slope < 0 ? "from" : "to"} y.`;
    $("graph-summary").textContent = tank
      ? `The tank starts with ${fmt(intercept)} litres and gains ${fmt(slope)} litres each minute. After four minutes, the model gives ${fmt(evaluate(4))} litres.`
      : `The line starts at ${spoken(intercept)} on the vertical axis and ${direction}${slope === 0 ? "." : ` by ${fmt(Math.abs(slope))} for each step to the right.`}`;
    $("live-insight").textContent = tank
      ? "The filling rate changes the steepness. The water already in the tank moves the whole line up."
      : slope === 0
        ? "A zero slope makes a horizontal line: changing the input does not change the output."
        : slope < 0
          ? "A negative slope connects a larger input to a smaller output. Changing b shifts the line without changing its steepness."
          : "A positive slope connects a larger input to a larger output. Changing b shifts the line without changing its steepness.";
    $("table-explanation").textContent = tank
      ? `Each additional minute adds ${fmt(slope)} litres. The same rate appears in every column of the table.`
      : `${step} A constant change is what makes this relationship linear.`;
    $("prediction-prompt").textContent = tank
      ? "Using your current filling rate and starting amount, how many litres are in the tank after six minutes?"
      : "With your current equation, what is y when x = 6?";
    $("prediction-hint").textContent = tank
      ? "Six minutes of filling contributes six times the rate. Add the water already in the tank: amount = rate × 6 + starting amount."
      : "Six steps each contribute the slope. Add the starting value: y = m × 6 + b.";
    $("context-note").textContent = tank
      ? "This tank model assumes a constant inflow, no leaks, and enough capacity. Time and water amount are nonnegative; other conditions need a different model."
      : "A straight line can model a steady rate over a particular range. Real situations also have limits; a model is useful when its assumptions fit.";
    $("graph-title").textContent = `Graph of y = ${coefficient + constant}`;
    $("graph-description").textContent = $("graph-summary").textContent + " The table below gives exact values for inputs zero through four.";
    document.querySelectorAll("[data-preset]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.preset === mode)));
    const rangeLabels = document.querySelectorAll(".range-labels");
    rangeLabels[0].firstElementChild.textContent = tank ? "0" : "−4";
    rangeLabels[0].children[1].textContent = tank ? "2" : "0";
    rangeLabels[1].firstElementChild.textContent = tank ? "0" : "−6";
    rangeLabels[1].children[1].textContent = tank ? "3" : "0";
    drawGraph();
  }

  /* Input handling preserves valid model bounds and keeps feedback current. */
  function clearPrediction() {
    $("prediction").value = "";
    $("prediction-feedback").textContent = "Use the rate and starting value to work it out.";
    $("prediction-feedback").removeAttribute("data-state");
  }
  function updateParameter(key, input) {
    if (input.value.trim() === "") return;
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    const max = key === "slope" ? 4 : 6;
    const min = state.mode === "tank" ? 0 : -max;
    const step = key === "slope" ? 0.25 : 0.5;
    state[key] = Math.round(Math.max(min, Math.min(max, value)) / step) * step;
    clearPrediction();
    render();
    $("save-status").textContent = "Workspace changed. Save to keep this version.";
  }
  ["slope", "intercept"].forEach((key) => {
    $(key).addEventListener("input", (event) => updateParameter(key, event.target));
    $(`${key}-number`).addEventListener("change", (event) => updateParameter(key, event.target));
  });
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = button.dataset.preset;
      Object.assign(state, preset === "tank" ? { slope: 1.5, intercept: 2, mode: "tank" } : preset === "falling" ? { slope: -1, intercept: 3, mode: "falling" } : initial);
      clearPrediction();
      render();
      $("save-status").textContent = "Workspace changed. Save to keep this version.";
    });
  });
  $("prediction-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = Number($("prediction").value);
    if (!$("prediction").value.trim() || !Number.isFinite(answer)) return;
    const expected = evaluate(6);
    const correct = Math.abs(answer - expected) < 0.001;
    $("prediction-feedback").setAttribute("data-state", correct ? "correct" : "retry");
    $("prediction-feedback").textContent = correct
      ? `Yes. Six changes of ${fmt(state.slope)}, plus the starting ${fmt(state.intercept)}, gives ${fmt(expected)}${state.mode === "tank" ? " litres" : ""}. Try changing just one parameter and explain what follows.`
      : `Try separating the two parts: the starting value is ${fmt(state.intercept)}, and each of six steps contributes ${fmt(state.slope)}. Multiply the rate by six, then add the starting value.`;
  });

  /* Browser-local persistence is optional; unavailable storage never blocks learning. */
  $("save-work").addEventListener("click", () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      $("save-status").textContent = "Workspace saved on this device.";
    } catch {
      $("save-status").textContent = "This browser could not save your workspace. You can keep exploring.";
    }
  });
  $("reset-work").addEventListener("click", () => {
    Object.assign(state, initial);
    clearPrediction();
    render();
    $("save-status").textContent = "Workspace reset. Save to replace your saved version.";
  });
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && ["line", "tank", "falling"].includes(saved.mode) && Number.isFinite(saved.slope) && Number.isFinite(saved.intercept) && saved.slope >= (saved.mode === "tank" ? 0 : -4) && saved.slope <= 4 && saved.intercept >= (saved.mode === "tank" ? 0 : -6) && saved.intercept <= 6) {
      state.mode = saved.mode;
      state.slope = Math.round(saved.slope / 0.25) * 0.25;
      state.intercept = Math.round(saved.intercept / 0.5) * 0.5;
      $("save-status").textContent = "Your saved workspace has been restored.";
    }
  } catch {
    // Exploration remains fully available if saved state is missing or invalid.
  }
  render();
})();
