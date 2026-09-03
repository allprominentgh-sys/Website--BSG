export type Category={name:string;subcategories:string[]};
export type Listing={id:number;title:string;description:string;price:number;currency:string;location:string;category:string;subcategory:string;seller:string;phone:string;featured?:boolean};
export const categories:Category[]=[
{name:"Industrial Machinery",subcategories:["Machine Tools","CNC Machines","Metalworking Machinery","Packaging Machinery","Food Processing Machinery","Textile Machinery","Woodworking Machinery","Industrial Equipment"]},
{name:"Printing Equipment",subcategories:["Digital Printers","Offset Printers","Flexographic Printers","Screen Printing Machines","UV Printers","Embroidery Machines","Printing Materials"]},
{name:"Construction Equipment",subcategories:["Excavators","Loaders","Bulldozers","Cranes","Concrete Equipment","Compactors","Scaffolding"]},
{name:"Vehicles & Transportation",subcategories:["Cars","Trucks","Buses","Motorcycles","Heavy Trucks","Trailers","Vehicle Parts"]},
{name:"Electrical & Electronics",subcategories:["Electrical Equipment","Generators","Transformers","Solar Equipment","Batteries","Cables","Electronic Components"]},
{name:"Agriculture & Food",subcategories:["Agricultural Machinery","Farm Equipment","Irrigation Equipment","Livestock Equipment","Animal Feed","Food & Beverages","Farming Supplies"]},
{name:"Tools & Hardware",subcategories:["Hand Tools","Power Tools","Hardware","Fasteners","Welding Equipment","Measuring Tools"]},
{name:"Building Materials",subcategories:["Cement","Steel","Roofing","Tiles","Doors & Windows","Plumbing"]},
{name:"Home & Furniture",subcategories:["Furniture","Kitchen","Bedroom","Living Room","Office Furniture"]},
{name:"Apparel & Textiles",subcategories:["Clothing","Fabric","Shoes","Bags","Uniforms"]},
{name:"Beauty & Personal Care",subcategories:["Cosmetics","Skincare","Hair Products","Salon Equipment"]},
{name:"Sports & Entertainment",subcategories:["Sports Equipment","Fitness","Games","Events"]},
{name:"Packaging & Printing",subcategories:["Packaging Materials","Labels","Boxes","Bags"]},
{name:"Chemicals",subcategories:["Industrial Chemicals","Cleaning Chemicals","Raw Materials"]},
{name:"Energy & Renewable Energy",subcategories:["Solar","Inverters","Batteries","Generators","Energy Systems"]},
{name:"Consumer Electronics",subcategories:["TV","Audio","Cameras","Appliances"]},
{name:"Phones & Tablets",subcategories:["Phones","Tablets","Accessories","Smart Devices"]},
{name:"Cars & Auto Parts",subcategories:["Cars","Engines","Tyres","Batteries","Spare Parts"]},
{name:"Property",subcategories:["Houses","Land","Apartments","Commercial Property","Rentals"]},
{name:"Jobs",subcategories:["Full Time","Part Time","Contract","Skilled Work"]},
{name:"Services",subcategories:["Business Services","Repairs","Transport","Professional Services"]}];
export const listings:Listing[]=[
{id:1,title:"iPhone 15 Pro",description:"Clean and gently used iPhone 15 Pro. Contact seller for condition and availability.",price:12500,currency:"GHS",location:"Accra, Ghana",category:"Phones & Tablets",subcategory:"Phones",seller:"All Prominent Seller",phone:"0500000000",featured:true},
{id:2,title:"CNC Machine",description:"Industrial CNC machine suitable for precision manufacturing and workshop operations.",price:185000,currency:"GHS",location:"Tema, Ghana",category:"Industrial Machinery",subcategory:"CNC Machines",seller:"Industrial Equipment Hub",phone:"0240000000",featured:true},
{id:3,title:"Digital Printing Machine",description:"Commercial digital printing equipment for high-volume print production.",price:95000,currency:"GHS",location:"Accra, Ghana",category:"Printing Equipment",subcategory:"Digital Printers",seller:"PrintTech Ghana",phone:"0200000000",featured:true},
{id:4,title:"Excavator",description:"Heavy construction excavator available for sale. Inspection by appointment.",price:680000,currency:"GHS",location:"Kumasi, Ghana",category:"Construction Equipment",subcategory:"Excavators",seller:"Construction Pro",phone:"0270000000",featured:true}];
export const formatPrice=(price:number,currency:string)=>new Intl.NumberFormat("en-GH").format(price)+" "+currency;
