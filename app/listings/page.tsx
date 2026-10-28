"use client";

import Link from "next/link";
import LatestListings from "@/components/LatestListings";
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
    noListingsDescription:
      "Essayez un autre terme ou modifiez les filtres.",
    clearSearch: "Effacer la recherche",
    untitled: "Annonce sans titre",
    noDescription: "Aucune description fournie.",
    imageUnavailable: "Image du produit indisponible",
    viewListing: "Voir l'annonce",
    chatSeller: "Contacter le vendeur",
    searchAcross: "Rechercher sur BEST SALES GHANA",
    searchAcrossDescription:
      "Trouvez des annonces sur toute la marketplace.",
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
    noListingsDescription:
      "Prueba otro término o cambia los filtros.",
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
    locationDetected: "Se detectó tu ubicación. Selecciona región, ciudad y zona para filtrar.",
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
    locationDetected: "A sua localização foi detetada. Selecione região, cidade e área para filtrar.",
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
    locationDetected: "تم تحديد موقعك. اختر المنطقة والمدينة والحي لتصفية الإعلانات.",
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
    noListingsDescription: "Versuchen Sie einen anderen Suchbegriff oder andere Filter.",
    clearSearch: "Suche löschen",
    untitled: "Unbenanntes Angebot",
    noDescription: "Keine Beschreibung vorhanden.",
    imageUnavailable: "Produktbild nicht verfügbar",
    viewListing: "Angebot ansehen",
    chatSeller: "Verkäufer kontaktieren",
    searchAcross: "BEST SALES GHANA durchsuchen",
    searchAcrossDescription: "Finden Sie Angebote auf dem gesamten Marktplatz.",
    priceOnRequest: "Preis auf Anfrage",
    locationUnsupported: "Standorterkennung wird auf diesem Gerät nicht unterstützt.",
    locationDetected: "Standort erkannt. Wählen Sie Region, Stadt und Gebiet, um Angebote zu filtern.",
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
    searchAcrossDescription: "Trova annunci in tutto il marketplace.",
    priceOnRequest: "Prezzo su richiesta",
    locationUnsupported: "Questo dispositivo non supporta il rilevamento della posizione.",
    locationDetected: "Posizione rilevata. Seleziona regione, città e zona per filtrare.",
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
    noListingsDescription: "別の検索語を試すか、フィルターを変更してください。",
    clearSearch: "検索をクリア",
    untitled: "タイトルなしの商品",
    noDescription: "説明はありません。",
    imageUnavailable: "商品画像を利用できません",
    viewListing: "商品を見る",
    chatSeller: "販売者に連絡",
    searchAcross: "BEST SALES GHANAを検索",
    searchAcrossDescription: "マーケットプレイス全体の商品を検索できます。",
    priceOnRequest: "価格はお問い合わせください",
    locationUnsupported: "この端末では位置情報を検出できません。",
    locationDetected: "位置を検出しました。地域、市、エリアを選択して商品を絞り込んでください。",
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
    noListingsDescription: "다른 검색어를 입력하거나 필터를 변경해 보세요.",
    clearSearch: "검색 지우기",
    untitled: "제목 없는 상품",
    noDescription: "설명이 없습니다.",
    imageUnavailable: "상품 이미지를 사용할 수 없습니다",
    viewListing: "상품 보기",
    chatSeller: "판매자에게 문의",
    searchAcross: "BEST SALES GHANA 검색",
    searchAcrossDescription: "마켓플레이스 전체에서 상품을 찾아보세요.",
    priceOnRequest: "가격 문의",
    locationUnsupported: "이 기기에서는 위치 감지를 지원하지 않습니다.",
    locationDetected: "위치가 감지되었습니다. 지역, 도시 및 구역을 선택해 상품을 필터링하세요.",
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

  // Rates from /api/currencies are foreign currency units per GH₵1.
  // GHS is fixed at 1 by the existing currency API.
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
    // Never invent an exchange rate. Show the original amount instead.
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

