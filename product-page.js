
const detailContainer = document.getElementById("product-detail");
const relatedGrid = document.getElementById("related-grid");
const breadcrumbProduct = document.getElementById("breadcrumb-product");

function formatDualPrice(amount) {
  const inr = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(amount);

  const usd = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 87);

  return `₹${inr} · approx. $${usd} USD`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderProduct(product) {
  document.title = `${product.name} — FORMA & CO.`;
  breadcrumbProduct.textContent = product.name;

  const images = Array.isArray(product.gallery) && product.gallery.length
    ? [...new Set([product.image, ...product.gallery].filter(Boolean))]
    : [product.image].filter(Boolean);

  const safeName = escapeHTML(product.name);
  const safeCategory = escapeHTML(product.categoryName);
  const safeDescription = escapeHTML(
    product.description || "A thoughtfully presented item from our fictional demo collection."
  );
  const safeMaterial = escapeHTML(product.material || "Demo specification");
  const safeTags = Array.isArray(product.tags)
    ? product.tags.map(escapeHTML).join(", ")
    : "Lifestyle collection";

  detailContainer.innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img
          id="main-product-image"
          src="${escapeHTML(images[0] || "")}"
          alt="${safeName}"
        >
        ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
      </div>
      ${
        images.length > 1
          ? `<div class="product-thumbnails" aria-label="Product image gallery">
              ${images.map((image, index) => `
                <button
                  type="button"
                  class="product-thumbnail ${index === 0 ? "selected" : ""}"
                  data-image-index="${index}"
                  aria-label="View product image ${index + 1}"
                  aria-pressed="${index === 0}"
                >
                  <img src="${escapeHTML(image)}" alt="">
                </button>
              `).join("")}
            </div>`
          : `<p class="gallery-caption">Product preview · Demo image</p>`
      }
    </div>

    <div class="product-information">
      <p class="eyebrow">${safeCategory}</p>
      <h1>${safeName}</h1>


<p class="product-price">${formatDualPrice(product.price)}</p>
<p class="product-currency-note">Illustrative conversion at ₹87 = $1 USD.</p>

<div class="product-action-buttons">
  <button type="button" class="product-add-button" id="add-to-demo-bag">
    Add to Bag
  </button>

  <button
    type="button"
    class="product-wishlist-button"
    id="toggle-product-wishlist"
    aria-pressed="false"
  >
    ♡ Save to Wishlist
  </button>

  <a href="bag.html" class="product-view-bag">View Bag</a>
</div>

<p
  id="wishlist-action-message"
  class="wishlist-action-message"
  role="status"
  aria-live="polite"
></p>

<p id="bag-action-message" class="bag-action-message" role="status" aria-live="polite"></p>

<p class="product-description">${safeDescription}</p>


      <div class="product-specifications">
        <h2>Details</h2>
        <div class="specification-row">
          <span>Collection</span>
          <span>${safeCategory}</span>
        </div>
        <div class="specification-row">
          <span>Material</span>
          <span>${safeMaterial}</span>
        </div>
        <div class="specification-row">
          <span>Tags</span>
          <span>${safeTags}</span>
        </div>
        <div class="specification-row">
          <span>Availability</span>
          <span>Demo item</span>
        </div>
      </div>

      <div class="product-demo-box">
        <p><strong>Portfolio demonstration</strong></p>
        <p>This item is for browsing only. No checkout, payment or real order is available.</p>
        <button type="button" class="product-back-button" id="back-to-shop">
          Continue exploring
        </button>
      </div>
    </div>
  `;

  detailContainer.querySelectorAll("[data-image-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.imageIndex);
      const mainImage = document.getElementById("main-product-image");

      mainImage.src = images[index];
      mainImage.alt = `${product.name} — image ${index + 1}`;

      detailContainer.querySelectorAll("[data-image-index]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
  });

  document.getElementById("back-to-shop").addEventListener("click", () => {
    window.location.href = "shop.html";
  });
  
  
document.getElementById("add-to-demo-bag").addEventListener("click", () => {
  const result = addToDemoBag(product.id);
  const message = document.getElementById("bag-action-message");

  if (result.success) {
    updateBagCountDisplays();
    message.textContent = `${product.name} added to your demo bag!`;
  } else {
    message.textContent = result.message || "Unable to update your demo bag.";
  }
});

// Wishlist button
const wishlistButton = document.getElementById("toggle-product-wishlist");
const wishlistMessage = document.getElementById("wishlist-action-message");

// Check whether this product is already saved
function updateProductWishlistButton(isSaved) {
  wishlistButton.textContent = isSaved
    ? "♥ Saved to Wishlist"
    : "♡ Save to Wishlist";

  wishlistButton.setAttribute("aria-pressed", String(isSaved));
}

// Show the correct state when the product page loads
const initiallySaved = getWishlist().some(
  id => String(id) === String(product.id)
);

updateProductWishlistButton(initiallySaved);

// Save or remove the product when clicked
wishlistButton.addEventListener("click", () => {
  const result = toggleWishlist(product.id);

  if (!result.success) {
    wishlistMessage.textContent = "Unable to update your wishlist. Please try again.";
    return;
  }

  updateProductWishlistButton(result.saved);

  wishlistMessage.textContent = result.saved
    ? `${product.name} added to your wishlist!`
    : `${product.name} removed from your wishlist.`;
});

}

function renderRelatedProducts(currentProduct) {
  const related = PRODUCTS
    .filter((product) =>
      product.id !== currentProduct.id &&
      product.category === currentProduct.category
    )
    .slice(0, 4);

  const fallback = PRODUCTS
    .filter((product) => product.id !== currentProduct.id)
    .slice(0, 4);

  const productsToShow = related.length ? related : fallback;

  relatedGrid.innerHTML = productsToShow.map((product) => `
    <a class="related-card" href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="related-image">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
      </div>
      <p>${escapeHTML(product.categoryName)}</p>
      <h3>${escapeHTML(product.name)}</h3>
      <span>${formatDualPrice(product.price)}</span>
    </a>
  `).join("");
}

const productParams = new URLSearchParams(window.location.search);
const requestedProductId = productParams.get("id");

const currentProduct = PRODUCTS.find(
  (product) => String(product.id) === requestedProductId
);

if (currentProduct) {
  renderProduct(currentProduct);
  renderRelatedProducts(currentProduct);
} else {
  document.title = "Product not found — FORMA & CO.";
  breadcrumbProduct.textContent = "Not found";

  detailContainer.innerHTML = `
    <div class="product-not-found">
      <p class="eyebrow">NOT IN THIS COLLECTION</p>
      <h1>We couldn't find that item.</h1>
      <p>The product link may be incomplete or the item may not exist in this demo catalog.</p>
      <a class="product-back-button" href="shop.html">Browse all products</a>
    </div>
  `;

  relatedGrid.innerHTML = "";
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
