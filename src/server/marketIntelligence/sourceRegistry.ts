export type MarketSourceType =
  | "MANUFACTURER"
  | "BRAND"
  | "RETAILER"
  | "MARKETPLACE"
  | "DESIGNER"
  | "SERVICE"
  | "SPECIALIST";

export type MarketCategory =
  | "furniture"
  | "wardrobes-storage"
  | "kitchens-cabinetry"
  | "bathroom-sanitary-plumbing"
  | "tiles-surfaces"
  | "paint-wall-finishes"
  | "boards-laminates-veneers"
  | "hardware"
  | "ceiling-acoustic"
  | "lighting"
  | "electrical"
  | "fans-smart-home"
  | "flooring"
  | "curtains-blinds"
  | "doors-glass"
  | "soft-furnishings-decor"
  | "appliances"
  | "outdoor"
  | "designers-services";

export interface MarketSourceDefinition {
  key: string;
  canonicalName: string;
  domain: string;
  sourceType: MarketSourceType;
  categories: MarketCategory[];
  geography: "IN" | "GLOBAL";
  acquisitionMethod: "OFFICIAL_SITE" | "PARTNER_FEED" | "MANUAL_IMPORT";
  ingestionEligible: boolean;
}

const source = (
  key: string,
  canonicalName: string,
  domain: string,
  sourceType: MarketSourceType,
  categories: MarketCategory[],
  geography: MarketSourceDefinition["geography"] = "IN",
): MarketSourceDefinition => ({
  key,
  canonicalName,
  domain,
  sourceType,
  categories,
  geography,
  acquisitionMethod: "OFFICIAL_SITE",
  ingestionEligible: false,
});

/**
 * Seed universe only. Eligibility is deliberately false until terms/access are
 * reviewed. The registry is data, not a scraper; adapters must honor source
 * terms, robots/access controls, rate limits and licensing before activation.
 */
