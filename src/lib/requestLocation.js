function decodeHeader(value) {
  if (value == null) return "";
  const s = Array.isArray(value) ? String(value[0] || "") : String(value);
  if (!s) return "";
  try {
    return decodeURIComponent(s.replace(/\+/g, " ")).trim();
  } catch {
    return s.trim();
  }
}

/**
 * Cidade/região a partir dos headers da Vercel (ou vazia em ambiente local).
 * @param {import("http").IncomingMessage | { headers?: Record<string, string | string[] | undefined> } | null} req
 */
function geoFromRequest(req) {
  const h = req && req.headers ? req.headers : {};
  const city = decodeHeader(h["x-vercel-ip-city"]);
  const region = decodeHeader(h["x-vercel-ip-country-region"]);
  const country = decodeHeader(h["x-vercel-ip-country"]);
  const parts = [];
  if (city) parts.push(city);
  if (region && region.toUpperCase() !== city.toUpperCase()) parts.push(region);
  if (country) parts.push(country.toUpperCase());
  return parts.join(", ");
}

/**
 * @param {{ geo?: string, timezone?: string, venue?: string, clientLocation?: string }} opts
 */
function composeLocation(opts) {
  const o = opts || {};
  const bits = [];
  const venue = typeof o.venue === "string" ? o.venue.trim() : "";
  const client = typeof o.clientLocation === "string" ? o.clientLocation.trim() : "";
  const geo = typeof o.geo === "string" ? o.geo.trim() : "";
  const tz = typeof o.timezone === "string" ? o.timezone.trim() : "";
  if (venue) bits.push(venue);
  if (client) bits.push(client);
  else if (geo) bits.push(geo);
  else if (tz) bits.push(tz);
  return bits.join(" · ");
}

module.exports = { geoFromRequest, composeLocation };
