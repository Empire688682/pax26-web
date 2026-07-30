/**
 * currencyHelper.js
 *
 * Core currency configuration, location detection, formatting,
 * and exchange rate conversion utility for Pax26.
 */

export const CURRENCIES = {
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG", rateVsNgn: 1, rateVsUsd: 1500 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rateVsNgn: 1500, rateVsUsd: 1 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", rateVsNgn: 1630, rateVsUsd: 1.09 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rateVsNgn: 1920, rateVsUsd: 1.28 },
  GHS: { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", locale: "en-GH", rateVsNgn: 98, rateVsUsd: 0.065 },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "sw-KE", rateVsNgn: 11.5, rateVsUsd: 0.0077 },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA", rateVsNgn: 82, rateVsUsd: 0.055 },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", rateVsNgn: 1100, rateVsUsd: 0.73 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", rateVsNgn: 980, rateVsUsd: 0.65 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "hi-IN", rateVsNgn: 18, rateVsUsd: 0.012 },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "ar-AE", rateVsNgn: 408, rateVsUsd: 0.27 },
};

export const CURRENCY_OPTIONS = Object.values(CURRENCIES).map((c) => ({
  value: c.code,
  label: `${c.code} — ${c.name} (${c.symbol})`,
  symbol: c.symbol,
}));

/**
 * Returns the symbol for a given currency code. Defaults to ₦.
 */
export function getCurrencySymbol(code = "NGN") {
  const upper = (code || "NGN").toUpperCase();
  return CURRENCIES[upper]?.symbol || "₦";
}

/**
 * Formats a numeric price into a locale-aware currency string.
 */
export function formatPrice(amount, currencyCode = "NGN") {
  const num = Number(amount) || 0;
  const upper = (currencyCode || "NGN").toUpperCase();
  const info = CURRENCIES[upper] || CURRENCIES.NGN;

  try {
    return `${info.symbol}${num.toLocaleString(info.locale, {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  } catch (_) {
    return `${info.symbol}${num.toLocaleString()}`;
  }
}

/**
 * Converts an amount from one currency to another using reference rates.
 */
export function convertCurrency(amount, fromCurrency = "NGN", toCurrency = "NGN") {
  const num = Number(amount) || 0;
  const from = (fromCurrency || "NGN").toUpperCase();
  const to = (toCurrency || "NGN").toUpperCase();

  if (from === to) return num;

  const fromInfo = CURRENCIES[from] || CURRENCIES.NGN;
  const toInfo = CURRENCIES[to] || CURRENCIES.NGN;

  // Convert to NGN base first, then to target currency
  const inNgn = num * fromInfo.rateVsNgn;
  const converted = inNgn / toInfo.rateVsNgn;

  return Math.round(converted * 100) / 100;
}

/**
 * Automatically detects the user's currency based on IP Geolocation
 * or browser timeZone / locale fallback.
 */
export async function detectUserCurrency() {
  // 1. Try IP Geolocation API with quick timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s max wait

    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const detected = data.currency?.toUpperCase();
      if (detected && CURRENCIES[detected]) {
        return detected;
      }
    }
  } catch (err) {
    // Silent fallback if IP API fails or times out
  }

  // 2. Fallback: Browser TimeZone / Locale Mapping
  try {
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

      if (tz.startsWith("Africa/Lagos") || tz.startsWith("Africa/Porto-Novo")) return "NGN";
      if (tz.startsWith("Africa/Accra")) return "GHS";
      if (tz.startsWith("Africa/Nairobi")) return "KES";
      if (tz.startsWith("Africa/Johannesburg")) return "ZAR";
      if (tz.startsWith("Europe/London")) return "GBP";
      if (tz.startsWith("Europe/")) return "EUR";
      if (tz.startsWith("America/Toronto") || tz.startsWith("America/Vancouver")) return "CAD";
      if (tz.startsWith("America/")) return "USD";
      if (tz.startsWith("Australia/")) return "AUD";
      if (tz.startsWith("Asia/Kolkata")) return "INR";
      if (tz.startsWith("Asia/Dubai")) return "AED";
    }
  } catch (_) {}

  // 3. Ultimate Fallback
  return "NGN";
}
