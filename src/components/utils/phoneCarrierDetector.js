
const NIGERIAN_CARRIERS = {
  "01": [
    "0803", "0806", "0703", "0706",
    "0813", "0816", "0810", "0814",
    "0903", "0906", "0913"
  ],
  "02": [
    "0805", "0807", "0705",
    "0811", "0815",
    "0905", "0915"
  ],
  "03": [
    "0809", "0817", "0818",
    "0909", "0908"
  ],
  "04": [
    "0802", "0808", "0708",
    "0812", "0701",
    "0902", "0907", "0901", "0912"
  ]
};

export function phoneCarrierDetector(phoneNumber) {
  if (!phoneNumber) return null;

  // normalize number
  let number = phoneNumber
    .toString()
    .replace(/\s+/g, "")
    .replace(/^(\+234|234)/, "0");

  if (number.length !== 11) return null;

  const prefix = number.slice(0, 4);

  for (const carrier in NIGERIAN_CARRIERS) {
    if (NIGERIAN_CARRIERS[carrier].includes(prefix)) {
      return carrier;
    }
  }

  return "99"
}
