(function () {
  const grid = document.getElementById("productGrid");
  const searchInput = document.getElementById("searchInput");
  const resultsCount = document.getElementById("resultsCount");
  const emptyState = document.getElementById("emptyState");
  const headerWhatsapp = document.getElementById("headerWhatsapp");

  const menuToggle = document.getElementById("menuToggle");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const brandList = document.getElementById("brandList");
  const activeFilters = document.getElementById("activeFilters");

  const searchToggle = document.getElementById("searchToggle");
  const searchPanel = document.getElementById("searchPanel");
  const searchClose = document.getElementById("searchClose");

  const homeLink = document.getElementById("homeLink");

  const productModal = document.getElementById("productModal");
  const modalClose = document.getElementById("modalClose");
  const modalLike = document.getElementById("modalLike");
  const modalVisual = document.getElementById("modalVisual");
  const modalBrand = document.getElementById("modalBrand");
  const modalName = document.getElementById("modalName");
  const modalMeta = document.getElementById("modalMeta");
  const modalNotes = document.getElementById("modalNotes");
  const modalVibe = document.getElementById("modalVibe");
  const modalFooter = document.getElementById("modalFooter");

  const likesToggle = document.getElementById("likesToggle");
  const likesCount = document.getElementById("likesCount");

  const categoryLabels = {
    todas: "Todas",
    masculina: "Masculina",
    femenina: "Femenina",
    unisex: "Unisex"
  };

  let activeCategory = "todas";
  let activeBrand = "todas";
  let searchTerm = "";
  let onlyLiked = false;

  const LIKES_KEY = "lociones_likes";
  let likedIds = new Set();
  try {
    likedIds = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || "[]"));
  } catch (e) {
    likedIds = new Set();
  }

  function saveLikes() {
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify([...likedIds]));
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }

  function isLiked(id) {
    return likedIds.has(id);
  }

  function syncLikeButtons(id) {
    const liked = isLiked(id);
    document.querySelectorAll(`.like-btn[data-id="${id}"]`).forEach((btn) => {
      btn.classList.toggle("liked", liked);
      btn.setAttribute("aria-pressed", liked ? "true" : "false");
    });
  }

  function updateLikesCount() {
    const count = likedIds.size;
    likesCount.textContent = count;
    likesCount.hidden = count === 0;
  }

  function toggleLike(id) {
    if (likedIds.has(id)) {
      likedIds.delete(id);
    } else {
      likedIds.add(id);
    }
    saveLikes();
    syncLikeButtons(id);
    updateLikesCount();
    if (onlyLiked) render();
  }

  const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, "es"));
  brandList.innerHTML =
    `<button class="dropdown-item active" data-filter-type="brand" data-value="todas">Todas</button>` +
    brands
      .map((b) => `<button class="dropdown-item" data-filter-type="brand" data-value="${b}">${b}</button>`)
      .join("");

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  function closeDropdown() {
    categoryDropdown.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleDropdown() {
    const willOpen = categoryDropdown.hidden;
    closeDropdown();
    closeSearch();
    if (willOpen) {
      categoryDropdown.hidden = false;
      menuToggle.setAttribute("aria-expanded", "true");
    }
  }

  function closeSearch() {
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  }

  function openSearch() {
    closeDropdown();
    searchPanel.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    searchInput.focus();
  }

  function toggleSearch() {
    if (searchPanel.hidden) {
      openSearch();
    } else {
      closeSearch();
    }
  }

  function openModal(product) {
    closeDropdown();
    closeSearch();

    modalVisual.innerHTML = product.image
      ? `<img src="${product.image}" alt="${product.name}">`
      : bottleIcon();
    modalLike.dataset.id = product.id;
    modalLike.classList.toggle("liked", isLiked(product.id));
    modalLike.setAttribute("aria-pressed", isLiked(product.id) ? "true" : "false");
    modalLike.onclick = () => toggleLike(product.id);
    modalBrand.textContent = product.brand;
    modalName.textContent = product.name;
    modalMeta.textContent = `${formatSize(product)} · ${formatPrice(product.price)}`;
    modalNotes.innerHTML = product.notes.map((n) => `<span class="note-tag">${n}</span>`).join("");
    modalVibe.textContent = product.vibe || "";
    modalVibe.closest(".modal-vibe-block").hidden = !product.vibe;

    modalFooter.innerHTML = product.available
      ? `<a class="order-btn" href="${buildWhatsappLink(product)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.24-1.38a9.9 9.9 0 0 0 4.8 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C22 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.63-.6-2.87-1.24-4.74-4.15-4.88-4.34-.14-.19-1.17-1.56-1.17-2.98s.73-2.12.99-2.4c.26-.29.56-.36.75-.36l.54.01c.17.01.4-.06.63.48.24.56.8 1.95.87 2.09.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.23.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>
          Pedir por WhatsApp
        </a>`
      : `<span class="order-btn order-btn-disabled">No disponible</span>`;

    productModal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => productModal.classList.add("open"));
  }

  function closeModal() {
    productModal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      productModal.hidden = true;
    }, 500);
  }

  function formatPrice(value) {
    if (value === null || value === undefined) return "Precio a confirmar";
    return CONFIG.currencySymbol + value.toLocaleString("es-CO");
  }

  function formatSize(product) {
    return product.size ? `${product.size} ml` : "Presentación especial";
  }

  function buildWhatsappLink(product) {
    const message = product
      ? `Hola, quiero información sobre: ${product.name} (${product.brand}, ${formatSize(product)})`
      : "Hola, quiero información sobre su catálogo de lociones";
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function productCard(product) {
    const card = document.createElement("article");
    card.className = "product-card" + (product.available ? "" : " unavailable");

    const imageArea = product.image
      ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
      : bottleIcon();

    card.innerHTML = `
      <div class="product-image">
        <div class="product-visual">${imageArea}</div>
        <button class="like-btn${isLiked(product.id) ? " liked" : ""}" data-id="${product.id}" aria-label="Me gusta" aria-pressed="${isLiked(product.id) ? "true" : "false"}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
        <span class="badge ${product.available ? "badge-available" : "badge-unavailable"}">
          ${product.available ? "Disponible" : "Agotado"}
        </span>
      </div>
      <div class="product-body">
        <p class="product-brand">${product.brand}</p>
        <h2 class="product-name">${product.name}</h2>
        <p class="product-meta">${formatSize(product)}</p>
        <div class="product-notes">
          ${product.notes.map((n) => `<span class="note-tag">${n}</span>`).join("")}
        </div>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        ${
          product.available
            ? `<a class="order-btn" href="${buildWhatsappLink(product)}" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.24-1.38a9.9 9.9 0 0 0 4.8 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C22 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.63-.6-2.87-1.24-4.74-4.15-4.88-4.34-.14-.19-1.17-1.56-1.17-2.98s.73-2.12.99-2.4c.26-.29.56-.36.75-.36l.54.01c.17.01.4-.06.63.48.24.56.8 1.95.87 2.09.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.23.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>
                Pedir por WhatsApp
              </a>`
            : `<span class="order-btn order-btn-disabled">No disponible</span>`
        }
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".order-btn") || e.target.closest(".like-btn")) return;
      openModal(product);
    });

    card.querySelector(".like-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike(product.id);
    });

    return card;
  }

  function bottleIcon() {
    return `
      <svg class="bottle-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="26" y="4" width="12" height="8" rx="2" fill="currentColor" opacity="0.55"/>
        <rect x="24" y="12" width="16" height="6" rx="1" fill="currentColor" opacity="0.35"/>
        <path d="M22 18h20l3 6v30a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4V24z" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="18" y1="34" x2="46" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      </svg>
    `;
  }

  function render() {
    const filtered = PRODUCTS.filter((p) => {
      const matchesCategory = activeCategory === "todas" || p.category === activeCategory;
      const matchesBrand = activeBrand === "todas" || p.brand === activeBrand;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm);
      const matchesLiked = !onlyLiked || isLiked(p.id);
      return matchesCategory && matchesBrand && matchesSearch && matchesLiked;
    });

    grid.innerHTML = "";
    filtered.forEach((p) => {
      const card = productCard(p);
      grid.appendChild(card);
      cardObserver.observe(card);
    });

    const count = filtered.length;
    resultsCount.textContent = count
      ? `${count} producto${count === 1 ? "" : "s"}`
      : "";
    emptyState.hidden = count !== 0;
    emptyState.textContent =
      onlyLiked && count === 0
        ? "Todavía no marcaste ningún producto con Me Gusta."
        : "No se encontraron productos con esa búsqueda.";
  }

  function setDropdownActive(type, value) {
    categoryDropdown.querySelectorAll(`.dropdown-item[data-filter-type="${type}"]`).forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  function makeFilterChip(text, onClear) {
    const chip = document.createElement("button");
    chip.className = "active-filter-label";
    chip.innerHTML = `<span>${text}</span><svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.42 6.29 6.29-6.3 6.3 1.42 1.4 6.29-6.29 6.3 6.3 1.4-1.42-6.29-6.29 6.3-6.3z"/></svg>`;
    chip.addEventListener("click", onClear);
    return chip;
  }

  function renderActiveFilters() {
    activeFilters.innerHTML = "";
    if (activeCategory !== "todas") {
      activeFilters.appendChild(
        makeFilterChip(categoryLabels[activeCategory], () => {
          activeCategory = "todas";
          setDropdownActive("category", "todas");
          renderActiveFilters();
          render();
        })
      );
    }
    if (activeBrand !== "todas") {
      activeFilters.appendChild(
        makeFilterChip(activeBrand, () => {
          activeBrand = "todas";
          setDropdownActive("brand", "todas");
          renderActiveFilters();
          render();
        })
      );
    }
    if (onlyLiked) {
      activeFilters.appendChild(
        makeFilterChip("Me Gusta", () => {
          onlyLiked = false;
          likesToggle.setAttribute("aria-pressed", "false");
          renderActiveFilters();
          render();
        })
      );
    }
  }

  likesToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    closeDropdown();
    closeSearch();
    onlyLiked = !onlyLiked;
    likesToggle.setAttribute("aria-pressed", onlyLiked ? "true" : "false");
    renderActiveFilters();
    render();
  });

  categoryDropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".dropdown-item");
    if (!btn) return;
    const type = btn.dataset.filterType;
    const value = btn.dataset.value;

    setDropdownActive(type, value);
    if (type === "category") activeCategory = value;
    if (type === "brand") activeBrand = value;

    renderActiveFilters();
    closeDropdown();
    render();
  });

  function resetToHome() {
    activeCategory = "todas";
    activeBrand = "todas";
    onlyLiked = false;
    likesToggle.setAttribute("aria-pressed", "false");
    setDropdownActive("category", "todas");
    setDropdownActive("brand", "todas");
    renderActiveFilters();

    searchTerm = "";
    searchInput.value = "";

    closeDropdown();
    closeSearch();
    render();
  }

  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    resetToHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  searchToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSearch();
  });

  searchClose.addEventListener("click", () => {
    closeSearch();
  });

  document.addEventListener("click", (e) => {
    if (!categoryDropdown.hidden && !categoryDropdown.contains(e.target)) {
      closeDropdown();
    }
    if (!searchPanel.hidden && !searchPanel.contains(e.target) && e.target !== searchToggle) {
      closeSearch();
    }
  });

  modalClose.addEventListener("click", closeModal);

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      closeSearch();
      if (!productModal.hidden) closeModal();
    }
  });

  let searchDebounce;
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.trim().toLowerCase();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchTerm = value;
      render();
    }, 200);
  });

  headerWhatsapp.href = buildWhatsappLink(null);

  document.getElementById("year").textContent = new Date().getFullYear();

  updateLikesCount();
  render();
})();
