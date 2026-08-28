import { BUILDER, BUILDER_DEFAULTS, BUILDER_PRESETS, whatsappLink } from "./data.js?v=demo";

const LABELS = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  storage: "Storage",
  motherboard: "Motherboard",
  psu: "PSU",
  case: "Case",
  cooling: "Cooling",
};

const ORDER = ["cpu", "gpu", "ram", "storage", "motherboard", "psu", "case", "cooling"];

function findPart(group, id) {
  return BUILDER[group].find((p) => p.id === id);
}

function compatibleMotherboard(cpu) {
  return BUILDER.motherboard.filter((m) => m.socket === cpu.socket);
}

function compatibleRam(mobo) {
  return BUILDER.ram.filter((r) => r.type === mobo.memory);
}

function autoFix(state) {
  const cpu = findPart("cpu", state.cpu);
  const boards = compatibleMotherboard(cpu);
  if (!boards.some((b) => b.id === state.motherboard)) {
    state.motherboard = boards[0].id;
  }
  const mobo = findPart("motherboard", state.motherboard);
  const rams = compatibleRam(mobo);
  if (!rams.some((r) => r.id === state.ram)) {
    state.ram = rams[0].id;
  }
  return state;
}

function render(root, state, opts) {
  autoFix(state);
  const cpu = findPart("cpu", state.cpu);
  const mobo = findPart("motherboard", state.motherboard);
  const ramOpts = compatibleRam(mobo);
  const boardOpts = compatibleMotherboard(cpu);

  const groups = {
    cpu: BUILDER.cpu,
    gpu: BUILDER.gpu,
    ram: ramOpts,
    storage: BUILDER.storage,
    motherboard: boardOpts,
    psu: BUILDER.psu,
    case: BUILDER.case,
    cooling: BUILDER.cooling,
  };

  const selected = Object.fromEntries(ORDER.map((k) => [k, findPart(k, state[k])]));

  const summaryRows = ORDER.map(
    (k) => `<div><dt>${LABELS[k]}</dt><dd>${selected[k].name}</dd></div>`
  ).join("");

  const controls = ORDER.map((key) => {
    const options = groups[key];
    return `<div class="part-group">
      <label>${LABELS[key]}</label>
      <div class="part-options">
        ${options
          .map((opt) => {
            const on = opt.id === state[key] ? "is-on" : "";
            return `<button type="button" class="part-opt ${on}" data-part="${key}" data-id="${opt.id}">
              <b>${opt.name}${opt.tag ? ` · ${opt.tag}` : ""}</b>
              <span>${opt.desc || ""}</span>
            </button>`;
          })
          .join("")}
      </div>
    </div>`;
  }).join("");

  const presets = BUILDER_PRESETS.map(
    (p) => `<button type="button" class="preset ${p.id === state.preset ? "is-on" : ""}" data-preset="${p.id}">
      ${p.name} · ${p.blurb}
    </button>`
  ).join("");

  root.innerHTML = `
    <div class="builder-panel">
      <div class="builder-visual">
        <img src="images/cat-builds.jpg" alt="Custom PC build" />
        <div class="overlay">
          <dl>${summaryRows}</dl>
        </div>
      </div>
      <div class="builder-controls">
        <div class="kicker">Configure</div>
        <h3 style="font-family:var(--display);font-size:1.5rem;margin-bottom:12px;letter-spacing:-.03em">Pick your parts</h3>
        <div class="presets">${presets}</div>
        ${opts.full ? controls : ORDER.slice(0, 4).map((key) => {
          const options = groups[key];
          return `<div class="part-group">
            <label>${LABELS[key]}</label>
            <div class="part-options">
              ${options
                .map((opt) => {
                  const on = opt.id === state[key] ? "is-on" : "";
                  return `<button type="button" class="part-opt ${on}" data-part="${key}" data-id="${opt.id}">
                    <b>${opt.name}</b>
                    <span>${opt.desc || ""}</span>
                  </button>`;
                })
                .join("")}
            </div>
          </div>`;
        }).join("")}
        ${!opts.full ? `<p class="lede" style="margin:8px 0 0;font-size:.88rem">Motherboard, PSU, case and cooling auto-match your CPU. Open the full builder to fine-tune every part.</p>` : ""}
        <p class="compat-note">Matched ${cpu.socket} · ${mobo.memory} — parts stay compatible as you switch CPUs.</p>
        <div class="builder-total">
          <div>
            <small>Pricing</small>
            <div class="sum discuss">Discussions open</div>
          </div>
          <button type="button" class="btn btn-accent" data-request>Request Build</button>
        </div>
      </div>
    </div>`;

  root.querySelectorAll("[data-part]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state[btn.dataset.part] = btn.dataset.id;
      state.preset = null;
      render(root, state, opts);
    });
  });
  root.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = BUILDER_PRESETS.find((p) => p.id === btn.dataset.preset);
      Object.assign(state, preset.parts, { preset: preset.id });
      render(root, state, opts);
    });
  });
  root.querySelector("[data-request]")?.addEventListener("click", () => openRequest(state));
}

function openRequest(state) {
  let modal = document.querySelector("[data-build-modal]");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.dataset.buildModal = "";
    document.body.appendChild(modal);
  }
  const lines = ORDER.map((k) => `${LABELS[k]}: ${findPart(k, state[k]).name}`).join("\n");
  const msg = `Hi Demo — I’d like to request this custom build. Discussions open.\n${lines}`;
  modal.innerHTML = `
    <div class="overlay is-on" data-close-modal></div>
    <div class="modal-card">
      <h3 style="font-family:var(--display);font-size:1.5rem;margin-bottom:8px">Request this build</h3>
      <p class="lede" style="margin-bottom:14px">We’ll confirm parts, lead time, and a quote. Discussions open on every build.</p>
      <form class="form" data-build-form>
        <label>Name</label>
        <input name="name" required placeholder="Your name" />
        <label>Email or phone</label>
        <input name="contact" required placeholder="How should we reach you?" />
        <label>Notes</label>
        <textarea name="notes" placeholder="Games, apps, screen resolution, colour preference…">${lines}</textarea>
        <button class="btn btn-primary btn-full" type="submit">Send request</button>
        <a class="btn btn-whatsapp btn-full" href="${whatsappLink(msg)}">Or WhatsApp this spec</a>
      </form>
    </div>`;
  modal.classList.add("is-on");
  modal.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.classList.remove("is-on"));
  modal.querySelector("[data-build-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    modal.classList.remove("is-on");
    const t = document.querySelector(".toast") || Object.assign(document.createElement("div"), { className: "toast" });
    if (!t.parentNode) document.body.appendChild(t);
    t.textContent = "Build request sent — we’ll be in touch.";
    t.classList.add("is-on");
    setTimeout(() => t.classList.remove("is-on"), 2400);
  });
}

export function initBuilder(root, opts = {}) {
  if (!root) return;
  const state = { ...BUILDER_DEFAULTS, preset: "starter" };
  render(root, state, opts);
}
