import {
  SITE,
  PRODUCTS,
  CATEGORIES,
  REVIEWS,
  GRADES,
  getProduct,
  productsByCategory,
  whatsappLink,
} from "./data.js?v=demo";
import { initBuilder } from "./builder.js?v=demo";

const CART_KEY = "demo-cart";

const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.5 2 2 6.4 2 11.86c0 1.74.46 3.44 1.34 4.94L2 22l5.36-1.37a10.1 10.1 0 004.68 1.16h.04c5.54 0 10.04-4.4 10.04-9.86C22.12 6.4 17.58 2 12.04 2zm5.84 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.82-.11-.42-.14-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.96-4.4-.14-.2-1.16-1.54-1.16-2.94s.74-2.08 1-2.36c.24-.28.54-.34.72-.34h.52c.16 0 .4-.06.62.48.24.56.8 1.94.86 2.08.08.14.12.3.02.48-.1.2-.16.3-.3.46-.14.16-.3.36-.42.48-.14.14-.28.28-.12.54.16.28.72 1.18 1.54 1.92 1.06.94 1.94 1.24 2.22 1.38.28.14.44.12.6-.06.16-.2.7-.82.88-1.1.18-.28.36-.22.62-.12.26.08 1.66.78 1.94.92.28.14.46.22.54.34.08.12.08.7-.16 1.38z"/></svg>`,
};

export function gradeClass(condition) {
  if (condition.startsWith("Excellent")) return "Excellent";
  if (condition.startsWith("Very")) return "Very";
  if (condition.startsWith("New")) return "New";
  return "Good";
}

export function productCard(p) {
  return `
    <article class="product-card">
      <a class="product-media" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}" />
        <span class="badge badge-${gradeClass(p.condition)} badge-abs">${p.condition}</span>
      </a>
      <div class="product-body">
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="specs">${p.specs.slice(0, 4).map((s) => `<span class="spec-pill">${s}</span>`).join("")}</div>
        <div class="price-row">
          <span class="price-now discuss">Discussions open</span>
        </div>
        <a class="btn btn-secondary btn-sm" href="product.html?id=${p.id}">View Product</a>
      </div>
    </article>`;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
}

export function addToCart(id, qty = 1) {
  const items = getCart();
  const found = items.find((i) => i.id === id);
  if (found) found.qty += qty;
  else items.push({ id, qty });
  setCart(items);
  toast("Added to cart");
  renderCartDrawer();
}

function removeFromCart(id) {
  setCart(getCart().filter((i) => i.id !== id));
  renderCartDrawer();
  renderCartPage();
}

function cartCount() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

function cartTotal() {
  return getCart().reduce((n, i) => {
    const p = getProduct(i.id);
    return n + (p ? p.price * i.qty : 0);
  }, 0);
}

function updateCartCount() {
  document.querySelectorAll(".cart-count").forEach((el) => {
    const n = cartCount();
    el.textContent = n;
    el.classList.toggle("is-on", n > 0);
  });
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function renderCartDrawer() {
  const body = document.querySelector("[data-cart-body]");
  const total = document.querySelector("[data-cart-total]");
  if (!body) return;
  const items = getCart();
  if (!items.length) {
    body.innerHTML = `<p class="lede">Your cart is empty. Browse the shop to add a tested device.</p>`;
  } else {
    body.innerHTML = items
      .map((i) => {
        const p = getProduct(i.id);
        if (!p) return "";
        return `<div class="mini-line">
          <img src="${p.image}" alt="" />
          <div>
            <b>${p.shortName}</b>
            <div class="lede" style="font-size:.82rem">Qty ${i.qty}</div>
            <button class="remove" data-remove="${p.id}">Remove</button>
          </div>
          <div class="discuss">Discussions open</div>
        </div>`;
      })
      .join("");
  }
  if (total) total.textContent = "Discussions open";
  body.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
}

function renderCartPage() {
  const root = document.querySelector("[data-cart-page]");
  if (!root) return;
  const items = getCart()
    .map((i) => ({ ...i, p: getProduct(i.id) }))
    .filter((i) => i.p);
  if (!items.length) {
    root.innerHTML = `<div class="empty">Your cart is empty. <a href="shop.html">Shop products</a>.</div>`;
    const sum = document.querySelector("[data-cart-summary]");
    if (sum) sum.style.display = "none";
    return;
  }
  root.innerHTML = items
    .map(
      ({ p, qty }) => `<div class="cart-line">
        <img src="${p.image}" alt="${p.name}" />
        <div>
          <a href="product.html?id=${p.id}"><b>${p.name}</b></a>
          <div class="lede" style="font-size:.85rem">${p.condition} · Qty ${qty}</div>
          <button class="btn-ghost" data-remove="${p.id}">Remove</button>
        </div>
        <div class="price-now discuss">Discussions open</div>
      </div>`
    )
    .join("");
  root.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
  const sub = document.querySelector("[data-subtotal]");
  if (sub) sub.textContent = "Discussions open";
}

function openDrawer(sel) {
  document.querySelector(".overlay")?.classList.add("is-on");
  document.querySelector(sel)?.classList.add("is-on");
}
function closeDrawers() {
  document.querySelectorAll(".overlay, .drawer, .mobile-nav, .search-modal, .modal").forEach((el) => {
    el.classList.remove("is-on");
  });
}

function initSearch() {
  const modal = document.querySelector(".search-modal");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  document.querySelectorAll("[data-open-search]").forEach((b) =>
    b.addEventListener("click", () => {
      modal.classList.add("is-on");
      setTimeout(() => input?.focus(), 50);
    })
  );
  document.querySelector("[data-close-search]")?.addEventListener("click", closeDrawers);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeDrawers();
  });
  input?.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) {
      results.innerHTML = "";
      return;
    }
    const hits = PRODUCTS.filter((p) =>
      [p.name, p.shortName, p.category, p.condition, ...(p.specs || [])].join(" ").toLowerCase().includes(q)
    ).slice(0, 8);
    results.innerHTML = hits.length
      ? hits
          .map(
            (p) => `<a class="search-hit" href="product.html?id=${p.id}">
              <img src="${p.image}" alt="" />
              <div><b>${p.name}</b><div class="lede" style="font-size:.8rem">${p.condition}</div></div>
              <div class="discuss">Discussions open</div>
            </a>`
          )
          .join("")
      : `<p class="lede">No matches. Try “RTX”, “iPhone”, or “laptop”.</p>`;
  });
}

