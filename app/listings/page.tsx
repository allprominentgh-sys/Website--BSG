
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";
import { useMarketPreferences } from "@/app/components/MarketPreferencesProvider";

type Listing = {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  location: string | null;
  category: string | null;
  subcategory: string | null;
  seller_id: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string | null;
  item_region: string | null;
  item_city: string | null;
  item_area: string | null;
  item_ghana_post_gps: string | null;
  item_latitude: number | null;
  item_longitude: number | null;
};

type GhanaRegion = {
  id: number;
  name: string;
  sort_order: number;
};

type GhanaLocation = {
  id: number;
  region_id: number;
  name: string;
  location_type: "city" | "town" | "area";
  parent_name: string | null;
  sort_order: number;
};

type ListingImage = {
  listing_id: number;
  image_url: string;
};

type Promotion = {
  listing_id: number;
  package_id: string;
  promotion_rank: number;
  starts_at: string | null;
  ends_at: string | null;
};

const CATEGORY_OPTIONS = [
  "All Categories",
  "Phones & Tablets",
  "Cars",
  "Property",
  "Fashion",
  "Electronics",
  "Jobs & Services",
  "Home & Garden",
  "Agriculture",
  "Machinery",
  "Printing Equipment",
  "Construction Equipment",
  "Vehicles",
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  "Phones & Tablets": ["Phones", "Tablets", "Accessories", "Smart Watches"],
  Cars: ["Cars", "SUVs", "Trucks", "Buses", "Spare Parts"],
  Property: ["Houses", "Apartments", "Land", "Commercial Property", "Rentals"],
  Fashion: ["Men", "Women", "Children", "Shoes", "Bags"],
  Electronics: ["TVs", "Computers", "Cameras", "Audio", "Accessories"],
  "Jobs & Services": [
    "Jobs",
    "Repairs",
    "Design",
    "Cleaning",
    "Professional Services",
  ],
  "Home & Garden": ["Furniture", "Kitchen", "Garden", "Home Decor"],
  Agriculture: [
    "Farm Produce",
    "Livestock",
    "Farm Equipment",
    "Seeds",
    "Fertilizer",
  ],
  Machinery: [
    "Industrial Machines",
    "Printing Machines",
    "Construction Machines",
    "Agricultural Machines",
  ],
  "Printing Equipment": [
    "DTF Printers",
    "Eco Solvent Printers",
    "UV Printers",
    "Screen Printing",
    "Printing Materials",
  ],
  "Construction Equipment": [
    "Excavators",
    "Loaders",
    "Concrete Machines",
    "Generators",
    "Tools",
  ],
  Vehicles: ["Cars", "Trucks", "Buses", "Motorcycles", "Spare Parts"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Printing Equipment": [
    "printer",
    "printing",
    "dtf",
    "eco solvent",
    "uv printer",
    "screen printing",
  ],
  Machinery: ["machine", "machinery", "printer", "industrial", "equipment"],
  "Construction Equipment": [
    "excavator",
    "loader",
    "concrete",
    "generator",
    "construction",
    "bulldozer",
  ],
  Electronics: [
    "electronic",
    "computer",
    "phone",
    "tablet",
    "television",
    "camera",
  ],
  Vehicles: ["vehicle", "car", "truck", "bus", "motorcycle"],
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    searchMarketplace: "Search Marketplace",
    searchDescription:
      "Find products, vehicles, property, machinery, electronics, agriculture, services and more across Ghana.",
    postAd: "+ Post an Ad",
    searchProducts: "Search products",
    searchPlaceholder: "Printer, phone, car, location...",
    category: "Category",
    subcategory: "Subcategory",
    allCategories: "All Categories",
    allSubcategories: "All Subcategories",
    region: "Region",
    allGhana: "All Ghana",
    cityTown: "City / Town",
    allCities: "All Cities / Towns",
    selectRegion: "Select Region First",
    area: "Area",
    allAreas: "All Areas",
    selectCity: "Select City/Town First",
    search: "Search",
    clearFilters: "Clear Filters",
    detectLocation: "📍 Detect Location",
    listings: "Marketplace Listings",
    loading: "Loading listings...",
    found: "listings found",
    filtersActive: "Filters active",
    loadingMarketplace: "Loading marketplace listings...",
    noListings: "No listings found",
    noListingsDescription:
      "Try another search term or change your category and location filters.",
    clearSearch: "Clear Search",
    untitled: "Untitled Listing",
    noDescription: "No description provided.",
    imageUnavailable: "Product image unavailable",
    viewListing: "View Listing",
    chatSeller: "Chat Seller",
    searchAcross: "Search across BEST SALES GHANA",
    searchAcrossDescription:
      "Find listings across the marketplace using one search page.",
    priceOnRequest: "Price on request",
    locationUnsupported: "Location detection is not supported on this device.",
    locationDetected:
      "Your phone location was detected. Select your Region, City/Town and Area to filter listings. GPS-based automatic filtering is not connected yet.",
    locationFailed:
      "Unable to detect your location. Please select your location manually.",
    priceRateUnavailable: "Exchange rate unavailable",
  },
  fr: {
    searchMarketplace: "Rechercher sur la marketplace",
    searchDescription:
      "Trouvez des produits, véhicules, biens immobiliers, machines, équipements et services au Ghana.",
    postAd: "+ Publier une annonce",
    searchProducts: "Rechercher des produits",
    searchPlaceholder: "Imprimante, téléphone, voiture, lieu...",
    category: "Catégorie",
    subcategory: "Sous-catégorie",
    allCategories: "Toutes les catégories",
    allSubcategories: "Toutes les sous-catégories",
    region: "Région",
    allGhana: "Tout le Ghana",
    cityTown: "Ville / Localité",
    allCities: "Toutes les villes",
    selectRegion: "Choisissez d'abord une région",
    area: "Quartier",
    allAreas: "Tous les quartiers",
    selectCity: "Choisissez d'abord une ville",
    search: "Rechercher",
    clearFilters: "Effacer les filtres",
    detectLocation: "📍 Détecter ma position",
    listings: "Annonces de la marketplace",
    loading: "Chargement des annonces...",
    found: "annonces trouvées",
    filtersActive: "Filtres actifs",
    loadingMarketplace: "Chargement de la marketplace...",
    noListings: "Aucune annonce trouvée",
    noListingsDescription: "Essayez un autre terme ou modifiez les filtres.",
    clearSearch: "Effacer la recherche",
    untitled: "Annonce sans titre",
    noDescription: "Aucune description fournie.",
    imageUnavailable: "Image du produit indisponible",
    viewListing: "Voir l'annonce",
    chatSeller: "Contacter le vendeur",
    searchAcross: "Rechercher sur BEST SALES GHANA",
    searchAcrossDescription: "Trouvez des annonces sur toute la marketplace.",
    priceOnRequest: "Prix sur demande",
    locationUnsupported: "La détection de position n'est pas prise en charge.",
    locationDetected:
      "Votre position a été détectée. Choisissez votre région, ville et quartier pour filtrer les annonces.",
    locationFailed: "Impossible de détecter votre position.",
    priceRateUnavailable: "Taux de change indisponible",
  },
  zh: {
    searchMarketplace: "搜索商品市场",
    searchDescription:
      "在加纳查找商品、车辆、房地产、机械设备、农业产品和服务。",
    postAd: "+ 发布广告",
    searchProducts: "搜索商品",
    searchPlaceholder: "打印机、手机、汽车、地点...",
    category: "类别",
    subcategory: "子类别",
    allCategories: "所有类别",
    allSubcategories: "所有子类别",
    region: "地区",
    allGhana: "加纳全部地区",
    cityTown: "城市 / 城镇",
    allCities: "所有城市 / 城镇",
    selectRegion: "请先选择地区",
    area: "区域",
    allAreas: "所有区域",
    selectCity: "请先选择城市",
    search: "搜索",
    clearFilters: "清除筛选",
    detectLocation: "📍 检测位置",
    listings: "市场商品列表",
    loading: "正在加载商品...",
    found: "条商品",
    filtersActive: "筛选已启用",
    loadingMarketplace: "正在加载市场商品...",
    noListings: "未找到商品",
    noListingsDescription: "请尝试其他关键词或修改筛选条件。",
    clearSearch: "清除搜索",
    untitled: "未命名商品",
    noDescription: "暂无描述。",
    imageUnavailable: "商品图片不可用",
    viewListing: "查看商品",
    chatSeller: "联系卖家",
    searchAcross: "搜索 BEST SALES GHANA",
    searchAcrossDescription: "在整个市场中查找商品。",
    priceOnRequest: "价格面议",
    locationUnsupported: "此设备不支持位置检测。",
    locationDetected: "已检测到您的位置。请选择地区、城市和区域筛选商品。",
    locationFailed: "无法检测位置，请手动选择地点。",
    priceRateUnavailable: "汇率不可用",
  },
  es: {
    searchMarketplace: "Buscar en el mercado",
    searchDescription:
      "Encuentra productos, vehículos, propiedades, maquinaria, equipos y servicios en Ghana.",
    postAd: "+ Publicar anuncio",
    searchProducts: "Buscar productos",
    searchPlaceholder: "Impresora, teléfono, coche, ubicación...",
    category: "Categoría",
    subcategory: "Subcategoría",
    allCategories: "Todas las categorías",
    allSubcategories: "Todas las subcategorías",
    region: "Región",
    allGhana: "Todo Ghana",
    cityTown: "Ciudad / Pueblo",
    allCities: "Todas las ciudades",
    selectRegion: "Selecciona primero una región",
    area: "Zona",
    allAreas: "Todas las zonas",
    selectCity: "Selecciona primero una ciudad",
    search: "Buscar",
    clearFilters: "Borrar filtros",
    detectLocation: "📍 Detectar ubicación",
    listings: "Anuncios del mercado",
    loading: "Cargando anuncios...",
    found: "anuncios encontrados",
    filtersActive: "Filtros activos",
    loadingMarketplace: "Cargando anuncios...",
    noListings: "No se encontraron anuncios",
    noListingsDescription: "Prueba otro término o cambia los filtros.",
    clearSearch: "Borrar búsqueda",
    untitled: "Anuncio sin título",
    noDescription: "Sin descripción.",
    imageUnavailable: "Imagen del producto no disponible",
    viewListing: "Ver anuncio",
    chatSeller: "Contactar vendedor",
    searchAcross: "Buscar en BEST SALES GHANA",
    searchAcrossDescription: "Busca anuncios en todo el mercado.",
    priceOnRequest: "Precio a consultar",
    locationUnsupported: "Este dispositivo no admite la detección de ubicación.",
    locationDetected:
      "Se detectó tu ubicación. Selecciona región, ciudad y zona para filtrar.",
    locationFailed: "No se pudo detectar tu ubicación.",
    priceRateUnavailable: "Tipo de cambio no disponible",
  },
  pt: {
    searchMarketplace: "Pesquisar no marketplace",
    searchDescription:
      "Encontre produtos, veículos, imóveis, máquinas, equipamentos e serviços no Gana.",
    postAd: "+ Publicar anúncio",
    searchProducts: "Pesquisar produtos",
    searchPlaceholder: "Impressora, telefone, carro, localização...",
    category: "Categoria",
    subcategory: "Subcategoria",
    allCategories: "Todas as categorias",
    allSubcategories: "Todas as subcategorias",
    region: "Região",
    allGhana: "Todo o Gana",
    cityTown: "Cidade / Localidade",
    allCities: "Todas as cidades",
    selectRegion: "Selecione primeiro uma região",
    area: "Área",
    allAreas: "Todas as áreas",
    selectCity: "Selecione primeiro uma cidade",
    search: "Pesquisar",
    clearFilters: "Limpar filtros",
    detectLocation: "📍 Detetar localização",
    listings: "Anúncios do marketplace",
    loading: "A carregar anúncios...",
    found: "anúncios encontrados",
    filtersActive: "Filtros ativos",
    loadingMarketplace: "A carregar anúncios...",
    noListings: "Nenhum anúncio encontrado",
    noListingsDescription: "Tente outro termo ou altere os filtros.",
    clearSearch: "Limpar pesquisa",
    untitled: "Anúncio sem título",
    noDescription: "Sem descrição.",
    imageUnavailable: "Imagem do produto indisponível",
    viewListing: "Ver anúncio",
    chatSeller: "Contactar vendedor",
    searchAcross: "Pesquisar em BEST SALES GHANA",
    searchAcrossDescription: "Encontre anúncios em todo o marketplace.",
    priceOnRequest: "Preço sob consulta",
    locationUnsupported: "Este dispositivo não suporta deteção de localização.",
    locationDetected:
      "A sua localização foi detetada. Selecione região, cidade e área para filtrar.",
    locationFailed: "Não foi possível detetar a localização.",
    priceRateUnavailable: "Taxa de câmbio indisponível",
  },
  ar: {
    searchMarketplace: "البحث في السوق",
    searchDescription:
      "ابحث عن المنتجات والمركبات والعقارات والآلات والمعدات والخدمات في غانا.",
    postAd: "+ نشر إعلان",
    searchProducts: "البحث عن المنتجات",
    searchPlaceholder: "طابعة، هاتف، سيارة، موقع...",
    category: "الفئة",
    subcategory: "الفئة الفرعية",
    allCategories: "جميع الفئات",
    allSubcategories: "جميع الفئات الفرعية",
    region: "المنطقة",
    allGhana: "جميع مناطق غانا",
    cityTown: "المدينة / البلدة",
    allCities: "جميع المدن",
    selectRegion: "اختر المنطقة أولاً",
    area: "الحي",
    allAreas: "جميع الأحياء",
    selectCity: "اختر المدينة أولاً",
    search: "بحث",
    clearFilters: "مسح عوامل التصفية",
    detectLocation: "📍 تحديد الموقع",
    listings: "إعلانات السوق",
    loading: "جارٍ تحميل الإعلانات...",
    found: "إعلانات موجودة",
    filtersActive: "عوامل التصفية نشطة",
    loadingMarketplace: "جارٍ تحميل إعلانات السوق...",
    noListings: "لم يتم العثور على إعلانات",
    noListingsDescription: "جرّب كلمة أخرى أو غيّر عوامل التصفية.",
    clearSearch: "مسح البحث",
    untitled: "إعلان بلا عنوان",
    noDescription: "لا يوجد وصف.",
    imageUnavailable: "صورة المنتج غير متاحة",
    viewListing: "عرض الإعلان",
    chatSeller: "مراسلة البائع",
    searchAcross: "البحث في BEST SALES GHANA",
    searchAcrossDescription: "ابحث في جميع إعلانات السوق.",
    priceOnRequest: "السعر عند الطلب",
    locationUnsupported: "هذا الجهاز لا يدعم تحديد الموقع.",
    locationDetected:
      "تم تحديد موقعك. اختر المنطقة والمدينة والحي لتصفية الإعلانات.",
    locationFailed: "تعذر تحديد موقعك.",
    priceRateUnavailable: "سعر الصرف غير متاح",
  },
  de: {
    searchMarketplace: "Marktplatz durchsuchen",
    searchDescription:
      "Finden Sie Produkte, Fahrzeuge, Immobilien, Maschinen, Ausrüstung und Dienstleistungen in Ghana.",
    postAd: "+ Anzeige aufgeben",
    searchProducts: "Produkte suchen",
    searchPlaceholder: "Drucker, Telefon, Auto, Ort...",
    category: "Kategorie",
    subcategory: "Unterkategorie",
    allCategories: "Alle Kategorien",
    allSubcategories: "Alle Unterkategorien",
    region: "Region",
    allGhana: "Ganz Ghana",
    cityTown: "Stadt / Ort",
    allCities: "Alle Städte / Orte",
    selectRegion: "Bitte zuerst Region auswählen",
    area: "Gebiet",
    allAreas: "Alle Gebiete",
    selectCity: "Bitte zuerst Stadt auswählen",
    search: "Suchen",
    clearFilters: "Filter löschen",
    detectLocation: "📍 Standort erkennen",
    listings: "Marktplatzangebote",
    loading: "Angebote werden geladen...",
    found: "Angebote gefunden",
    filtersActive: "Filter aktiv",
    loadingMarketplace: "Marktplatzangebote werden geladen...",
    noListings: "Keine Angebote gefunden",
    noListingsDescription:
      "Versuchen Sie einen anderen Suchbegriff oder andere Filter.",
    clearSearch: "Suche löschen",
    untitled: "Unbenanntes Angebot",
    noDescription: "Keine Beschreibung vorhanden.",
    imageUnavailable: "Produktbild nicht verfügbar",
    viewListing: "Angebot ansehen",
    chatSeller: "Verkäufer kontaktieren",
    searchAcross: "BEST SALES GHANA durchsuchen",
    searchAcrossDescription:
      "Finden Sie Angebote auf dem gesamten Marktplatz.",
    priceOnRequest: "Preis auf Anfrage",
    locationUnsupported:
      "Standorterkennung wird auf diesem Gerät nicht unterstützt.",
    locationDetected:
      "Standort erkannt. Wählen Sie Region, Stadt und Gebiet, um Angebote zu filtern.",
    locationFailed: "Standort konnte nicht erkannt werden.",
    priceRateUnavailable: "Wechselkurs nicht verfügbar",
  },
  it: {
    searchMarketplace: "Cerca nel marketplace",
    searchDescription:
      "Trova prodotti, veicoli, immobili, macchinari, attrezzature e servizi in Ghana.",
    postAd: "+ Pubblica annuncio",
    searchProducts: "Cerca prodotti",
    searchPlaceholder: "Stampante, telefono, auto, località...",
    category: "Categoria",
    subcategory: "Sottocategoria",
    allCategories: "Tutte le categorie",
    allSubcategories: "Tutte le sottocategorie",
    region: "Regione",
    allGhana: "Tutto il Ghana",
    cityTown: "Città / Località",
    allCities: "Tutte le città",
    selectRegion: "Seleziona prima una regione",
    area: "Zona",
    allAreas: "Tutte le zone",
    selectCity: "Seleziona prima una città",
    search: "Cerca",
    clearFilters: "Cancella filtri",
    detectLocation: "📍 Rileva posizione",
    listings: "Annunci del marketplace",
    loading: "Caricamento annunci...",
    found: "annunci trovati",
    filtersActive: "Filtri attivi",
    loadingMarketplace: "Caricamento annunci...",
    noListings: "Nessun annuncio trovato",
    noListingsDescription: "Prova un altro termine o modifica i filtri.",
    clearSearch: "Cancella ricerca",
    untitled: "Annuncio senza titolo",
    noDescription: "Nessuna descrizione.",
    imageUnavailable: "Immagine del prodotto non disponibile",
    viewListing: "Visualizza annuncio",
    chatSeller: "Contatta il venditore",
    searchAcross: "Cerca su BEST SALES GHANA",
    searchAcrossDescription:
      "Trova annunci in tutto il marketplace.",
    priceOnRequest: "Prezzo su richiesta",
    locationUnsupported:
      "Questo dispositivo non supporta il rilevamento della posizione.",
    locationDetected:
      "Posizione rilevata. Seleziona regione, città e zona per filtrare.",
    locationFailed: "Impossibile rilevare la posizione.",
    priceRateUnavailable: "Tasso di cambio non disponibile",
  },
  ja: {
    searchMarketplace: "マーケットプレイスを検索",
    searchDescription:
      "ガーナで商品、車両、不動産、機械、設備、サービスを探しましょう。",
    postAd: "+ 広告を投稿",
    searchProducts: "商品を検索",
    searchPlaceholder: "プリンター、携帯電話、車、場所...",
    category: "カテゴリー",
    subcategory: "サブカテゴリー",
    allCategories: "すべてのカテゴリー",
    allSubcategories: "すべてのサブカテゴリー",
    region: "地域",
    allGhana: "ガーナ全域",
    cityTown: "市 / 町",
    allCities: "すべての市 / 町",
    selectRegion: "先に地域を選択してください",
    area: "エリア",
    allAreas: "すべてのエリア",
    selectCity: "先に市を選択してください",
    search: "検索",
    clearFilters: "フィルターをクリア",
    detectLocation: "📍 位置を検出",
    listings: "商品一覧",
    loading: "商品を読み込み中...",
    found: "件の商品が見つかりました",
    filtersActive: "フィルター適用中",
    loadingMarketplace: "商品を読み込み中...",
    noListings: "商品が見つかりません",
    noListingsDescription:
      "別の検索語を試すか、フィルターを変更してください。",
    clearSearch: "検索をクリア",
    untitled: "タイトルなしの商品",
    noDescription: "説明はありません。",
    imageUnavailable: "商品画像を利用できません",
    viewListing: "商品を見る",
    chatSeller: "販売者に連絡",
    searchAcross: "BEST SALES GHANAを検索",
    searchAcrossDescription:
      "マーケットプレイス全体の商品を検索できます。",
    priceOnRequest: "価格はお問い合わせください",
    locationUnsupported: "この端末では位置情報を検出できません。",
    locationDetected:
      "位置を検出しました。地域、市、エリアを選択して商品を絞り込んでください。",
    locationFailed: "位置を検出できませんでした。",
    priceRateUnavailable: "為替レートを利用できません",
  },
  ko: {
    searchMarketplace: "마켓플레이스 검색",
    searchDescription:
      "가나에서 상품, 차량, 부동산, 기계, 장비 및 서비스를 찾아보세요.",
    postAd: "+ 광고 게시",
    searchProducts: "상품 검색",
    searchPlaceholder: "프린터, 휴대전화, 자동차, 위치...",
    category: "카테고리",
    subcategory: "하위 카테고리",
    allCategories: "모든 카테고리",
    allSubcategories: "모든 하위 카테고리",
    region: "지역",
    allGhana: "가나 전체",
    cityTown: "도시 / 마을",
    allCities: "모든 도시 / 마을",
    selectRegion: "먼저 지역을 선택하세요",
    area: "구역",
    allAreas: "모든 구역",
    selectCity: "먼저 도시를 선택하세요",
    search: "검색",
    clearFilters: "필터 지우기",
    detectLocation: "📍 위치 감지",
    listings: "마켓플레이스 상품",
    loading: "상품을 불러오는 중...",
    found: "개의 상품을 찾았습니다",
    filtersActive: "필터 적용 중",
    loadingMarketplace: "마켓플레이스 상품을 불러오는 중...",
    noListings: "상품을 찾을 수 없습니다",
    noListingsDescription:
      "다른 검색어를 입력하거나 필터를 변경해 보세요.",
    clearSearch: "검색 지우기",
    untitled: "제목 없는 상품",
    noDescription: "설명이 없습니다.",
    imageUnavailable: "상품 이미지를 사용할 수 없습니다",
    viewListing: "상품 보기",
    chatSeller: "판매자에게 문의",
    searchAcross: "BEST SALES GHANA 검색",
    searchAcrossDescription:
      "마켓플레이스 전체에서 상품을 찾아보세요.",
    priceOnRequest: "가격 문의",
    locationUnsupported:
      "이 기기에서는 위치 감지를 지원하지 않습니다.",
    locationDetected:
      "위치가 감지되었습니다. 지역, 도시 및 구역을 선택해 상품을 필터링하세요.",
    locationFailed: "위치를 감지할 수 없습니다.",
    priceRateUnavailable: "환율을 사용할 수 없습니다",
  },
};

