export interface Price {
  price: number;
  size?: string;
}

export interface MenuItem {
  template: any;
  id: string;
  plu: string;
  name: string;
  description: string;
  a?: string;
  z?: string;
  s?: string;
  prices: Price[];
}

export interface STemplate {
  id: string;
  s: string;
  a: string;
  z: string;
}

export interface Typography {
  fontFamily: string | undefined;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  transform?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  showPlu?: boolean;
  showDescriptions?: boolean;
  forcePageBreak?: boolean;
  descriptionPosition?: 'above' | 'below';  // Add this line
  styles?: SectionStyles;
  type?: 'regular' | 'image';
  imageUrl?: string;
  fillPage?: boolean;  // Add this line for full-page images
}

export interface MenuStyles {
  font?: string;
  primaryFont?: string;
  secondaryFont?: string;
  sectionTitle: Typography;
  plu: Typography;
  itemName: Typography;
  description: Typography;
  price: Typography;
  letterA: {
    fontSize: string;
  };
}

export interface SectionStyles {
  sectionTitle?: Typography;
  plu?: Typography;
  itemName?: Typography;
  description?: Typography;
  price?: Typography;
}

export interface BaseSection {
  id: string;
  type: 'regular' | 'image';
  forcePageBreak?: boolean;
}

export interface RegularSection extends BaseSection {
  type: 'regular';
  name: string;
  showPlu: boolean;
  items: MenuItem[];
  description?: string;
  showDescriptions?: boolean;
  styles?: SectionStyles;
}

export interface ImageSection extends BaseSection {
  name: string;
  type: 'image';
  imageUrl: string;
}

export type Section = RegularSection | ImageSection;

export interface MenuData {
  background: string;
  styles: MenuStyles;
  restaurantName: string;
  showRestaurantName: boolean;
  sections: Section[];
}

export interface CoverPage {
  headline?: string;
  subtitle?: string;
  couponImage?: string;
  text?: string;
}

export interface MenuData {
  restaurantName: string;
  showRestaurantName?: boolean;
  customLogo?: string;  // Added field for custom logo URL/base64
  sections: MenuSection[];
  styles: MenuStyles;
  coverPage?: CoverPage;
}

export interface RawMenuData {
  [key: string]: {
    plu: string;
    article: string;
    description: string;
    prices: Price[];
  }[];
}

export const TEXT_TRANSFORMS = [
  { label: 'None', value: '' },
  { label: 'Uppercase', value: 'uppercase' },
  { label: 'Lowercase', value: 'lowercase' },
  { label: 'Capitalize', value: 'capitalize' },
] as const;

export const FONT_SIZES = [
  { label: 'XS', value: 'text-xs' },
  { label: 'SM', value: 'text-sm' },
  { label: 'Base', value: 'text-base' },
  { label: 'Base+', value: 'text-[1.075rem]' },
  { label: 'MD', value: 'text-[1.15rem]' },
  { label: 'MD+', value: 'text-[1.225rem]' },
  { label: 'LG', value: 'text-lg' },
  { label: 'XL', value: 'text-xl' },
  { label: '2XL', value: 'text-2xl' },
  { label: '3XL', value: 'text-3xl' },
  { label: '4XL', value: 'text-4xl' },
  { label: '5XL', value: 'text-5xl' },
  { label: '6XL', value: 'text-6xl' },
  { label: '7XL', value: 'text-7xl' },
  { label: '8XL', value: 'text-8xl' },
  { label: '9XL', value: 'text-9xl' },
] as const;

export const LETTER_A_SIZES = [
  { label: '24pt', value: '24pt' },
  { label: '30pt', value: '30pt' },
  { label: '36pt', value: '36pt' },
  { label: '42pt', value: '42pt' },
  { label: '48pt', value: '48pt' },
  { label: '54pt', value: '54pt' },
  { label: '60pt', value: '60pt' },
  { label: '66pt', value: '66pt' },
  { label: '72pt', value: '72pt' },
  { label: '78pt', value: '78pt' },
  { label: '84pt', value: '84pt' },
  { label: '90pt', value: '90pt' },
] as const;

export const FONT_WEIGHTS = [
  { label: 'Light', value: 'font-light' },
  { label: 'Normal', value: 'font-normal' },
  { label: 'Medium', value: 'font-medium' },
  { label: 'Semibold', value: 'font-semibold' },
  { label: 'Bold', value: 'font-bold' },
] as const;

export const LINE_HEIGHTS = [
  { label: 'None', value: 'leading-none' },
  { label: 'Tighter', value: 'leading-[0.5]' },
  { label: 'Tight', value: 'leading-tight' },
  { label: 'Snug', value: 'leading-snug' },
  { label: 'Normal', value: 'leading-normal' },
  { label: 'Relaxed', value: 'leading-relaxed' },
  { label: 'Loose', value: 'leading-loose' },
  { label: '1.5x', value: 'leading-[1.5]' },
  { label: '2x', value: 'leading-[2]' },
  { label: '2.5x', value: 'leading-[2.5]' },
  { label: '3x', value: 'leading-[3]' },
  { label: '4x', value: 'leading-[4]' },
  { label: '5x', value: 'leading-[5]' }
] as const;

export const LETTER_SPACING = [
  { label: 'Tighter', value: 'tracking-tighter' },
  { label: 'Tight', value: 'tracking-tight' },
  { label: 'Normal', value: 'tracking-normal' },
  { label: 'Wide', value: 'tracking-wide' },
  { label: 'Wider', value: 'tracking-wider' },
  { label: 'Widest', value: 'tracking-widest' },
  { label: '-0.05em', value: 'tracking-[-0.05em]' },
  { label: '-0.025em', value: 'tracking-[-0.025em]' },
  { label: '-0.0125em', value: 'tracking-[-0.0125em]' },
] as const;

export const AVAILABLE_FONTS = [
  { name: 'Default', value: '' },
  { name: 'Great Vibes', value: 'Great Vibes', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' },
  { name: 'Playfair Display', value: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
  { name: 'Lora', value: 'Lora', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap' },
  { name: 'Source Serif Pro', value: 'Source Serif Pro', url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@300;400;600;700&display=swap' },
  { name: 'Crimson Pro', value: 'Crimson Pro', url: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&display=swap' }
];