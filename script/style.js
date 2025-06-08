// مدیریت سبد خرید
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// عناصر DOM
const cartIcon = document.querySelector('.bi-cart2').closest('a');
const cartPanel = document.getElementById('cart-panel');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// باز کردن پنل سبد خرید
cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartPanel.classList.add('active');
    cartOverlay.style.display = 'block';
    updateCartItems();
});

// بستن پنل
closeCart.addEventListener('click', () => {
    cartPanel.classList.remove('active');
    cartOverlay.style.display = 'none';
});

// گرفتن اطلاعات محصول (از data-* یا DOM)
function getProductDetails(btn) {
    const productCard = btn.closest('.product-card');
    const title = btn.dataset.productName || productCard.querySelector('.product-title').textContent.trim();
    const priceText = btn.dataset.productPrice || productCard.querySelector('.product-price').textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    const image = btn.dataset.productImage || productCard.querySelector('.product-img').src;
    const id = btn.dataset.productId || title.replace(/\s+/g, '-').toLowerCase();
    return { id, name: title, price, image };
}

// افزودن به سبد خرید
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function () {
        const { id, name, price, image } = getProductDetails(this);
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${name} به سبد خرید اضافه شد!`);
    });
});

// نوتیفیکیشن پایین راست
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // کمی تأخیر قبل از نمایش (مثلاً 100ms)
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // حذف بعد از 3 ثانیه
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 600);
    }, 3000);
}

// آپدیت شمارنده
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
}

// نمایش سبد خرید
function updateCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center py-3">سبد خرید شما خالی است</p>';
        cartTotal.textContent = '۰';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <p>${item.price.toLocaleString('fa-IR')} تومان</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity('${item.id}', -1)" class="btn btn-sm mx-2 btn-primary">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)" class="btn btn-sm mx-2 btn-primary">+</button>
                        <button onclick="removeFromCart('${item.id}')" class="btn btn-sm mx-2 btn-danger">حذف</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toLocaleString('fa-IR');
}

// تغییر تعداد
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartItems();
    }
}

// حذف
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartItems();
}

// سفارش
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('سبد خرید شما خالی است!');
        return;
    }
    alert(`سفارش شما با ${cart.reduce((sum, item) => sum + item.quantity, 0)} محصول ثبت شد!`);
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    updateCartItems();
    cartPanel.classList.remove('active');
    cartOverlay.style.display = 'none';
});

// لود اولیه
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
