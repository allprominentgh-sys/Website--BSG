export type Category = {
  name: string;
  subcategories: string[];
};

export type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  subcategory: string;
  seller: string;
  phone: string;
  image: string;
  featured?: boolean;
};

export const categories: Category[] = [
  {
    name: "Industrial Machinery",
    subcategories: [
      "Machine Tools",
      "CNC Machines",
      "Metalworking Machinery",
      "Packaging Machinery",
      "Food Processing Machinery",
      "Textile Machinery",
      "Woodworking Machinery",
      "Industrial Equipment"
    ]
  },
  {
    name: "Printing Equipment",
    subcategories: [
      "Digital Printers",
      "Offset Printers",
      "Flexographic Printers",
      "Screen Printing Machines",
      "UV Printers",
      "Embroidery Machines",
      "Printing Materials"
    ]
  },
  {
    name: "Construction Equipment",
    subcategories: [
      "Excavators",
      "Loaders",
      "Bulldozers",
      "Cranes",
      "Concrete Machinery",
      "Road Machinery",
      "Mining Equipment"
    ]
  },
  {
    name: "Vehicles & Transportation",
    subcategories: [
      "Cars",
      "Trucks",
      "Buses",
      "Motorcycles",
      "Heavy Trucks",
      "Trailers",
      "Vehicle Parts"
    ]
  },
  {
    name: "Electrical & Electronics",
    subcategories: [
      "Electrical Equipment",
      "Generators",
      "Transformers",
      "Solar Equipment",
      "Batteries",
      "Cables",
      "Electronic Components"
    ]
  },
  {
    name: "Agriculture & Food",
    subcategories: [
      "Agricultural Machinery",
      "Farm Equipment",
      "Irrigation Equipment",
      "Livestock Equipment",
      "Animal Feed",
      "Food & Beverages",
      "Farming Supplies"
    ]
  },
  {
    name: "Tools & Hardware",
    subcategories: [
      "Hand Tools",
      "Power Tools",
      "Hardware",
      "Fasteners",
      "Welding Equipment",
      "Measuring Tools"
    ]
  },
  {
    name: "Building Materials",
    subcategories: [
      "Cement",
      "Steel",
      "Roofing Materials",
      "Tiles",
      "Doors & Windows",
      "Plumbing Materials",
      "Glass"
    ]
  },
  {
    name: "Home & Furniture",
    subcategories: [
      "Furniture",
      "Kitchen Furniture",
      "Office Furniture",
      "Home Decor",
      "Lighting",
      "Mattresses"
    ]
  },
  {
    name: "Apparel & Textiles",
    subcategories: [
      "Clothing",
      "Shoes",
      "Bags",
      "Fabrics",
      "Uniforms",
      "Textile Machinery"
    ]
  },
  {
    name: "Beauty & Personal Care",
    subcategories: [
      "Cosmetics",
      "Skincare",
      "Hair Products",
      "Hair Salon Equipment",
      "Beauty Equipment",
      "Personal Care"
    ]
  },
  {
    name: "Sports & Entertainment",
    subcategories: [
      "Sports Equipment",
      "Fitness Equipment",
      "Outdoor Recreation",
      "Games",
      "Musical Instruments",
      "Entertainment Equipment"
    ]
  },
  {
    name: "Packaging & Printing",
    subcategories: [
      "Packaging Machines",
      "Packaging Materials",
      "Plastic Packaging",
      "Paper Packaging",
      "Labels",
      "Printing Supplies"
    ]
  },
  {
    name: "Chemicals",
    subcategories: [
      "Industrial Chemicals",
      "Agricultural Chemicals",
      "Cleaning Chemicals",
      "Paints & Coatings",
      "Adhesives",
      "Plastic Raw Materials"
    ]
  },
  {
    name: "Energy & Renewable Energy",
    subcategories: [
      "Solar Panels",
      "Solar Inverters",
      "Solar Batteries",
      "Generators",
      "Wind Energy Equipment",
      "Energy Storage"
    ]
  },
  {
    name: "Consumer Electronics",
    subcategories: [
      "Televisions",
      "Audio Equipment",
      "Cameras",
      "Smart Devices",
      "Accessories",
      "Home Appliances"
    ]
  },
  {
    name: "Phones & Tablets",
    subcategories: [
      "iPhones",
      "Android Phones",
      "Tablets",
      "Phone Accessories",
      "Smart Watches",
      "Chargers"
    ]
  },
  {
    name: "Cars & Auto Parts",
    subcategories: [
      "Cars",
      "SUVs",
      "Pickup Trucks",
      "Engines",
      "Tyres",
      "Car Accessories",
      "Spare Parts"
    ]
  },
  {
    name: "Property",
    subcategories: [
      "Houses",
      "Apartments",
      "Land",
      "Commercial Property",
      "Warehouses",
      "Shops",
      "Office Space"
    ]
  },
  {
    name: "Jobs",
    subcategories: [
      "Full Time",
      "Part Time",
      "Remote Jobs",
      "Engineering Jobs",
      "Construction Jobs",
      "Sales Jobs",
      "Drivers"
    ]
  },
  {
    name: "Services",
    subcategories: [
      "Professional Services",
      "Repair Services",
      "Construction Services",
      "Transport Services",
      "Cleaning Services",
      "IT Services",
      "Business Services"
    ]
  }
];

export const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description:
      "Clean and gently used iPhone 15 Pro. Contact seller for condition and availability.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    subcategory: "iPhones",
    seller: "All Prominent Seller",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 2,
    title: "CNC Machine",
    description:
      "Industrial CNC machine suitable for precision manufacturing and workshop operations.",
    price: 185000,
    currency: "GHS",
    location: "Tema, Ghana",
    category: "Industrial Machinery",
    subcategory: "CNC Machines",
    seller: "Industrial Equipment Hub",
    phone: "233240000001",
    image:
      "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 3,
    title: "Digital Printing Machine",
    description:
      "Commercial digital printing equipment for high-volume print production.",
    price: 95000,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Printing Equipment",
    subcategory: "Digital Printers",
    seller: "PrintTech Ghana",
    phone: "233240000002",
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 4,
    title: "Excavator",
    description:
      "Heavy construction excavator available for sale. Inspection by appointment.",
    price: 680000,
    currency: "GHS",
    location: "Kumasi, Ghana",
    category: "Construction Equipment",
    subcategory: "Excavators",
    seller: "Construction Pro",
    phone: "233240000003",
    image:
      "https://images.unsplash.com/photo-1580901369227-308f6f40f5b2?auto=format&fit=crop&w=1200&q=80",
    featured: true
  }
];

export const formatPrice = (
  price: number,
  currency: string
) =>
  new Intl.NumberFormat("en-GH").format(price) +
  " " +
  currency;