const LOCALES: Record<string, string> = {
  en: "en-GH",
  fr: "fr-FR",
  zh: "zh-CN",
  es: "es-ES",
  pt: "pt-PT",
  ar: "ar",
  de: "de-DE",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
};

function formatListingPrice(
  price: number | null,
  sourceCurrency: string | null,
  selectedCurrency: string,
  rates: Partial<Record<string, number>>,
  language: string
) {
  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (price === null || !Number.isFinite(Number(price))) {
    return translations.priceOnRequest;
  }

  const source = (sourceCurrency || "GHS").toUpperCase();
  const target = selectedCurrency.toUpperCase();

  const sourceRate = rates[source];
  const targetRate = rates[target];

  if (
    typeof sourceRate !== "number" ||
    !Number.isFinite(sourceRate) ||
    sourceRate <= 0 ||
    typeof targetRate !== "number" ||
    !Number.isFinite(targetRate) ||
    targetRate <= 0
  ) {
    try {
      return new Intl.NumberFormat(LOCALES[language] || "en-GH", {
        style: "currency",
        currency: source,
        maximumFractionDigits: 2,
      }).format(Number(price));
    } catch {
      return `${source} ${Number(price).toLocaleString()}`;
    }
  }

  const amountInGhs = Number(price) / sourceRate;
  const convertedAmount = amountInGhs * targetRate;

  try {
    return new Intl.NumberFormat(LOCALES[language] || "en-GH", {
      style: "currency",
      currency: target,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  } catch {
    return `${target} ${convertedAmount.toFixed(2)}`;
  }
}

function normalise(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function listingMatchesCategory(listing: Listing, category: string) {
  if (!category || category === "All Categories") return true;

  const selected = normalise(category);

  if (
    normalise(listing.category) === selected ||
    normalise(listing.subcategory) === selected
  ) {
    return true;
  }

  const searchable = [
    listing.title,
    listing.description,
    listing.category,
    listing.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = CATEGORY_KEYWORDS[category] || [selected];

  return keywords.some((keyword) =>
    searchable.includes(keyword.toLowerCase())
  );
}

function promotionRank(packageId: string | null | undefined) {
  switch ((packageId || "").toLowerCase()) {
    case "top-priority":
      return 1;
    case "priority":
      return 2;
    case "premium":
      return 3;
    default:
      return 4;
  }
}

function promotionLabel(packageId: string) {
  switch (packageId.toLowerCase()) {
    case "top-priority":
      return "TOP PRIORITY";
    case "priority":
      return "PRIORITY";
    case "premium":
      return "PREMIUM";
    default:
      return "";
  }
}

function promotionStyle(packageId: string) {
  switch (packageId.toLowerCase()) {
    case "top-priority":
      return "bg-yellow-100 text-yellow-900";
    case "priority":
      return "bg-purple-100 text-purple-900";
    default:
      return "bg-sky-100 text-sky-900";
  }
}
