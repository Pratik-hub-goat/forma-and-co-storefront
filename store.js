
const STORE_KEYS = {
  wishlist: "forma-demo-wishlist",
  bag: "forma-demo-bag"
};

function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getWishlist() {
  const saved = readStore(STORE_KEYS.wishlist, []);
  return Array.isArray(saved) ? saved.filter(id =>
    PRODUCTS.some(product => String(product.id) === String(id))
  ) : [];
}

function saveWishlist(ids) {
  return writeStore(STORE_KEYS.wishlist, ids);
}

function toggleWishlist(productId) {
  const id = String(productId);
  const wishlist = getWishlist();
  const exists = wishlist.includes(id);

  const updated = exists
    ? wishlist.filter(item => item !== id)
    : [...wishlist, id];

  if (!saveWishlist(updated)) {
    return { success: false, saved: exists };
  }

  return { success: true, saved: !exists };
}

function getBag() {
  const saved = readStore(STORE_KEYS.bag, []);

  if (!Array.isArray(saved)) return [];

  return saved
    .filter(item =>
      item &&
      PRODUCTS.some(product => String(product.id) === String(item.id))
    )
    .map(item => ({
      id: String(item.id),
      quantity: Math.max(
        1,
        Math.min(10, Math.floor(Number(item.quantity) || 1))
      )
    }));
}

function saveBag(items) {
  return writeStore(STORE_KEYS.bag, items);
}

function addToDemoBag(productId, quantity = 1) {
  const id = String(productId);
  const productExists = PRODUCTS.some(
    product => String(product.id) === id
  );

  if (!productExists) {
    return { success: false, message: "Product not found." };
  }

  const amount = Math.floor(Number(quantity));

  if (!Number.isFinite(amount) || amount < 1 || amount > 10) {
    return {
      success: false,
      message: "Choose a quantity between 1 and 10."
    };
  }

  const bag = getBag();
  const existing = bag.find(item => item.id === id);

  if (existing) {
    if (existing.quantity + amount > 10) {
      return {
        success: false,
        message: "The demo bag limit is 10 per product."
      };
    }

    existing.quantity += amount;
  } else {
    bag.push({ id, quantity: amount });
  }

  if (!saveBag(bag)) {
    return {
      success: false,
      message: "Could not save your demo bag on this device."
    };
  }

  return { success: true, message: "Added to your demo bag." };
}

function updateDemoBagQuantity(productId, quantity) {
  const id = String(productId);
  const amount = Math.floor(Number(quantity));

  if (!Number.isFinite(amount) || amount < 1 || amount > 10) {
    return { success: false };
  }

  const bag = getBag();
  const item = bag.find(entry => entry.id === id);

  if (!item) return { success: false };

  item.quantity = amount;

  return { success: saveBag(bag) };
}

function removeFromDemoBag(productId) {
  const id = String(productId);
  const updated = getBag().filter(item => item.id !== id);

  return { success: saveBag(updated) };
}

function clearDemoBag() {
  return { success: saveBag([]) };
}

function getDemoBagDetails() {
  return getBag().map(item => {
    const product = PRODUCTS.find(
      entry => String(entry.id) === item.id
    );

    return {
      ...product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity
    };
  });
}

function getDemoBagCount() {
  return getBag().reduce((total, item) => total + item.quantity, 0);
}

function getDemoBagSubtotal() {
  return getDemoBagDetails().reduce(
    (total, item) => total + item.lineTotal,
    0
  );
}

function formatStorePrice(amount) {
  const inr = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(amount);

  const usd = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 87);

  return `₹${inr} · approx. $${usd} USD`;
}

function updateBagCountDisplays() {
  document.querySelectorAll(".bag-count").forEach(element => {
    element.textContent = getDemoBagCount();
  });
}

document.addEventListener("DOMContentLoaded", updateBagCountDisplays);
