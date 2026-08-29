# Phase 1 Step 2 — Production Source Registry

This single manifest is the canonical source registry specification. It is intentionally expandable beyond 500 sources; 500 is a coverage milestone, never a ceiling.

## Canonical record

Each source must be represented by one normalized record containing: canonicalName, domain, sourceType, categories, geography, acquisitionMethod, accessStatus, termsStatus, licensingStatus, ingestionEligibility, freshnessPolicy, provenancePolicy, active.

## Coverage taxonomy

furniture; wardrobes-storage; kitchens-cabinetry; bathroom-sanitary-plumbing; tiles-surfaces-stone; paint-wallpaper-wall-finishes; plywood-mdf-hdf-boards-laminates-veneers; hardware-hinges-channels-handles-baskets-lifts; false-ceiling-gypsum-acoustic; lighting-led-profiles-drivers; electrical-switches-sockets-cabling; fans-smart-home; flooring-wood-vinyl-carpet-rugs; curtains-blinds-tracks; doors-frames-glass-partitions; mattresses-soft-furnishings-decor; appliances; balcony-outdoor-kids-office; designers-architects-studios-fabricators; execution-installation-service; marketplaces.

## Reference universe

Research and deduplicate at least 500 distinct sources across the taxonomy, with no artificial upper limit. The initial named universe includes: IKEA, Amazon India, Flipkart, Pepperfry, Furnishka, Urban Ladder, Wakefit, WoodenStreet, Home Centre, Durian, Royaloak, Godrej Interio, Godrej, Aristo, Livspace, HomeLane, DesignCafe, Bonito, Sleek, Spacewood, BathStory, Hindware, Jaquar, Cera, Kohler, Roca, Parryware, American Standard, Grohe, Duravit, TOTO, VitrA, Artize, Essco, Colston, Neycer, Kajaria, Somany, H&R Johnson, Orientbell, Simpolo, Varmora, Nitco, AGL, Qutone, RAK Ceramics, Asian Paints, Berger, Kansai Nerolac, Dulux, JSW Paints, Indigo Paints, Nippon Paint, Shalimar Paints, Birla Opus, Greenply, Greenpanel, CenturyPly, Merino, Royale Touche, Virgo, Archidply, Action Tesa, Stylam, Hettich, Häfele, Blum, Ebco, Saint-Gobain Gyproc, Armstrong, Ecophon, Signify/Philips, Wipro, Havells, Crompton, Orient Electric, Bajaj Electricals, Legrand, Schneider Electric, Panasonic, GM Modular, Polycab, RR Kabel, Atomberg, D'Decor, Jaipur Rugs, Obeetee, Welspun, Portico, Spaces, Pure Home + Living, Bosch, Siemens, IFB, LG, Samsung, Whirlpool, Haier, Faber, Elica, Kaff, Glen, Franke, Croma, Reliance Digital, Tata CLiQ, Myntra Home, Sleepwell, Duroflex, Kurlon, The Sleep Company, Nilkamal, Stanley, plus researched regional/local suppliers and specialist vendors.

This named universe is a seed, not the final count. The engineering completion gate requires a machine-readable registry exceeding 500 deduplicated entries, with category and geography coverage reviewed for gaps.

## Product-level fields

Where legitimately accessible, ingestion must preserve product/SKU/source ID, exact variant/configuration, title/description, brand/manufacturer/vendor/seller, canonical category mapping, dimensions/units, material/construction, finish/colour, options/customization, images/media references, list/current/sale price, currency/unit, tax/shipping/installation inclusion, location/region, availability/stock/delivery/install status, warranty/returns, source URL, evidence, retrieval timestamp, confidence and freshness.

## Small-component coverage

Do not stop at room-level products. Preserve component-level products/specifications when exposed: wardrobe hinges/channels/handles/lifts/baskets; kitchen hardware; faucets/diverters/concealed systems; shower components; sinks/accessories; lighting profiles/drivers; switches/sockets; ceiling systems; boards/laminates; glass/door hardware; installation components.

## Acquisition and truth rules

Use official APIs/feeds, partner/licensed data, permitted public extraction, manual imports or vendor/user-provided data according to source terms, access controls, licensing and applicable law. Never bypass authentication, robots/access controls or rate limits. Never fabricate catalogue facts or prices.

Source-observed, verified, estimate and recommendation semantics remain distinct. Price observations are historical/append-only and preserve provenance. Marketplace seller identity is retained. Product/catalog data remains separate from locked budgets. Ingestion is idempotent and retry-safe.
