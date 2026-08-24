# Phase 1 Step 2 — Source Registry

The registry is intentionally expandable beyond 500 sources. It is a coverage manifest, not a claim that every source is automatically scrapeable.

## Required registry fields

Each source record must eventually contain:

- canonicalName
- domain
- sourceType
- categories
- geography
- acquisitionMethod
- accessStatus
- termsStatus
- licensingStatus
- ingestionEligibility
- freshnessPolicy
- provenancePolicy
- active

## Initial coverage taxonomy

- furniture
- wardrobes-storage
- kitchens-cabinetry
- bathroom-sanitary-plumbing
- tiles-surfaces-stone
- paint-wallpaper-wall-finishes
- plywood-mdf-hdf-boards-laminates-veneers
- hardware-hinges-channels-handles-baskets-lifts
- false-ceiling-gypsum-acoustic
- lighting-led-profiles-drivers
- electrical-switches-sockets-cabling
- fans-smart-home
- flooring-wood-vinyl-carpet-rugs
- curtains-blinds-tracks
- doors-frames-glass-partitions
- mattresses-soft-furnishings-decor
- appliances
- balcony-outdoor-kids-office
- designers-architects-studios-fabricators
- execution-installation-service
- marketplaces

## Representative seed universe

The production registry must research and deduplicate a substantially larger universe, including (where relevant): IKEA, Amazon India, Flipkart, Pepperfry, Furnishka, Urban Ladder, Wakefit, WoodenStreet, Home Centre, Durian, Royaloak, Godrej Interio, Godrej, Aristo, Livspace, HomeLane, DesignCafe, Bonito, Sleek, Spacewood, BathStory, Hindware, Jaquar, Cera, Kohler, Roca, Parryware, American Standard, Grohe, Duravit, TOTO, VitrA, Artize, Essco, Colston, Neycer, Kajaria, Somany, H&R Johnson, Orientbell, Simpolo, Varmora, Nitco, AGL, Qutone, RAK Ceramics, Asian Paints, Berger, Kansai Nerolac, Dulux, JSW Paints, Indigo Paints, Nippon Paint, Shalimar Paints, Birla Opus, Greenply, Greenpanel, CenturyPly, Merino, Royale Touche, Virgo, Archidply, Action Tesa, Stylam, Hettich, Häfele, Blum, Ebco, Saint-Gobain Gyproc, Armstrong, Ecophon, Signify/Philips, Wipro, Havells, Crompton, Orient Electric, Bajaj Electricals, Legrand, Schneider Electric, Panasonic, GM Modular, Polycab, RR Kabel, Atomberg, D'Decor, Jaipur Rugs, Obeetee, Welspun, Portico, Spaces, Pure Home + Living, Bosch, Siemens, IFB, LG, Samsung, Whirlpool, Haier, Faber, Elica, Kaff, Glen, Franke, Croma, Reliance Digital, Tata CLiQ, Myntra Home, Sleepwell, Duroflex, Kurlon, The Sleep Company, Nilkamal, Stanley, and regional/local suppliers discovered during source research.

This seed list is not the final 500+ registry. It is deliberately only a starting set. The implementation must continue expanding the registry by category and geography until the coverage milestone is exceeded, with no artificial upper bound.

## Acquisition rule

Automated acquisition is permitted only where the applicable source terms, access controls, licensing and law allow it. Otherwise the source remains usable through an approved API/feed, partner/licensed dataset, manual import, or user/vendor-provided data workflow. No fabricated product or price facts are permitted.
