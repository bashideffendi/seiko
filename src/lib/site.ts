// One place for the site's own URL and every link into the Tiny Hour Tales shop,
// so header, footer, CTAs and structured data never drift apart.

export const SITE_URL = "https://seiko.tinyhourtales.com";
export const SITE_NAME = "Seiko Almanac";

export const SHOP_ORIGIN = "https://tinyhourtales.com";

export const SHOP = {
  home: `${SHOP_ORIGIN}/`,
  collection: `${SHOP_ORIGIN}/collection/`,
  forHer: `${SHOP_ORIGIN}/woman/`,
  forHim: `${SHOP_ORIGIN}/man/`,
  ourStory: `${SHOP_ORIGIN}/about-us/`,
  wearCare: `${SHOP_ORIGIN}/wear-care/`,
  seiko: `${SHOP_ORIGIN}/brand/seiko/`,
  lassale: `${SHOP_ORIGIN}/brand/seiko/lassale/`,
  credor: `${SHOP_ORIGIN}/brand/credor/`,
  pulsar: `${SHOP_ORIGIN}/brand/pulsar/`,
  privacy: `${SHOP_ORIGIN}/privacy-policy/`,
} as const;

/** Seiko-family brand pages in the shop, in display order. */
export const SHOP_BRANDS = [
  { label: "Seiko", href: SHOP.seiko },
  { label: "Lassale", href: SHOP.lassale },
  { label: "Credor", href: SHOP.credor },
  { label: "Pulsar", href: SHOP.pulsar },
] as const;

export const CONTACT = {
  email: "hello@tinyhourtales.com",
  instagram: "@tinyhourtales",
  instagramUrl: "https://instagram.com/tinyhourtales",
  whatsappDisplay: "0899-5080-305",
  whatsappUrl: "https://wa.me/628995080305",
} as const;

/** Almanac sections, as named in the header. */
export const ALMANAC_NAV = [
  { label: "Year Finder", href: "/tools/serial-decoder" },
  { label: "Calibers", href: "/tools/caliber-lookup" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Learn", href: "/learn" },
] as const;

/** Shop links, as named in the header. */
export const SHOP_NAV = [
  { label: "Shop", href: SHOP.home },
  { label: "Collection", href: SHOP.collection },
  { label: "Our Story", href: SHOP.ourStory },
] as const;
