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
  }
]

export function getCityBySlug(slug: string): City | undefined {
  return SUPPORTED_CITIES.find(c => c.slug === slug)
}

export function getCitiesByRegion(regionCode: RegionCode): City[] {
  return SUPPORTED_CITIES.filter(c => c.regionCode === regionCode && c.isActive)
}