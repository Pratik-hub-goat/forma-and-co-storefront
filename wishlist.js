
const wishlistGrid = document.getElementById("wishlist-grid");
const wishlistEmpty = document.getElementById("wishlist-empty");
const wishlistStatus = document.getElementById("wishlist-status");

function renderWishlist() {
  const ids = getWishlist();
  const products = PRODUCTS.filter(product =>
    ids.includes(String(product.id))
  );

  wishlistEmpty.hidden = products.length > 0;
  wishlistGrid.hidden = products.length === 0;

  wishlistGrid.innerHTML = products.map(product => `
    <article class="wishlist-card">
      <a class="wishlist-image" href="product.html?id=${encodeURIComponent(product.id)}">
        <img src="${escapeWishlistHTML(product.image)}" alt="${escapeWishlistHTML(product.name)}" loading="lazy">
      </a>
      <p class="catalog-card-category">${escapeWishlistHTML(product.categoryName)}</p>
      <h2><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeWishlistHTML(product.name)}</a></h2>
      <p class="wishlist-price">${formatStorePrice(product.price)}</p>
      <div class="wishlist-actions">
        <a class="button button-dark" href="product.html?id=${encodeURIComponent(product.id)}">View item</a>
        <button type="button" data-remove="${encodeURIComponent(product.id)}">Remove ♡</button>
      </div>
    </article>
  `).join("");

  wishlistGrid.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      const id = decodeURIComponent(button.dataset.remove);
      const result = toggleWishlist(id);

      wishlistStatus.textContent = result.success
        ? "Item removed from your wishlist."
        : "Could not update your wishlist on this device.";

      renderWishlist();
    });
  });
}

function escapeWishlistHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

renderWishlist();
