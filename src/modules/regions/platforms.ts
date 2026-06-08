import { PlatformKey, BuyLink } from '@/lib/types'

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  blinkit:        'Blinkit',
  zepto:          'Zepto',
  bigbasket:      'BigBasket',
  swiggy_instamart: 'Swiggy Instamart',
  amazon_in:      'Amazon',
  amazon_us:      'Amazon',
  whole_foods:    'Whole Foods',
  instacart:      'Instacart'
}

const PLATFORM_SEARCH_TEMPLATES: Record<PlatformKey, string> = {
  blinkit:          'https://blinkit.com/s/?q={query}',
  zepto:            'https://www.zeptonow.com/search?query={query}',
  bigbasket:        'https://www.bigbasket.com/ps/?q={query}',
  swiggy_instamart: 'https://www.swiggy.com/instamart/search?query={query}',
  amazon_in:        'https://www.amazon.in/s?k={query}',
  amazon_us:        'https://www.amazon.com/s?k={query}',
  whole_foods:      'https://www.wholefoodsmarket.com/search?text={query}',
  instacart:        'https://www.instacart.com/store/s?k={query}'
}

export function buildBuyLinks(
  platformKeys: PlatformKey[],
  searchQuery: string
): BuyLink[] {
  const encoded = encodeURIComponent(searchQuery)

  return platformKeys.map(key => ({
    platform: key,
    label: `Buy on ${PLATFORM_LABELS[key]}`,
    url: PLATFORM_SEARCH_TEMPLATES[key].replace('{query}', encoded)
  }))
}