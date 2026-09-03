# All Prominent Ghana — Clean Marketplace Foundation

This package is the clean replacement for the current GitHub project. It keeps the marketplace pages and category structure while fixing the Next.js/Tailwind build configuration and duplicate root files.

## Main routes
- `/` — marketplace home
- `/listings` — marketplace listings
- `/listings/[id]` — product details
- `/post-ad` — post an ad
- `/account` — account

## Categories
Industrial Machinery, Printing Equipment, Construction Equipment, Vehicles & Transportation, Electrical & Electronics, Agriculture & Food, Tools & Hardware, Building Materials, Home & Furniture, Apparel & Textiles, Beauty & Personal Care, Sports & Entertainment, Packaging & Printing, Chemicals, Energy & Renewable Energy, Consumer Electronics, Phones & Tablets, Cars & Auto Parts, Property, Jobs and Services.

## Build
Run `npm install` then `npm run build`.

Tailwind CSS v4 is configured through `@tailwindcss/postcss`; do not remove that dependency or the `postcss.config.mjs` file.
