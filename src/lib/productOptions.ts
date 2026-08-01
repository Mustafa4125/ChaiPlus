export interface ProductOptionsConfig {
  sizeLabel: string;
  sizeOptions: string[];
  extraLabel: string;
  extraOptions: string[];
  /** 'single' renders the extra group as a single-choice selector instead of a multi-toggle list. */
  extraSelectionMode: 'single' | 'multiple';
}

const DEFAULT_SIZE_OPTIONS = ['Küçük', 'Orta', 'Büyük'];
const DEFAULT_EXTRA_OPTIONS = ['Ekstra Süt', 'Ekstra Buz', 'Safran', 'Bal', 'Tarçın'];

const DEFAULT_OPTIONS: ProductOptionsConfig = {
  sizeLabel: 'Boyut Seçin',
  sizeOptions: DEFAULT_SIZE_OPTIONS,
  extraLabel: 'Ekstralar',
  extraOptions: DEFAULT_EXTRA_OPTIONS,
  extraSelectionMode: 'multiple',
};

// Per-product customization overrides for products with non-standard size/extra choices.
const PRODUCT_OPTIONS: Record<string, ProductOptionsConfig> = {
  çay: {
    sizeLabel: 'Bardak Seçin',
    sizeOptions: ['Normal Bardak', 'Fincan Bardak'],
    extraLabel: 'Demleme',
    extraOptions: ['Açık', 'Normal', 'Demli'],
    extraSelectionMode: 'single',
  },
  limonata: {
    sizeLabel: '',
    sizeOptions: [],
    extraLabel: 'Ekstralar',
    extraOptions: ['Ekstra Buz'],
    extraSelectionMode: 'multiple',
  },
  'limonlu soda': {
    sizeLabel: '',
    sizeOptions: [],
    extraLabel: 'Ekstralar',
    extraOptions: ['Ekstra Buz'],
    extraSelectionMode: 'multiple',
  },
  'elmalı soda': {
    sizeLabel: '',
    sizeOptions: [],
    extraLabel: 'Ekstralar',
    extraOptions: ['Ekstra Buz'],
    extraSelectionMode: 'multiple',
  },
  nescafe: {
    sizeLabel: '',
    sizeOptions: [],
    extraLabel: '',
    extraOptions: [],
    extraSelectionMode: 'multiple',
  },
  'türk kahvesi': {
    sizeLabel: 'Şeker Oranı Seçin',
    sizeOptions: ['Sade', 'Az Şekerli', 'Orta Şekerli', 'Çok Şekerli'],
    extraLabel: '',
    extraOptions: [],
    extraSelectionMode: 'multiple',
  },
};

export function getProductOptions(productName: string): ProductOptionsConfig {
  return PRODUCT_OPTIONS[productName.trim().toLowerCase()] ?? DEFAULT_OPTIONS;
}
