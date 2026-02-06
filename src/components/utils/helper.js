// utils/helpers.js

export function applyMarkup(basePrice, profitType, profitValue) {
  if (profitType === "flat") {
    return basePrice + profitValue;
  }
  return Math.ceil(basePrice * (1 + profitValue / 100));
}