function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav a, .mobile-nav a").forEach((a) => {
    if (a.dataset.page === page) a.classList.add("is-active");
  });
}

function renderHome() {
  const cats = document.querySelector("[data-categories]");
  if (cats) {
    cats.innerHTML = CATEGORIES.map(
      (c, i) => `<a class="cat-card" href="${c.href}" data-reveal="${(i % 3) + 1}">
        <img src="${c.image}" alt="${c.name}" />
        <div class="cat-body">
          <h3>${c.name}</h3>
          <p>${c.description}</p>
          <span class="btn btn-secondary btn-sm">Explore</span>
        </div>
      </a>`
    ).join("");
  }
  const feat = document.querySelector("[data-featured]");
  if (feat) {
    feat.innerHTML = PRODUCTS.filter((p) => p.featured)
      .slice(0, 8)
      .map(productCard)
      .join("");
  }
  const why = document.querySelector("[data-why]");
  if (why) {
    const items = [
      {
        title: "Tested & Verified",
        text: "Every pre-owned device is tested before being listed.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9.5"/></svg>`,
      },
      {
        title: "Better Prices",
        text: "Get quality technology without paying full retail prices.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M8 8h5.5a3 3 0 010 6H8h6.5a3 3 0 010 6H8"/></svg>`,
      },
      {
        title: "Custom Builds",
        text: "PCs configured around your budget and performance requirements.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h.01M12 9h4"/></svg>`,
      },
      {
        title: "Warranty & Support",
        text: "Clear warranty information and after-sales support.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12a8 8 0 1014.9-4"/><path d="M20 4v6h-6"/></svg>`,
      },
    ];
    why.innerHTML = items
      .map(
        (it) => `<article class="why-card" data-reveal>
          <div class="why-icon">${it.icon}</div>
          <h3>${it.title}</h3>
          <p>${it.text}</p>
        </article>`
      )
      .join("");
  }
  const grades = document.querySelector("[data-grades]");
  if (grades) {
    grades.innerHTML = GRADES.map(
      (g) => `<article class="grade-card grade-${gradeClass(g.id)}" data-reveal>
        <header>
          <h3>${g.title}</h3>
          <span class="badge badge-${gradeClass(g.id)}">${g.score}/100</span>
        </header>
        <div class="summary">${g.summary}</div>
        <div class="grade-meter"><span style="width:${g.score}%"></span></div>
        <p>${g.detail}</p>
      </article>`
    ).join("");
  }
  const reviews = document.querySelector("[data-reviews]");
  if (reviews) {
    reviews.innerHTML = REVIEWS.map(
      (r) => `<article class="review-card" data-reveal>
        <div class="stars">${"★".repeat(r.rating)}</div>
        <p>“${r.text}”</p>
        <div class="reviewer">
          <div class="avatar">${r.name.split(" ").map((w) => w[0]).join("")}</div>
          <div><b>${r.name}</b><small>${r.role}</small></div>
        </div>
      </article>`
    ).join("");
  }
}