export default function ListingsPage() {
  const { currency, language, rates } = useMarketPreferences();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === "ar";

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingImages, setListingImages] = useState<Record<number, string>>({});
  const [promotions, setPromotions] = useState<Record<number, Promotion>>({});
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [locations, setLocations] = useState<GhanaLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionWarning, setPromotionWarning] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subcategory, setSubcategory] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(
      params.get("q") ||
        params.get("search") ||
        params.get("query") ||
        ""
    );
    setCategory(params.get("category") || "All Categories");
    setSubcategory(params.get("subcategory") || "");
    setRegion(params.get("region") || "");
    setCity(params.get("city") || "");
    setArea(params.get("area") || "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setPromotionWarning("");

      try {
        const db = supabaseBrowser() as any;

        const [
          listingsResponse,
          regionsResponse,
          locationsResponse,
          promotionsResponse,
        ] = await Promise.all([
          db
            .from("listings")
            .select(`
              id,title,description,price,currency_code,currency,location,
              category,subcategory,seller_id,status,featured,created_at,
              item_region,item_city,item_area,item_ghana_post_gps,
              item_latitude,item_longitude
            `)
            .eq("status", "active")
            .order("created_at", { ascending: false }),

          db
            .from("ghana_regions")
            .select("id,name,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          db
            .from("ghana_locations")
            .select("id,region_id,name,location_type,parent_name,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          db
            .from("active_listing_promotions")
            .select("listing_id,package_id,promotion_rank,starts_at,ends_at"),
        ]);

        if (cancelled) return;

        if (listingsResponse.error) {
          console.error("Listings loading error:", listingsResponse.error);
        } else {
          setListings((listingsResponse.data || []) as Listing[]);
        }

        if (regionsResponse.error) {
          console.error("Regions loading error:", regionsResponse.error);
        } else {
          setRegions((regionsResponse.data || []) as GhanaRegion[]);
        }

        if (locationsResponse.error) {
          console.error("Locations loading error:", locationsResponse.error);
        } else {
          setLocations((locationsResponse.data || []) as GhanaLocation[]);
        }

        if (promotionsResponse.error) {
          console.error("Promotion loading error:", promotionsResponse.error);
          setPromotionWarning(
            "Promotional placements are temporarily unavailable. Listings are still shown."
          );
          setPromotions({});
        } else {
          const promotionMap: Record<number, Promotion> = {};

          for (const item of (promotionsResponse.data || []) as Promotion[]) {
            const id = Number(item.listing_id);
            if (!Number.isFinite(id)) continue;

            const existing = promotionMap[id];

            if (
              !existing ||
              promotionRank(item.package_id) <
                promotionRank(existing.package_id)
            ) {
              promotionMap[id] = item;
            }
          }

          setPromotions(promotionMap);
        }

        const loadedListings = (listingsResponse.data || []) as Listing[];
        const ids = loadedListings.map((listing) => listing.id);

        if (ids.length) {
          const imagesResponse = await db
            .from("listing_images")
            .select("listing_id,image_url")
            .in("listing_id", ids);

          if (cancelled) return;

          if (imagesResponse.error) {
            console.error(
              "Listing images loading error:",
              imagesResponse.error
            );
          } else {
            const imageMap: Record<number, string> = {};

            for (const image of (imagesResponse.data || []) as ListingImage[]) {
              const id = Number(image.listing_id);
              const url =
                typeof image.image_url === "string"
                  ? image.image_url.trim()
                  : "";

              if (Number.isFinite(id) && url && !imageMap[id]) {
                imageMap[id] = url;
              }
            }

            setListingImages(imageMap);
          }
        } else {
          setListingImages({});
        }
      } catch (error) {
        console.error("Marketplace loading error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);

  const regionLocations = useMemo(() => {
    const selected = regions.find((item) => item.name === region);

    return selected
      ? locations.filter((item) => item.region_id === selected.id)
      : [];
  }, [region, regions, locations]);

  const cities = useMemo(
    () =>
      regionLocations
        .filter(
          (item) =>
            item.location_type === "city" ||
            item.location_type === "town"
        )
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            a.name.localeCompare(b.name)
        ),
    [regionLocations]
  );

  const areas = useMemo(
    () =>
      city
        ? regionLocations
            .filter(
              (item) =>
                item.location_type === "area" &&
                item.parent_name === city
            )
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order ||
                a.name.localeCompare(b.name)
            )
        : [],
    [city, regionLocations]
  );

  const filteredListings = useMemo(() => {
    const q = normalise(search);

    return listings
      .filter((listing) => {
        const searchableText = [
          listing.title,
          listing.description,
          listing.category,
          listing.subcategory,
          listing.location,
          listing.item_region,
          listing.item_city,
          listing.item_area,
          listing.item_ghana_post_gps,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !q || searchableText.includes(q);
        const matchesCategory = listingMatchesCategory(listing, category);

        const matchesSubcategory =
          !subcategory ||
          normalise(listing.subcategory) === normalise(subcategory) ||
          normalise(listing.title).includes(normalise(subcategory));

        const oldLocation = normalise(listing.location);

        const matchesRegion =
          !region ||
          normalise(listing.item_region) === normalise(region) ||
          oldLocation.includes(normalise(region));

        const matchesCity =
          !city ||
          normalise(listing.item_city) === normalise(city) ||
          oldLocation.includes(normalise(city));

        const matchesArea =
          !area ||
          normalise(listing.item_area) === normalise(area) ||
          oldLocation.includes(normalise(area));

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSubcategory &&
          matchesRegion &&
          matchesCity &&
          matchesArea
        );
      })
      .sort((a, b) => {
        const aPromotion = promotions[a.id];
        const bPromotion = promotions[b.id];

        const aRank = aPromotion
          ? promotionRank(aPromotion.package_id)
          : 4;
        const bRank = bPromotion
          ? promotionRank(bPromotion.package_id)
          : 4;

        if (aRank !== bRank) return aRank - bRank;

        const aDate = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;
        const bDate = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return bDate - aDate;
      });
  }, [
    listings,
    promotions,
    search,
    category,
    subcategory,
    region,
    city,
    area,
  ]);

  function performSearch(event?: React.FormEvent) {
    event?.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("q", search.trim());
    if (category !== "All Categories") {
      params.set("category", category);
    }
    if (subcategory) params.set("subcategory", subcategory);
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (area) params.set("area", area);

    const query = params.toString();

    window.history.pushState(
      {},
      "",
      query ? `/listings?${query}` : "/listings"
    );
  }

  function clearFilters() {
    setSearch("");
    setCategory("All Categories");
    setSubcategory("");
    setRegion("");
    setCity("");
    setArea("");
    window.history.replaceState({}, "", "/listings");
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert(t.locationUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS coordinates:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        alert(t.locationDetected);
      },
      () => alert(t.locationFailed),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 text-gray-900"
    >
      <section className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/"
                className="text-sm font-semibold text-blue-100 hover:text-white"
              >
                ← BEST SALES GHANA
              </Link>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t.searchMarketplace}
              </h1>

              <p className="mt-2 max-w-2xl text-blue-100">
                {t.searchDescription}
              </p>
            </div>

            <Link
              href="/post-ad"
              className="inline-flex w-fit rounded-xl bg-white px-5 py-3 font-bold text-blue-800 shadow-lg hover:bg-blue-50"
            >
              {t.postAd}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form
          onSubmit={performSearch}
          className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-200"
        >
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.searchProducts}
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.category}
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item === "All Categories" ? t.allCategories : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.subcategory}
              </label>

              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                disabled={
                  category === "All Categories" ||
                  !SUBCATEGORY_OPTIONS[category]
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">{t.allSubcategories}</option>
                {(SUBCATEGORY_OPTIONS[category] || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.region}
              </label>

              <select
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setCity("");
                  setArea("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3"
              >
                <option value="">{t.allGhana}</option>
                {regions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.cityTown}
              </label>

              <select
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setArea("");
                }}
                disabled={!region}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">
                  {region ? t.allCities : t.selectRegion}
                </option>
                {cities.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t.area}
              </label>

              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                disabled={!city}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">
                  {city ? t.allAreas : t.selectCity}
                </option>
                {areas.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              🔍 {t.search}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t.clearFilters}
            </button>

            <button
              type="button"
              onClick={detectLocation}
              className="rounded-xl border border-sky-300 bg-sky-50 px-6 py-3 font-semibold text-sky-800 hover:bg-sky-100"
            >
              {t.detectLocation}
            </button>
          </div>
        </form>

        {promotionWarning && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            {promotionWarning}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t.listings}
            </h2>

            <p className="text-sm text-gray-600">
              {loading
                ? t.loading
                : `${filteredListings.length} ${t.found}`}
            </p>
          </div>

          {(search ||
            category !== "All Categories" ||
            subcategory ||
            region ||
            city ||
            area) && (
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
              {t.filtersActive}
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            <p className="mt-4 text-gray-600">
              {t.loadingMarketplace}
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              {t.noListings}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-gray-600">
              {t.noListingsDescription}
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              {t.clearSearch}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const imageUrl = listingImages[listing.id];
              const showImage =
                Boolean(imageUrl) && !imageErrors[listing.id];
              const promotion = promotions[listing.id];
              const label = promotion
                ? promotionLabel(promotion.package_id)
                : "";

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || t.untitled}
                        loading="lazy"
                        className="h-full w-full object-contain"
                        onError={() =>
                          setImageErrors((previous) => ({
                            ...previous,
                            [listing.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <span className="text-5xl">🛍️</span>
                        <span className="text-xs">
                          {t.imageUnavailable}
                        </span>
                      </div>
                    )}

                    {label && promotion && (
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${promotionStyle(
                          promotion.package_id
                        )}`}
                      >
                        {label}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-gray-900">
                      {listing.title || t.untitled}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {listing.description || t.noDescription}
                    </p>

                    <div className="mt-3 text-xl font-bold text-blue-700">
                      {formatListingPrice(
                        listing.price,
                        listing.currency_code || listing.currency,
                        currency,
                        rates,
                        language
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      {(listing.item_region ||
                        listing.item_city ||
                        listing.item_area ||
                        listing.location) && (
                        <div>
                          📍{" "}
                          {[
                            listing.item_area,
                            listing.item_city,
                            listing.item_region,
                          ]
                            .filter(Boolean)
                            .join(", ") || listing.location}
                        </div>
                      )}

                      {(listing.category || listing.subcategory) && (
                        <div>
                          🏷️{" "}
                          {[listing.category, listing.subcategory]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      )}

                      {listing.item_ghana_post_gps && (
                        <div className="break-words">
                          📮 GhanaPostGPS: {listing.item_ghana_post_gps}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="rounded-xl bg-blue-700 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        {t.viewListing}
                      </Link>

                      <Link
                        href={`/chat?listing=${listing.id}`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-sm font-bold text-blue-800 hover:bg-blue-100"
                      >
                        {t.chatSeller}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {t.searchAcross}
          </h2>

          <p className="mt-2 text-gray-600">
            {t.searchAcrossDescription}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.slice(1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setSubcategory("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