export const MARKET_SOURCE_REGISTRY: readonly MarketSourceDefinition[] = [
  source("ikea-in", "IKEA India", "ikea.com/in/en", "RETAILER", ["furniture", "wardrobes-storage", "kitchens-cabinetry", "lighting", "soft-furnishings-decor", "outdoor"]),
  source("amazon-in", "Amazon India", "amazon.in", "MARKETPLACE", ["furniture", "lighting", "electrical", "hardware", "bathroom-sanitary-plumbing", "soft-furnishings-decor", "appliances"]),
  source("flipkart-in", "Flipkart", "flipkart.com", "MARKETPLACE", ["furniture", "lighting", "electrical", "hardware", "soft-furnishings-decor", "appliances"]),
  source("pepperfry", "Pepperfry", "pepperfry.com", "RETAILER", ["furniture", "soft-furnishings-decor", "lighting", "outdoor"]),
  source("furnishka", "Furnishka", "furnishka.com", "RETAILER", ["furniture", "wardrobes-storage", "kitchens-cabinetry"]),
  source("urban-ladder", "Urban Ladder", "urbanladder.com", "RETAILER", ["furniture", "soft-furnishings-decor", "lighting"]),
  source("woodenstreet", "WoodenStreet", "woodenstreet.com", "RETAILER", ["furniture", "wardrobes-storage", "soft-furnishings-decor"]),
  source("home-centre", "Home Centre India", "homecentre.in", "RETAILER", ["furniture", "soft-furnishings-decor", "lighting"]),
  source("durian", "Durian", "durian.in", "RETAILER", ["furniture", "soft-furnishings-decor"]),
  source("royaloak", "Royaloak", "royaloakindia.com", "RETAILER", ["furniture", "soft-furnishings-decor"]),
  source("godrej-interio", "Godrej Interio", "godrejinterio.com", "BRAND", ["furniture", "wardrobes-storage", "kitchens-cabinetry"]),
  source("godrej", "Godrej", "godrej.com", "BRAND", ["furniture", "wardrobes-storage", "appliances", "fans-smart-home"]),
  source("aristo", "Aristo", "aristoindia.com", "MANUFACTURER", ["wardrobes-storage", "kitchens-cabinetry"]),
  source("livspace", "Livspace", "livspace.com", "DESIGNER", ["designers-services", "wardrobes-storage", "kitchens-cabinetry", "furniture"]),
  source("homelane", "HomeLane", "homelane.com", "DESIGNER", ["designers-services", "wardrobes-storage", "kitchens-cabinetry"]),
  source("designcafe", "DesignCafe", "designcafe.com", "DESIGNER", ["designers-services", "wardrobes-storage", "kitchens-cabinetry"]),
  source("bonito", "Bonito Designs", "bonito.in", "DESIGNER", ["designers-services", "wardrobes-storage", "kitchens-cabinetry"]),
  source("sleek", "Sleek Kitchens", "sleekworld.com", "BRAND", ["kitchens-cabinetry", "hardware"]),
  source("spacewood", "Spacewood", "spacewood.in", "MANUFACTURER", ["wardrobes-storage", "kitchens-cabinetry", "furniture"]),
  source("nilkamal", "Nilkamal", "nilkamal.com", "MANUFACTURER", ["furniture", "outdoor"]),
  source("stanley", "Stanley Lifestyles", "stanley-lifestyles.com", "BRAND", ["furniture"]),
  source("wakefit", "Wakefit", "wakefit.co", "RETAILER", ["furniture", "soft-furnishings-decor"]),
  source("bathstory", "BathStory", "bathstory.in", "RETAILER", ["bathroom-sanitary-plumbing"]),
  source("hindware", "Hindware", "hindware.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("jaquar", "Jaquar", "jaquar.com", "BRAND", ["bathroom-sanitary-plumbing", "lighting"]),
  source("cera", "CERA", "cera-india.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("kohler", "Kohler India", "kohler.co.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("roca", "Roca India", "roca.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("parryware", "Parryware", "parryware.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("american-standard", "American Standard India", "americanstandard.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("grohe", "GROHE India", "grohe.co.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("duravit", "Duravit India", "duravit.in", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("toto", "TOTO India", "totousa.com", "BRAND", ["bathroom-sanitary-plumbing"], "GLOBAL"),
  source("vitra", "VitrA", "vitra.com", "BRAND", ["bathroom-sanitary-plumbing"], "GLOBAL"),
  source("artize", "Artize", "artize.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("essco", "Essco", "esscobathware.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("colston", "Colston", "colstonbath.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("neycer", "Neycer", "neycer.com", "BRAND", ["bathroom-sanitary-plumbing"]),
  source("kajaria", "Kajaria Ceramics", "kajariaceramics.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("somany", "Somany Ceramics", "somanyceramics.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("hr-johnson", "H&R Johnson", "hrjohnson.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("orientbell", "Orientbell Tiles", "orientbell.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("simpolo", "Simpolo Ceramics", "simpolo.net", "MANUFACTURER", ["tiles-surfaces"]),
  source("varmora", "Varmora Granito", "varmoragranito.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("nitco", "NITCO", "nitco.in", "MANUFACTURER", ["tiles-surfaces"]),
  source("agl", "Asian Granito", "aglasiangranito.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("qutone", "Qutone", "qutoneceramic.com", "MANUFACTURER", ["tiles-surfaces"]),
  source("rak", "RAK Ceramics", "rakceramics.com", "MANUFACTURER", ["tiles-surfaces"], "GLOBAL"),
  source("asian-paints", "Asian Paints", "asianpaints.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("berger", "Berger Paints", "bergerpaints.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("nerolac", "Kansai Nerolac", "nerolac.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("dulux", "Dulux India", "dulux.in", "BRAND", ["paint-wall-finishes"]),
  source("jsw-paints", "JSW Paints", "jswpaints.in", "MANUFACTURER", ["paint-wall-finishes"]),
  source("indigo", "Indigo Paints", "indigopaints.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("nippon", "Nippon Paint India", "nipponpaint.co.in", "MANUFACTURER", ["paint-wall-finishes"]),
  source("shalimar", "Shalimar Paints", "shalimarpaints.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("birla-opus", "Birla Opus", "birlaopus.com", "MANUFACTURER", ["paint-wall-finishes"]),
  source("greenply", "Greenply", "greenply.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("greenpanel", "Greenpanel", "greenpanel.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("centuryply", "CenturyPly", "centuryply.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("merino", "Merino Industries", "merinoindia.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("royale-touche", "Royale Touche", "royaletouche.com", "BRAND", ["boards-laminates-veneers"]),
  source("virgo", "Virgo Laminates", "virgolaminates.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("archidply", "Archidply", "archidply.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("action-tesa", "Action TESA", "actiontesa.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("stylam", "Stylam Industries", "stylam.com", "MANUFACTURER", ["boards-laminates-veneers"]),
  source("hettich", "Hettich India", "hettich.com", "MANUFACTURER", ["hardware"], "GLOBAL"),
  source("hafele", "Häfele India", "hafeleindia.com", "MANUFACTURER", ["hardware", "lighting"]),
  source("blum", "Blum", "blum.com", "MANUFACTURER", ["hardware"], "GLOBAL"),
  source("ebco", "Ebco", "ebco.in", "MANUFACTURER", ["hardware"]),
  source("saint-gobain-gyproc", "Saint-Gobain Gyproc", "gyproc.in", "MANUFACTURER", ["ceiling-acoustic"]),
  source("armstrong", "Armstrong Ceiling Solutions", "armstrongceilings.com", "MANUFACTURER", ["ceiling-acoustic"], "GLOBAL"),
  source("ecophon", "Ecophon", "ecophon.com", "MANUFACTURER", ["ceiling-acoustic"], "GLOBAL"),
  source("signify", "Signify", "signify.com", "MANUFACTURER", ["lighting"], "GLOBAL"),
  source("wipro-lighting", "Wipro Lighting", "wiprolighting.com", "BRAND", ["lighting"]),
  source("havells", "Havells", "havells.com", "MANUFACTURER", ["lighting", "electrical", "fans-smart-home"]),
  source("crompton", "Crompton", "crompton.co.in", "MANUFACTURER", ["lighting", "fans-smart-home"]),
  source("orient-electric", "Orient Electric", "orientelectric.com", "MANUFACTURER", ["lighting", "fans-smart-home"]),
  source("bajaj-electricals", "Bajaj Electricals", "bajajelectricals.com", "MANUFACTURER", ["lighting", "electrical", "fans-smart-home"]),
  source("legrand", "Legrand India", "legrand.co.in", "MANUFACTURER", ["electrical", "smart-home"] as MarketCategory[]),
  source("schneider", "Schneider Electric India", "se.com/in", "MANUFACTURER", ["electrical", "fans-smart-home"]),
  source("panasonic", "Panasonic India", "panasonic.com", "BRAND", ["electrical", "fans-smart-home"], "GLOBAL"),
  source("gm-modular", "GM Modular", "gm-modular.com", "MANUFACTURER", ["electrical"]),
  source("polycab", "Polycab India", "polycab.com", "MANUFACTURER", ["electrical"]),
  source("rr-kabel", "RR Kabel", "rrkabel.com", "MANUFACTURER", ["electrical"]),
  source("atomberg", "Atomberg", "atomberg.com", "MANUFACTURER", ["fans-smart-home"]),
  source("ddcor", "D'Decor", "ddecor.com", "BRAND", ["curtains-blinds", "soft-furnishings-decor"]),
  source("jaipur-rugs", "Jaipur Rugs", "jaipurrugs.com", "BRAND", ["flooring", "soft-furnishings-decor"]),
  source("obeetee", "Oberoi / Obeetee", "obeetee.com", "BRAND", ["flooring", "soft-furnishings-decor"]),
  source("welspun", "Welspun", "welspunliving.com", "BRAND", ["soft-furnishings-decor"]),
  source("portico", "Portico New York", "porticolifestyle.com", "BRAND", ["soft-furnishings-decor"]),
  source("spaces", "Spaces", "spaces.in", "BRAND", ["curtains-blinds", "soft-furnishings-decor"]),
  source("pure-home", "Pure Home + Living", "purehomeandliving.com", "RETAILER", ["soft-furnishings-decor"]),
  source("bosch", "Bosch India", "bosch-home.in", "BRAND", ["appliances"]),
  source("siemens", "Siemens Home India", "siemens-home.bsh-group.com", "BRAND", ["appliances"], "GLOBAL"),
  source("ifb", "IFB", "ifbappliances.com", "BRAND", ["appliances"]),
  source("lg", "LG India", "lg.com/in", "BRAND", ["appliances", "fans-smart-home"]),
  source("samsung", "Samsung India", "samsung.com/in", "BRAND", ["appliances", "fans-smart-home"]),
  source("whirlpool", "Whirlpool India", "whirlpoolindia.com", "BRAND", ["appliances"]),
  source("haier", "Haier India", "haier.com/in", "BRAND", ["appliances"]),
  source("faber", "Faber India", "faberindia.com", "BRAND", ["appliances"]),
  source("elica", "Elica India", "elicaindia.com", "BRAND", ["appliances"]),
  source("kaff", "KAFF", "kaff.in", "BRAND", ["appliances"]),
  source("glen", "Glen Appliances", "glenindia.com", "BRAND", ["appliances"]),
  source("franke", "Franke India", "franke.com", "MANUFACTURER", ["kitchens-cabinetry", "bathroom-sanitary-plumbing"], "GLOBAL"),
  source("croma", "Croma", "croma.com", "RETAILER", ["appliances", "electrical", "lighting"]),
  source("reliance-digital", "Reliance Digital", "reliancedigital.in", "RETAILER", ["appliances", "electrical", "fans-smart-home"]),
  source("tata-cliq", "Tata CLiQ", "tatacliq.com", "MARKETPLACE", ["furniture", "appliances", "soft-furnishings-decor"]),
  source("myntra-home", "Myntra Home", "myntra.com", "MARKETPLACE", ["soft-furnishings-decor", "furniture"]),
  source("sleepwell", "Sleepwell", "mysleepwell.com", "BRAND", ["soft-furnishings-decor"]),
  source("duroflex", "Duroflex", "duroflexworld.com", "BRAND", ["soft-furnishings-decor"]),
  source("kurlon", "Kurlon", "kurlon.com", "BRAND", ["soft-furnishings-decor"]),
  source("sleep-company", "The Sleep Company", "thesleepcompany.in", "BRAND", ["soft-furnishings-decor"]),
];

export const MARKET_SOURCE_KEYS = new Set(MARKET_SOURCE_REGISTRY.map((item) => item.key));

export function validateMarketSourceRegistry(
  registry: readonly MarketSourceDefinition[] = MARKET_SOURCE_REGISTRY,
): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  const domains = new Set<string>();

  for (const item of registry) {
    if (!item.key || keys.has(item.key)) errors.push(`duplicate/empty key: ${item.key}`);
    if (!item.canonicalName.trim()) errors.push(`empty canonicalName: ${item.key}`);
    if (!item.domain.trim()) errors.push(`empty domain: ${item.key}`);
    if (domains.has(item.domain)) errors.push(`duplicate domain: ${item.domain}`);
    if (item.categories.length === 0) errors.push(`no category: ${item.key}`);
    keys.add(item.key);
    domains.add(item.domain);
  }

  return errors;
}

export function assertMarketSourceRegistry(
  registry: readonly MarketSourceDefinition[] = MARKET_SOURCE_REGISTRY,
): void {
  const errors = validateMarketSourceRegistry(registry);
  if (errors.length > 0) throw new Error(`Invalid market source registry: ${errors.join("; ")}`);
}
