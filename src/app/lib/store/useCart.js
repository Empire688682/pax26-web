"use client";

import { useState, useEffect } from "react";

export function getCartKey(slug) {
  return `pax26_cart_${slug || "default"}`;
}

export function getCartItems(slug) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getCartKey(slug));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read cart from localStorage:", err);
    return [];
  }
}

export function saveCartItems(slug, items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getCartKey(slug), JSON.stringify(items));
    window.dispatchEvent(new Event("pax26_cart_update"));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
}

export function clearCartItems(slug) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getCartKey(slug));
    window.dispatchEvent(new Event("pax26_cart_update"));
  } catch (err) {
    console.error("Failed to clear cart:", err);
  }
}

export function useCart(slug) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCartItems(slug));

    const handleUpdate = () => {
      setCart(getCartItems(slug));
    };

    window.addEventListener("pax26_cart_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("pax26_cart_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [slug]);

  const addItem = (product, quantity = 1, selectedVariants = []) => {
    const current = getCartItems(slug);
    // Cart key includes variant selections so same product in different sizes = different line items
    const variantKey = selectedVariants.length
      ? selectedVariants.map(v => `${v.label}:${v.value}`).join("|")
      : "";
    const cartItemKey = `${product._id}__${variantKey}`;
    const existingIndex = current.findIndex((item) => item.cartItemKey === cartItemKey);

    // Calculate price with variant adjustments
    const basePrice = product.discountPrice || product.price || 0;
    const variantPriceAdj = selectedVariants.reduce((sum, sel) => {
      const variantDef = (product.variants || []).find(v => v.label === sel.label);
      const optionDef = variantDef?.options?.find(o => o.value === sel.value);
      return sum + (optionDef?.priceAdjustment || 0);
    }, 0);
    const itemPrice = basePrice + variantPriceAdj;
    const imageUrl = product.images?.[0]?.url || "";

    let updated = [...current];
    if (existingIndex > -1) {
      updated[existingIndex].quantity += quantity;
    } else {
      updated.push({
        cartItemKey,
        productId: product._id,
        name: product.name,
        price: itemPrice,
        imageUrl,
        quantity,
        deliveryFee: Number(product.deliveryFee) || 0,
        selectedVariants,   // e.g. [{ label: "Size", value: "42" }, { label: "Color", value: "Black" }]
      });
    }
    saveCartItems(slug, updated);
  };

  const setItemQuantity = (cartItemKey, quantity) => {
    const current = getCartItems(slug);
    let updated;
    if (quantity <= 0) {
      updated = current.filter((item) => item.cartItemKey !== cartItemKey);
    } else {
      updated = current.map((item) =>
        item.cartItemKey === cartItemKey ? { ...item, quantity } : item
      );
    }
    saveCartItems(slug, updated);
  };

  const removeItem = (cartItemKey) => {
    const current = getCartItems(slug);
    const updated = current.filter((item) => item.cartItemKey !== cartItemKey);
    saveCartItems(slug, updated);
  };

  const clear = () => {
    clearCartItems(slug);
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cart,
    totalQuantity,
    totalPrice,
    addItem,
    setItemQuantity,
    removeItem,
    clear,
  };
}
