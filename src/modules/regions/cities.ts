import { City, RegionCode, PlatformKey } from '@/lib/types'

export const SUPPORTED_CITIES: City[] = [
  {
    id: '',                          // filled from DB at runtime
    regionCode: 'IN',
    name: 'Bangalore',
    state: 'Karnataka',
    slug: 'bangalore',
    isActive: true,
    platforms: ['blinkit', 'zepto', 'bigbasket', 'swiggy_instamart', 'amazon_in']
  },
  {
    id: '',
    regionCode: 'IN',
    name: 'Mumbai',
    state: 'Maharashtra',
    slug: 'mumbai',
    isActive: true,
    platforms: ['blinkit', 'zepto', 'bigbasket', 'swiggy_instamart', 'amazon_in']
  },
  {
    id: '',
    regionCode: 'IN',
    name: 'Delhi',
    state: 'Delhi',
    slug: 'delhi',
    isActive: true,
    platforms: ['blinkit', 'zepto', 'bigbasket', 'swiggy_instamart', 'amazon_in']
  },
  {
    id: '',
    regionCode: 'IN',
    name: 'Hyderabad',
    state: 'Telangana',
    slug: 'hyderabad',
    isActive: true,
    platforms: ['bigbasket', 'blinkit', 'swiggy_instamart', 'amazon_in']
  },
  {
    id: '',
    regionCode: 'IN',
    name: 'Pune',
    state: 'Maharashtra',
    slug: 'pune',
    isActive: true,
    platforms: ['zepto', 'blinkit', 'bigbasket', 'amazon_in']
  },
  {
    id: '',
    regionCode: 'IN',
    name: 'Chennai',
    state: 'Tamil Nadu',
    slug: 'chennai',
    isActive: true,
    platforms: ['bigbasket', 'swiggy_instamart', 'amazon_in']
  },
    // ─── USA ─────────────────────────────────────────────────
  {
    id: '',
    regionCode: 'US',
    name: 'San Francisco',
    state: 'California',
    slug: 'san-francisco',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'San Jose',
    state: 'California',
    slug: 'san-jose',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Oakland',
    state: 'California',
    slug: 'oakland',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'New York City',
    state: 'New York',
    slug: 'new-york-city',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Newark',
    state: 'New Jersey',
    slug: 'newark',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Jersey City',
    state: 'New Jersey',
    slug: 'jersey-city',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Atlanta',
    state: 'Georgia',
    slug: 'atlanta',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Houston',
    state: 'Texas',
    slug: 'houston',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Dallas',
    state: 'Texas',
    slug: 'dallas',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  },
  {
    id: '',
    regionCode: 'US',
    name: 'Austin',
    state: 'Texas',
    slug: 'austin',
    isActive: true,
    platforms: ['amazon_us', 'whole_foods', 'instacart']
  }
]

export function getCityBySlug(slug: string): City | undefined {
  return SUPPORTED_CITIES.find(c => c.slug === slug)
}

export function getCitiesByRegion(regionCode: RegionCode): City[] {
  return SUPPORTED_CITIES.filter(c => c.regionCode === regionCode && c.isActive)
}