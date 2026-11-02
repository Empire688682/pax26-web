/**
 * savedAddressUtils.js
 *
 * Per-store saved delivery address + customer info management using localStorage.
 *
 * Storage key: `pax26_addrs_${storeSlug}`
 * Each store has its own independent address list — addresses from one store
 * never bleed into another.
 *
 * Each saved entry:
 *   address     — the full address string the customer typed
 *   state       — state / region
 *   city        — city / area
 *   zoneName    — the delivery zone name matched at time of order (null for flat/quote)
 *   deliveryFee — the fee at time of order (reference only — always re-fetch live)
 *   label       — optional customer nickname ("Home", "Office"), default null
 *   usedAt      — ISO timestamp for sorting and expiry
 *   firstName   — customer first name at time of order
 *   lastName    — customer last name at time of order
 *   phone1      — customer primary phone (delivery contact — NOT WhatsApp identity)
 *   phone2      — customer alternative phone (optional)
 *
 * Rules:
 *   - Max 5 entries per store (oldest dropped on overflow)
 *   - Entries older than 180 days are pruned on read
 *   - Duplicate addresses (case-insensitive, trimmed) update usedAt instead of adding
 *
 * Customer profile key: `pax26_cust_${storeSlug}`
 * Stores the most-recently-used name + phones separately for fast autofill
 * regardless of whether a saved address is selected.
 */

const MAX_ENTRIES = 5;
const EXPIRY_DAYS = 180;
const EXPIRY_MS   = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

function storageKey(storeSlug) {
  return `pax26_addrs_${storeSlug}`;
}

function customerKey(storeSlug) {
  return `pax26_cust_${storeSlug}`;
}

function isExpired(entry) {
  if (!entry.usedAt) return false;
  return Date.now() - new Date(entry.usedAt).getTime() > EXPIRY_MS;
}

/**
 * Load saved addresses for a store.
 * Returns newest-first (most recently used at index 0).
 */
export function loadSavedAddresses(storeSlug) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(storeSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Prune expired entries
    const alive = parsed.filter(e => !isExpired(e));
    if (alive.length !== parsed.length) {
      _saveSavedAddresses(storeSlug, alive);
    }
    // Sort newest first
    return alive.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
  } catch {
    return [];
  }
}

function _saveSavedAddresses(storeSlug, entries) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(storeSlug), JSON.stringify(entries));
  } catch {
    // localStorage unavailable or quota exceeded — silently ignore
  }
}

/**
 * Load the most-recently-used customer profile for a store.
 * Returns { firstName, lastName, phone1, phone2 } or null.
 */
export function loadCustomerProfile(storeSlug) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(customerKey(storeSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Save the customer's name + phones after a successful checkout.
 * Always overwrites — we want the latest values.
 */
export function saveCustomerProfile(storeSlug, { firstName, lastName, phone1, phone2 }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(customerKey(storeSlug), JSON.stringify({
      firstName: firstName || "",
      lastName:  lastName  || "",
      phone1:    phone1    || "",
      phone2:    phone2    || "",
    }));
  } catch {
    // quota exceeded — silently ignore
  }
}

/**
 * Save a new address after a successful checkout.
 * - If the address already exists (case-insensitive), update its usedAt and all fields
 * - Otherwise prepend and cap at MAX_ENTRIES (drop oldest)
 */
export function saveAddress(storeSlug, {
  address, state = null, city = null,
  zoneName = null, deliveryFee = 0, label = null,
  firstName = null, lastName = null, phone1 = null, phone2 = null,
}) {
  if (typeof window === "undefined") return;
  if (!address?.trim()) return;

  const entries = loadSavedAddresses(storeSlug);
  const normNew = address.trim().toLowerCase();

  const existingIdx = entries.findIndex(e => (e.address || "").trim().toLowerCase() === normNew);

  if (existingIdx !== -1) {
    // Update existing — bump usedAt and refresh all fields
    entries[existingIdx] = {
      ...entries[existingIdx],
      address:   address.trim(),
      state:     state    || entries[existingIdx].state    || null,
      city:      city     || entries[existingIdx].city     || null,
      zoneName:  zoneName || entries[existingIdx].zoneName || null,
      deliveryFee,
      firstName: firstName || entries[existingIdx].firstName || null,
      lastName:  lastName  || entries[existingIdx].lastName  || null,
      phone1:    phone1    || entries[existingIdx].phone1    || null,
      phone2:    phone2    || entries[existingIdx].phone2    || null,
      usedAt: new Date().toISOString(),
    };
  } else {
    // Prepend new entry
    entries.unshift({
      address:    address.trim(),
      state:      state    || null,
      city:       city     || null,
      zoneName:   zoneName || null,
      deliveryFee,
      label:      label    || null,
      firstName:  firstName || null,
      lastName:   lastName  || null,
      phone1:     phone1    || null,
      phone2:     phone2    || null,
      usedAt: new Date().toISOString(),
    });
  }

  // Cap at MAX_ENTRIES — sort newest first, then slice
  const capped = entries
    .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
    .slice(0, MAX_ENTRIES);

  _saveSavedAddresses(storeSlug, capped);
}

/**
 * Remove a single saved address by its address string.
 */
export function removeSavedAddress(storeSlug, address) {
  const entries = loadSavedAddresses(storeSlug);
  const norm = address.trim().toLowerCase();
  _saveSavedAddresses(storeSlug, entries.filter(e => (e.address || "").trim().toLowerCase() !== norm));
}

/**
 * Update the label (nickname) of a saved address.
 */
export function labelSavedAddress(storeSlug, address, label) {
  const entries = loadSavedAddresses(storeSlug);
  const norm = address.trim().toLowerCase();
  _saveSavedAddresses(storeSlug, entries.map(e =>
    (e.address || "").trim().toLowerCase() === norm
      ? { ...e, label: label?.trim() || null }
      : e
  ));
}

/**
 * Format a relative time label for display, e.g. "Today", "Yesterday", "3 days ago"
 */
export function formatAddressTime(usedAt) {
  if (!usedAt) return "";
  const diff = Date.now() - new Date(usedAt).getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(usedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}
