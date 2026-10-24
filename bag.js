
function escapeBagHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[char];
  });
}

function formatBagPrice(amount) {
  const inr = Number(amount) || 0;
  const usd = inr / 87;

  return `₹${inr.toLocaleString("en-IN")} · approx. $${usd.toFixed(2)} USD`;
}

function renderBag() {
  const itemsContainer = document.getElementById("bag-items");
  const emptyMessage = document.getElementById("bag-empty");
  const statusMessage = document.getElementById("bag-status");
  const itemCount = document.getElementById("bag-item-count");
  const summaryCount = document.getElementById("bag-summary-count");
  const subtotalElement = document.getElementById("bag-subtotal");

  if (!itemsContainer) return;

  const items = getDemoBagDetails();
  const totalUnits = getDemoBagCount();
  const subtotal = getDemoBagSubtotal();

  if (itemCount) itemCount.textContent = totalUnits;
  if (summaryCount) summaryCount.textContent = totalUnits;

  if (subtotalElement) {
    subtotalElement.textContent = formatBagPrice(subtotal);
  }

  if (items.length === 0) {
    itemsContainer.innerHTML = "";

    if (emptyMessage) emptyMessage.hidden = false;

    if (statusMessage) {
      statusMessage.textContent = "Your demo bag is empty.";
    }

    return;
  }

  if (emptyMessage) emptyMessage.hidden = true;

  itemsContainer.innerHTML = items.map(function (product) {
    const productId = escapeBagHTML(product.id);
    const productName = escapeBagHTML(product.name);
    const productImage = escapeBagHTML(product.image);
    const productCategory = escapeBagHTML(
      product.categoryName || product.category || "Everyday living"
    );

    return `
      <article class="bag-item">
        <a class="bag-item-image-link"
           href="product.html?id=${encodeURIComponent(product.id)}"
           aria-label="View ${productName}">
          <img
            class="bag-item-image"
            src="${productImage}"
            alt="${productName}"
            loading="lazy"
          >
        </a>

        <div class="bag-item-info">
          <p class="bag-item-category">${productCategory}</p>

          <h2 class="bag-item-name">
            <a href="product.html?id=${encodeURIComponent(product.id)}">
              ${productName}
            </a>
          </h2>

          <p class="bag-item-price">${formatBagPrice(product.price)}</p>

          <div class="bag-item-controls">
            <label class="bag-quantity-label"
                   for="quantity-${productId}">
              Quantity
            </label>

            <div class="bag-quantity-control">
              <button
                type="button"
                class="bag-quantity-button"
                data-action="decrease"
                data-id="${productId}"
                aria-label="Decrease quantity of ${productName}"
                ${product.quantity <= 1 ? "disabled" : ""}
              >−</button>

              <output id="quantity-${productId}"
                      class="bag-quantity-value">
                ${product.quantity}
              </output>

              <button
                type="button"
                class="bag-quantity-button"
                data-action="increase"
                data-id="${productId}"
                aria-label="Increase quantity of ${productName}"
                ${product.quantity >= 10 ? "disabled" : ""}
              >+</button>
            </div>

            <button
              type="button"
              class="bag-remove-button"
              data-action="remove"
              data-id="${productId}"
            >Remove</button>
          </div>
        </div>

        <p class="bag-item-total">
          ${formatBagPrice(product.lineTotal)}
        </p>
      </article>
    `;
  }).join("");

  if (statusMessage) {
    statusMessage.textContent =
      `${totalUnits} item${totalUnits === 1 ? "" : "s"} in your demo bag.`;
  }
}

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action][data-id]");

  if (!button) return;

  const action = button.dataset.action;
  const productId = button.dataset.id;

  if (action === "increase") {
    const result = updateDemoBagQuantity(
      productId,
      (getDemoBagDetails().find(item => String(item.id) === productId)?.quantity || 0) + 1
    );

    if (result.success) renderBag();
  }

  if (action === "decrease") {
    const currentItem = getDemoBagDetails().find(
      item => String(item.id) === productId
    );

    if (!currentItem) return;

    const result = updateDemoBagQuantity(
      productId,
      currentItem.quantity - 1
    );

    if (result.success) renderBag();
  }

  if (action === "remove") {
    removeFromDemoBag(productId);
    renderBag();
  }
});

document.addEventListener("DOMContentLoaded", renderBag);
