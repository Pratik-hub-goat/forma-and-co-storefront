
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("product-search");
const sortSelect = document.getElementById("sort-select");
const resultCount = document.getElementById("result-count");
const activeFilters = document.getElementById("active-filters");
const emptyState = document.getElementById("empty-state");
const minPrice = document.getElementById("min-price");
const maxPrice = document.getElementById("max-price");
const priceError = document.getElementById("price-error");
const featuredFilter = document.getElementById("featured-filter");
const newFilter = document.getElementById("new-filter");

const categoryInputs = [
  ...document.querySelectorAll('input[name="category"]')
];

function getSelectedCategories() {
  return categoryInputs
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function readPrice(input) {
  if (input.value.trim() === "") return null;

  const value = Number(input.value);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function money(amount) {
  const usd = amount / 87; // Illustrative demo conversion

  const inrText = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(amount);

  const usdText = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(usd);

  return `₹${inrText} · approx. $${usdText} USD`;
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const categories = getSelectedCategories();
  const min = readPrice(minPrice);
  const max = readPrice(maxPrice);

  priceError.textContent = "";

  if (
    (minPrice.value.trim() !== "" && min === null) ||
    (maxPrice.value.trim() !== "" && max === null)
  ) {
    priceError.textContent = "Enter a valid, non-negative price.";
    return [];
  }

  if (min !== null && max !== null && min > max) {
    priceError.textContent = "Minimum price must not exceed maximum.";
    return [];
  }

  let results = PRODUCTS.filter((product) => {
    const searchableText = [
      product.name,
      product.categoryName,
      product.description,
      product.material,
      ...product.tags
    ].join(" ").toLowerCase();

    const matchesSearch = !query || searchableText.includes(query);
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category);
    const matchesMin = min === null || product.price >= min;
    const matchesMax = max === null || product.price <= max;
    const matchesFeatured = !featuredFilter.checked || product.featured;
    const matchesNew = !newFilter.checked || product.isNew;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMin &&
      matchesMax &&
      matchesFeatured &&
      matchesNew
    );
  });

  switch (sortSelect.value) {
    case "price-asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "name":
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      results.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
      break;
    default:
      results.sort((a, b) =>
        Number(b.featured) - Number(a.featured)
      );
  }

  return results;
}

function renderProducts() {
  const results = getFilteredProducts();

  resultCount.textContent =
    `${results.length} ${results.length === 1 ? "product" : "products"} found`;

  productGrid.innerHTML = results.map((product) => `
    <a class="catalog-card" href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="catalog-card-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >
        ${product.badge ? `<span class="catalog-badge">${product.badge}</span>` : ""}
        <span class="catalog-view">View details ↗</span>
      </div>
      <p class="catalog-card-category">${product.categoryName}</p>
      <h3>${product.name}</h3>
      <p class="catalog-card-price">${money(product.price)}</p>
      <span class="catalog-card-demo">Portfolio demo item</span>
    </a>
  `).join("");

  emptyState.hidden = results.length > 0;
  productGrid.hidden = results.length === 0;

  renderActiveFilters();
}

function renderActiveFilters() {
  const tags = [];
  const query = searchInput.value.trim();

  if (query) tags.push(`Search: “${query}”`);

  categoryInputs.forEach((input) => {
    if (input.checked) {
      tags.push(input.parentElement.textContent.trim());
    }
  });

  if (minPrice.value.trim()) tags.push(`Min ₹${minPrice.value}`);
  if (maxPrice.value.trim()) tags.push(`Max ₹${maxPrice.value}`);
  if (featuredFilter.checked) tags.push("Featured");
  if (newFilter.checked) tags.push("New arrivals");

  activeFilters.innerHTML = tags.map((tag) =>
    `<span class="filter-chip">${tag}</span>`
  ).join("");
}

function resetFilters() {
  searchInput.value = "";
  minPrice.value = "";
  maxPrice.value = "";
  featuredFilter.checked = false;
  newFilter.checked = false;
  categoryInputs.forEach((input) => {
    input.checked = false;
  });
  sortSelect.value = "featured";

  const params = new URLSearchParams(window.location.search);
  params.delete("category");

  const query = params.toString();
  history.replaceState(
    null,
    "",
    window.location.pathname + (query ? `?${query}` : "")
  );

  renderProducts();
}

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
minPrice.addEventListener("input", renderProducts);
maxPrice.addEventListener("input", renderProducts);
featuredFilter.addEventListener("change", renderProducts);
newFilter.addEventListener("change", renderProducts);
categoryInputs.forEach((input) =>
  input.addEventListener("change", renderProducts)
);

document.getElementById("clear-filters").addEventListener("click", resetFilters);
document.getElementById("empty-reset").addEventListener("click", resetFilters);

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category");

if (requestedCategory) {
  const matchingInput = categoryInputs.find(
    (input) => input.value === requestedCategory
  );

  if (matchingInput) matchingInput.checked = true;
}

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  });
});

renderProducts();
