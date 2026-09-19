// بيانات كتالوج المتجر. يمكن تعديل المنتجات والأسعار والصور من هذه القائمة.
const products = [
	{ id: "tee-core", name: "تيشيرت الحركة الأساسي", category: "clothing", categoryName: "ملابس رياضية", description: "قماش ناعم وخفيف للتمرين والاستخدام اليومي.", price: 89, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=82", alt: "تيشيرت رياضي أسود" },
	{ id: "hoodie-form", name: "هودي فورم", category: "clothing", categoryName: "ملابس رياضية", description: "طبقة مريحة بقصة واسعة وأسلوب بسيط.", price: 189, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=720&q=82", alt: "هودي رياضي مريح" },
	{ id: "shorts-run", name: "شورت ران", category: "clothing", categoryName: "ملابس رياضية", description: "حرية حركة وخامة مناسبة للتمارين.", price: 99, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=720&q=82", alt: "شورت رياضي" },
	{ id: "cap-classic", name: "قبعة كلاسيك", category: "caps", categoryName: "طواقي", description: "تفصيل عملي بلمسة يومية خالدة.", price: 69, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=720&q=82", alt: "قبعة سوداء بتصميم كلاسيكي" },
	{ id: "cap-run", name: "قبعة ترايل", category: "caps", categoryName: "طواقي", description: "خفيفة ومريحة للخروج والركض.", price: 75, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=720&q=82", alt: "قبعة رياضية" },
	{ id: "bag-weekender", name: "حقيبة ويك إند", category: "bags", categoryName: "شنط", description: "مساحة منظمة لاحتياجات التمرين والسفر.", price: 219, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=720&q=82", alt: "حقيبة ظهر عملية" },
	{ id: "bag-crossbody", name: "شنطة كروس", category: "bags", categoryName: "شنط", description: "حجم عملي للأغراض التي تحتاجها كل يوم.", price: 129, image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=720&q=82", alt: "حقيبة صغيرة للاستخدام اليومي" },
	{ id: "bottle-steel", name: "قارورة ستيل", category: "accessories", categoryName: "إكسسوارات", description: "رفيق الترطيب في النادي وخارج المنزل.", price: 59, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=720&q=82", alt: "قارورة ماء قابلة لإعادة الاستخدام" },
	{ id: "socks-everyday", name: "جوارب إيفريداي", category: "accessories", categoryName: "إكسسوارات", description: "راحة يومية بخامة ناعمة وسهلة التنسيق.", price: 39, image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=720&q=82", alt: "جوارب رياضية" },
	{ id: "towel-training", name: "منشفة تدريب", category: "accessories", categoryName: "إكسسوارات", description: "خفيفة وسريعة الجفاف لحقيبة النادي.", price: 45, image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=720&q=82", alt: "منشفة قطنية" }
];

const STORAGE_KEYS = { cart: "ghe-guevara-cart", favorites: "ghe-guevara-favorites" };
const moneyFormat = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const resultsCount = document.querySelector("#results-count");
const emptyResults = document.querySelector("#empty-results");
const cartDrawer = document.querySelector("#cart-drawer");
const wishlistDrawer = document.querySelector("#wishlist-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const cartItemsElement = document.querySelector("#cart-items");
const wishlistItemsElement = document.querySelector("#wishlist-items");
const cartEmpty = document.querySelector("#cart-empty");
const wishlistEmpty = document.querySelector("#wishlist-empty");
const drawerFooter = document.querySelector("#drawer-footer");
const toast = document.querySelector("#toast");
const productModal = document.querySelector("#product-modal");
const modalProductImage = document.querySelector("#modal-product-image");
const modalProductCategory = document.querySelector("#modal-product-category");
const modalProductName = document.querySelector("#modal-product-name");
const modalProductDescription = document.querySelector("#modal-product-description");
const modalProductPrice = document.querySelector("#modal-product-price");
const modalAddButton = document.querySelector("#modal-add-button");

// قراءة آمنة للتخزين المحلي، مع قيمة افتراضية إذا لم توجد بيانات صالحة.
function readStorage(key, fallback) {
	try {
		const value = JSON.parse(localStorage.getItem(key));
		return value ?? fallback;
	} catch {
		return fallback;
	}
}

let cart = readStorage(STORAGE_KEYS.cart, []);
let favorites = readStorage(STORAGE_KEYS.favorites, []);
if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favorites)) favorites = [];

let activeCategory = "all";
let toastTimer;
let lastFocusedElement = null;

// تنسيق السعر بالريال السعودي.
function formatPrice(price) {
	return `${moneyFormat.format(price)} ر.س`;
}

// تبسيط البحث العربي للتعامل مع اختلاف أشكال بعض الحروف.
function normalizeText(value) {
	return value.toLocaleLowerCase("ar")
		.normalize("NFD")
		.replace(/[\u064B-\u065F\u0670]/g, "")
		.replace(/[أإآ]/g, "ا")
		.replace(/ة/g, "ه")
		.trim();
}

// إنشاء بطاقة منتج وإظهار حالة المفضلة والسعر.
function createProductCard(product) {
	const isFavorite = favorites.includes(product.id);
	return `
		<article class="product-card" tabindex="0" aria-label="عرض تفاصيل ${product.name}">
			<div class="product-image-wrap">
				<img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
				<span class="product-tag">${product.categoryName}</span>
				<button class="favorite-button${isFavorite ? " is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? "إزالة من" : "إضافة إلى"} المفضلة: ${product.name}" aria-pressed="${isFavorite}">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 8.8 2.3Z"/></svg>
				</button>
			</div>
			<div class="product-info">
				<p class="product-category">${product.categoryName}</p>
				<h3 class="product-name">${product.name}</h3>
				<p class="product-description">${product.description}</p>
				<div class="product-bottom">
					<span class="product-price">${moneyFormat.format(product.price)}<span class="currency">ر.س</span></span>
					<button class="add-button" type="button" data-add="${product.id}">أضف للسلة</button>
				</div>
			</div>
		</article>`;
}

// تطبيق القسم وكلمة البحث مع تحديث حالة الفلاتر والنتائج.
function renderProducts() {
	const query = normalizeText(searchInput.value);
	const visibleProducts = products.filter((product) => {
		const matchesCategory = activeCategory === "all" || product.category === activeCategory;
		const searchContent = normalizeText(`${product.name} ${product.categoryName} ${product.description}`);
		return matchesCategory && (!query || searchContent.includes(query));
	});

	productGrid.innerHTML = visibleProducts.map(createProductCard).join("");
	resultsCount.textContent = `${moneyFormat.format(visibleProducts.length)} منتجات`;
	emptyResults.hidden = visibleProducts.length !== 0;
	productGrid.hidden = visibleProducts.length === 0;

	document.querySelectorAll("[data-category]").forEach((button) => {
		const selected = button.dataset.category === activeCategory;
		button.classList.toggle("is-active", selected);
		if (button.matches(".filter-button")) button.setAttribute("aria-pressed", String(selected));
	});
}

// حفظ السلة وتحديث محتواها والعداد والإجمالي.
function saveCart() {
	localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
	renderCart();
}

function renderCart() {
	const validCart = cart.filter((item) => products.some((product) => product.id === item.id) && Number(item.quantity) > 0);
	if (validCart.length !== cart.length) {
		cart = validCart;
		localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
	}

	const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = cart.reduce((sum, item) => {
		const product = products.find((entry) => entry.id === item.id);
		return sum + (product ? product.price * item.quantity : 0);
	}, 0);

	document.querySelector("#cart-count").textContent = moneyFormat.format(totalQuantity);
	document.querySelector("#drawer-count").textContent = `(${moneyFormat.format(totalQuantity)})`;
	document.querySelector("#cart-total").textContent = formatPrice(totalPrice);
	cartItemsElement.innerHTML = cart.map((item) => {
		const product = products.find((entry) => entry.id === item.id);
		if (!product) return "";
		return `
			<article class="cart-item" data-cart-item="${product.id}">
				<img class="cart-item-image" src="${product.image}" alt="${product.alt}">
				<div class="cart-item-details">
					<h3>${product.name}</h3>
					<p>${product.categoryName}</p>
					<span class="cart-item-price">${formatPrice(product.price * item.quantity)}</span>
					<div class="quantity-control" aria-label="الكمية">
						<button type="button" data-quantity="-1" data-id="${product.id}" aria-label="تقليل كمية ${product.name}">−</button>
						<span>${moneyFormat.format(item.quantity)}</span>
						<button type="button" data-quantity="1" data-id="${product.id}" aria-label="زيادة كمية ${product.name}">+</button>
					</div>
				</div>
				<button class="remove-item" type="button" data-remove="${product.id}" aria-label="حذف ${product.name}">حذف</button>
			</article>`;
	}).join("");

	const isEmpty = cart.length === 0;
	cartEmpty.hidden = !isEmpty;
	drawerFooter.hidden = isEmpty;
	cartItemsElement.hidden = isEmpty;
}

// عرض المنتجات المفضلة مع تحديث عدادي الهيدر واللوحة.
function renderWishlist() {
	const validFavorites = [...new Set(favorites)].filter((id) => products.some((product) => product.id === id));
	if (validFavorites.length !== favorites.length) {
		favorites = validFavorites;
		localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
	}

	document.querySelector("#wishlist-count").textContent = moneyFormat.format(favorites.length);
	document.querySelector("#wishlist-drawer-count").textContent = `(${moneyFormat.format(favorites.length)})`;
	wishlistItemsElement.innerHTML = favorites.map((id) => {
		const product = products.find((entry) => entry.id === id);
		if (!product) return "";
		return `
			<article class="cart-item wishlist-item" data-wishlist-item="${product.id}">
				<img class="cart-item-image" src="${product.image}" alt="${product.alt}" loading="lazy">
				<div class="cart-item-details">
					<h3>${product.name}</h3>
					<p>${product.categoryName}</p>
					<span class="cart-item-price">${formatPrice(product.price)}</span>
					<div class="wishlist-item-actions">
						<button class="wishlist-add-button" type="button" data-wishlist-add="${product.id}">انقل إلى السلة</button>
						<button class="wishlist-remove-button" type="button" data-wishlist-remove="${product.id}">حذف</button>
					</div>
				</div>
			</article>`;
	}).join("");
	wishlistEmpty.hidden = favorites.length !== 0;
	wishlistItemsElement.hidden = favorites.length === 0;
}

// رسائل قصيرة لتأكيد إجراءات المستخدم.
function showToast(message) {
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add("is-visible");
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

// تطبيق الثيم وتحديث وصف زر التبديل ولون واجهة المتصفح.
function applyTheme(theme) {
	const selectedTheme = theme === "dark" ? "dark" : "light";
	document.documentElement.dataset.theme = selectedTheme;
	document.querySelector("#theme-toggle").setAttribute(
		"aria-label",
		selectedTheme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"
	);
	document.querySelector('meta[name="theme-color"]').content = selectedTheme === "dark" ? "#191a18" : "#171816";
}

// ملء نافذة تفاصيل المنتج بالبيانات وفتحها بشكل أصلي قابل للوصول.
function openProductDetails(product) {
	modalProductImage.src = product.image;
	modalProductImage.alt = product.alt;
	modalProductCategory.textContent = product.categoryName;
	modalProductName.textContent = product.name;
	modalProductDescription.textContent = product.description;
	modalProductPrice.textContent = formatPrice(product.price);
	modalAddButton.dataset.add = product.id;
	productModal.showModal();
}

// فتح وإغلاق درج السلة وإدارة التركيز ولوحة المفاتيح.
function openCart() {
	if (wishlistDrawer.classList.contains("is-open")) closeWishlist();
	lastFocusedElement = document.activeElement;
	cartDrawer.inert = false;
	cartDrawer.setAttribute("aria-hidden", "false");
	cartDrawer.classList.add("is-open");
	backdrop.hidden = false;
	document.body.classList.add("drawer-open");
	document.querySelector("#cart-open").setAttribute("aria-expanded", "true");
	document.querySelector("#cart-close").focus();
}

function closeCart() {
	cartDrawer.classList.remove("is-open");
	cartDrawer.setAttribute("aria-hidden", "true");
	cartDrawer.inert = true;
	backdrop.hidden = true;
	document.body.classList.remove("drawer-open");
	document.querySelector("#cart-open").setAttribute("aria-expanded", "false");
	if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

// فتح وإغلاق المفضلة مع مشاركة طبقة التعتيم وإدارة التركيز.
function openWishlist() {
	if (cartDrawer.classList.contains("is-open")) closeCart();
	lastFocusedElement = document.activeElement;
	wishlistDrawer.inert = false;
	wishlistDrawer.setAttribute("aria-hidden", "false");
	wishlistDrawer.classList.add("is-open");
	backdrop.hidden = false;
	document.body.classList.add("drawer-open");
	document.querySelector("#wishlist-open").setAttribute("aria-expanded", "true");
	document.querySelector("#wishlist-close").focus();
}

function closeWishlist() {
	wishlistDrawer.classList.remove("is-open");
	wishlistDrawer.setAttribute("aria-hidden", "true");
	wishlistDrawer.inert = true;
	backdrop.hidden = true;
	document.body.classList.remove("drawer-open");
	document.querySelector("#wishlist-open").setAttribute("aria-expanded", "false");
	if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

// أحداث الفلاتر والبحث والمنتجات تُدار بالتفويض لتعمل بعد إعادة الرسم.
document.addEventListener("click", (event) => {
	const categoryButton = event.target.closest("[data-category]");
	if (categoryButton) {
		activeCategory = categoryButton.dataset.category;
		renderProducts();
		if (categoryButton.matches(".nav-category")) {
			document.querySelector("#category-nav").classList.remove("is-mobile-open");
			document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
		}
		return;
	}

	const productCard = event.target.closest(".product-card");
	if (productCard && !event.target.closest("button")) {
		const productName = productCard.querySelector(".product-name").textContent;
		const product = products.find((entry) => entry.name === productName);
		if (product) openProductDetails(product);
		return;
	}

	const addButton = event.target.closest("[data-add]");
	if (addButton) {
		const id = addButton.dataset.add;
		const existingItem = cart.find((item) => item.id === id);
		if (existingItem) existingItem.quantity += 1;
		else cart.push({ id, quantity: 1 });
		saveCart();
		showToast(`تمت إضافة ${products.find((product) => product.id === id).name} إلى سلتك`);
		if (addButton === modalAddButton) productModal.close();
		return;
	}

	const favoriteButton = event.target.closest("[data-favorite]");
	if (favoriteButton) {
		const id = favoriteButton.dataset.favorite;
		favorites = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
		localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
		renderProducts();
		renderWishlist();
		showToast(favorites.includes(id) ? "أُضيف المنتج إلى المفضلة" : "أُزيل المنتج من المفضلة");
		return;
	}

	const wishlistAddButton = event.target.closest("[data-wishlist-add]");
	if (wishlistAddButton) {
		const id = wishlistAddButton.dataset.wishlistAdd;
		const existingItem = cart.find((item) => item.id === id);
		if (existingItem) existingItem.quantity += 1;
		else cart.push({ id, quantity: 1 });
		saveCart();
		favorites = favorites.filter((favorite) => favorite !== id);
		localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
		renderWishlist();
		renderProducts();
		showToast("تم نقل المنتج من المفضلة إلى السلة");
		return;
	}

	const wishlistRemoveButton = event.target.closest("[data-wishlist-remove]");
	if (wishlistRemoveButton) {
		favorites = favorites.filter((favorite) => favorite !== wishlistRemoveButton.dataset.wishlistRemove);
		localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
		renderWishlist();
		renderProducts();
		showToast("تم حذف المنتج من المفضلة");
		return;
	}

	const quantityButton = event.target.closest("[data-quantity]");
	if (quantityButton) {
		const item = cart.find((entry) => entry.id === quantityButton.dataset.id);
		if (item) item.quantity += Number(quantityButton.dataset.quantity);
		cart = cart.filter((entry) => entry.quantity > 0);
		saveCart();
		return;
	}

	const removeButton = event.target.closest("[data-remove]");
	if (removeButton) {
		cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
		saveCart();
		showToast("تم حذف المنتج من السلة");
	}
});

document.querySelector("#search-form").addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", renderProducts);
document.querySelector("#theme-toggle").addEventListener("click", () => {
	const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
	applyTheme(nextTheme);
	localStorage.setItem("ghe-guevara-theme", nextTheme);
});
document.querySelector("#product-modal-close").addEventListener("click", () => productModal.close());
productModal.addEventListener("click", (event) => {
	if (event.target === productModal) productModal.close();
});
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#wishlist-open").addEventListener("click", openWishlist);
document.querySelector("#wishlist-close").addEventListener("click", closeWishlist);
backdrop.addEventListener("click", () => {
	if (cartDrawer.classList.contains("is-open")) closeCart();
	if (wishlistDrawer.classList.contains("is-open")) closeWishlist();
});
document.querySelector("#wishlist-continue").addEventListener("click", () => {
	closeWishlist();
	document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#continue-shopping").addEventListener("click", () => {
	closeCart();
	document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#checkout-button").addEventListener("click", () => showToast("إتمام الطلب غير مفعّل في هذا النموذج التجريبي"));

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
	if (event.key === "Escape" && wishlistDrawer.classList.contains("is-open")) closeWishlist();
	const productCard = event.target.closest(".product-card");
	if (productCard && event.target === productCard && (event.key === "Enter" || event.key === " ")) {
		event.preventDefault();
		const productName = productCard.querySelector(".product-name").textContent;
		const product = products.find((entry) => entry.name === productName);
		if (product) openProductDetails(product);
	}
});

// في الجوال يمكن فتح روابط الأقسام من زر القائمة.
document.querySelector("#mobile-menu").addEventListener("click", (event) => {
	const nav = document.querySelector("#category-nav");
	const isOpen = nav.classList.toggle("is-mobile-open");
	event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#year").textContent = new Date().getFullYear();
applyTheme(readStorage("ghe-guevara-theme", "light"));
renderProducts();
renderCart();
renderWishlist();