function initShop() {
  const root = document.querySelector("[data-shop]");
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get("category") || "all",
    condition: params.get("condition") || "all",
    sort: "featured",
  };

  const apply = () => {
    let list = productsByCategory(state.category);
    if (state.condition !== "all") {
      list = list.filter((p) => p.condition === state.condition || (state.condition === "New Build" && p.condition === "New Build"));
    }
    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    const count = document.querySelector("[data-count]");
    if (count) count.textContent = `${list.length} device${list.length === 1 ? "" : "s"}`;
    root.innerHTML = list.length ? list.map(productCard).join("") : `<div class="empty">No products in this filter.</div>`;
    document.querySelectorAll("[data-filter]").forEach((chip) => {
      const key = chip.dataset.filter;
      chip.classList.toggle("is-on", state[key] === chip.dataset.value);
    });
    const titles = {
      pcs: "Second-Hand PCs",
      laptops: "Laptops",
      phones: "Phones",
      components: "PC Components",
      custom: "Custom PC Builds",
      all: "Shop",
    };
    const h = document.querySelector("[data-shop-title]");
    if (h) h.textContent = titles[state.category] || "Shop";
  };

  document.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state[chip.dataset.filter] = chip.dataset.value;
      apply();
    });
  });
  document.querySelector("[data-sort]")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    apply();
  });
  apply();
}

function initProduct() {
  const root = document.querySelector("[data-pdp]");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = getProduct(id);
  if (!p) {
    root.innerHTML = `<div class="empty">Product not found. <a href="shop.html">Return to shop</a>.</div>`;
    return;
  }
  document.title = `${p.name} — ${SITE.name}`;
  let qty = 1;
  const gallery = p.gallery?.length ? p.gallery : [p.image];
  root.innerHTML = `
    <div>
      <div class="pdp-gallery"><img data-main-img src="${gallery[0]}" alt="${p.name}" /></div>
      ${
        gallery.length > 1
          ? `<div class="thumbs">${gallery
              .map((g, i) => `<button class="${i === 0 ? "is-on" : ""}" data-thumb="${g}"><img src="${g}" alt="" /></button>`)
              .join("")}</div>`
          : ""
      }
    </div>
    <div>
      <span class="badge badge-${gradeClass(p.condition)}">${p.condition}</span>
      <h1>${p.name}</h1>
      <p class="lede">${p.notes}</p>
      <div class="pdp-price">
        <span class="price-now discuss">Discussions open</span>
      </div>
      <p class="lede">${p.stock > 5 ? "In stock" : p.stock > 0 ? `Only ${p.stock} left` : "Made to order"} · ${p.warranty} warranty · SKU ${p.id.toUpperCase()}</p>
      <div class="pdp-actions">
        <div class="qty">
          <button data-qty="-1" aria-label="Decrease">−</button>
          <span data-qty-val>1</span>
          <button data-qty="1" aria-label="Increase">+</button>
        </div>
        <button class="btn btn-primary" data-add>Add to cart</button>
        <a class="btn btn-whatsapp" href="${whatsappLink(`Hi Demo — I’m interested in the ${p.name} (${p.condition}). Discussions open — is it still available?`)}">${icons.wa} WhatsApp</a>
      </div>
      <h3 style="margin-bottom:8px">Specifications</h3>
      <table class="spec-table">
        ${Object.entries(p.specList)
          .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
          .join("")}
      </table>
      ${p.tested ? `<p class="notes">Tested: ${p.tested.join(" · ")}</p>` : ""}
    </div>`;

  root.querySelectorAll("[data-thumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelector("[data-main-img]").src = btn.dataset.thumb;
      root.querySelectorAll("[data-thumb]").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
    });
  });
  root.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      qty = Math.max(1, qty + Number(btn.dataset.qty));
      root.querySelector("[data-qty-val]").textContent = qty;
    });
  });
  root.querySelector("[data-add]")?.addEventListener("click", () => addToCart(p.id, qty));

  const rel = document.querySelector("[data-related]");
  if (rel) {
    const others = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    rel.innerHTML = others.map(productCard).join("");
  }
}

function initContact() {
  const form = document.querySelector("[data-contact-form]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Message received — we’ll reply shortly.");
    form.reset();
  });
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = whatsappLink();
  });
}

function wireChrome() {
  document.querySelectorAll("[data-open-cart]").forEach((b) =>
    b.addEventListener("click", () => {
      renderCartDrawer();
      openDrawer(".cart-drawer");
    })
  );
  document.querySelectorAll("[data-open-menu]").forEach((b) => b.addEventListener("click", () => openDrawer(".mobile-nav")));
  document.querySelector(".overlay")?.addEventListener("click", closeDrawers);
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeDrawers));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawers();
  });
  updateCartCount();
  setActiveNav();
  document.querySelectorAll("[data-wa-nav]").forEach((a) => (a.href = whatsappLink()));
}

document.addEventListener("DOMContentLoaded", () => {
  wireChrome();
  initSearch();
  initReveal();
  const page = document.body.dataset.page;
  if (page === "home") {
    renderHome();
    initBuilder(document.querySelector("[data-builder]"));
  }
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "builder") initBuilder(document.querySelector("[data-builder]"), { full: true });
  if (page === "cart") renderCartPage();
  initContact();
  initReveal();
});
