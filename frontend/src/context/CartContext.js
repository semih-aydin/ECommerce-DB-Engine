"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "aydinstore_cart";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Sadece ilk acilista localStorage'dan oku (asla ustune bos array yazma)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {}
  }, []);

  function saveCart(nextCart) {
    setCart(nextCart);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart));
    } catch {}
  }

  function addToCart(product, quantityToAdd = 1) {
    const maxStock = Number(product.stock_quantity || 0);
    if (maxStock <= 0) return;

    const existing = cart.find((i) => i.product_id === product.id);
    let nextCart;
    if (existing) {
      const nextQty = Math.min(maxStock, existing.quantity + quantityToAdd);
      nextCart = cart.map((i) =>
        i.product_id === product.id ? { ...i, quantity: nextQty } : i
      );
    } else {
      const nextQty = Math.min(maxStock, quantityToAdd);
      nextCart = [
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          image_url: product.image_url,
          category_name: product.category_name,
          product_code: product.product_code,
          base_price: product.base_price,
          stock_quantity: maxStock,
          quantity: nextQty,
        },
      ];
    }
    saveCart(nextCart);
  }

  function updateQty(productId, delta) {
    const nextCart = cart
      .map((i) => {
        if (i.product_id !== productId) return i;
        const maxStock = Number(i.stock_quantity || 0);
        const nextQty = Math.min(maxStock, Math.max(0, i.quantity + delta));
        return { ...i, quantity: nextQty };
      })
      .filter((i) => i.quantity > 0);
    saveCart(nextCart);
  }

  function clearCart() {
    saveCart([]);
  }

  function syncCartProducts(latestProducts = []) {
    if (!Array.isArray(latestProducts) || latestProducts.length === 0) return;
    setCart((prev) => {
      if (prev.length === 0) return prev;
      const map = new Map(latestProducts.map((p) => [p.id, p]));
      let changed = false;
      const next = prev
        .map((item) => {
          const fresh = map.get(item.product_id);
          if (!fresh) return item;
          const freshStock = Number(fresh.stock_quantity || 0);
          const clampedQty = Math.min(freshStock, item.quantity);
          if (
            Number(item.base_price) !== Number(fresh.base_price) ||
            Number(item.stock_quantity) !== freshStock ||
            clampedQty !== item.quantity
          ) {
            changed = true;
            return {
              ...item,
              base_price: fresh.base_price,
              stock_quantity: freshStock,
              quantity: clampedQty,
            };
          }
          return item;
        })
        .filter((i) => i.quantity > 0);

      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  }

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQty,
        clearCart,
        syncCartProducts,
        totalCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
