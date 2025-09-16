// ===== Utilities
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// ===== Theme toggle (improved slider version)
const THEME_KEY = "theme";
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  const root = document.documentElement;
  const isLight = saved ? saved === "light" : false;
  root.classList.toggle("light", isLight);

  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const nowLight = !root.classList.contains("light");
    root.classList.toggle("light", nowLight);
    try { localStorage.setItem(THEME_KEY, nowLight ? "light" : "dark"); } catch {}
  });
})();


// ===== Mobile nav (adds .show to <ul class="nav-links" data-nav>)
(function initNav() {
  const list = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  if (!list || !toggle) return;

  const setOpen = (open) => {
    list.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    const open = list.classList.contains('show');
    setOpen(!open);
  });

  // close on link click (mobile)
  list.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setOpen(false));
  });

  // close on resize back to desktop
  const mq = window.matchMedia('(min-width: 721px)');
  mq.addEventListener?.('change', e => { if (e.matches) setOpen(false); });
})();

// ===== Reveal on scroll (adds .active to .reveal)
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach(el => el.classList.add('active'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  items.forEach(el => io.observe(el));
})();


// ===== Cart System =====
(function initCart() {
  const CART_KEY = "bloom_cart";
  const POINTS_KEY = "bloom_points";

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(item) {
    const cart = loadCart();
    const existing = cart.find(p => p.name === item.name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    saveCart(cart);
    alert(`${item.name} added to cart!`);
  }

  // Add-to-cart buttons
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = {
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price)
      };
      addToCart(item);
    });
  });

  // Cart page display
  const cartContainer = document.querySelector("#cart-items");
  if (cartContainer) {
    const cart = loadCart();
    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
      const subtotal = item.qty * item.price;
      total += subtotal;
      return `<article class="card">
        <h3>${item.name}</h3>
        <p>${item.qty} × AED ${item.price} = AED ${subtotal}</p>
      </article>`;
    }).join("");

    // Points system: 1 point per AED
    let points = parseInt(localStorage.getItem(POINTS_KEY) || "0", 10);
    let earned = total;
    const summary = document.querySelector("#cart-summary");
    summary.innerHTML = `<h3>Total: AED ${total}</h3>
      <p>Loyalty Points Balance: ${points}</p>
      <p>You will earn: ${earned} points from this order</p>`;

    const checkoutBtn = document.querySelector("#checkout-btn");
    checkoutBtn.addEventListener("click", () => {
      points += earned;
      localStorage.setItem(POINTS_KEY, points);
      localStorage.removeItem(CART_KEY);
      alert(`Order placed! You now have ${points} loyalty points.`);
      window.location.href = "index.html";
    });
  }
})();

// ===== Rewards System =====
(function initRewards() {
  const POINTS_KEY = "bloom_points";
  const summary = document.querySelector("#rewards-summary");
  if (!summary) return;

  let points = parseInt(localStorage.getItem(POINTS_KEY) || "0", 10);
  summary.innerHTML = `<h3>You have ${points} loyalty points</h3>`;

  // Redeem buttons
  document.querySelectorAll(".redeem-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost, 10);
      const reward = btn.dataset.reward;

      if (points >= cost) {
        points -= cost;
        localStorage.setItem(POINTS_KEY, points);
        alert(`🎉 You redeemed: ${reward}! Remaining points: ${points}`);
        summary.innerHTML = `<h3>You have ${points} loyalty points</h3>`;
      } else {
        alert("Not enough points to redeem this reward.");
      }
    });
  });
})();
