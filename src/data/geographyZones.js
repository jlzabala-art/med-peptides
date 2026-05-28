export const MULTI_ZONE_COUNTRIES = [
  {
    id: 'AE',
    name: 'United Arab Emirates',
    zones: [
      'Abu Dhabi',
      'Dubai',
      'Sharjah',
      'Ajman',
      'Umm Al Quwain',
      'Ras Al Khaimah',
      'Fujairah'
    ]
  },
  {
    id: 'ES',
    name: 'Spain',
    zones: [
      'Andalusia',
      'Aragon',
      'Asturias',
      'Balearic Islands',
      'Basque Country',
      'Canary Islands',
      'Cantabria',
      'Castile and León',
      'Castilla-La Mancha',
      'Catalonia',
      'Extremadura',
      'Galicia',
      'La Rioja',
      'Madrid',
      'Murcia',
      'Navarre',
      'Valencia',
      'Ceuta',
      'Melilla'
    ]
  },
  {
    id: 'US',
    name: 'United States',
    zones: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
      'Wisconsin', 'Wyoming'
    ]
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    zones: [
      'England',
      'Scotland',
      'Wales',
      'Northern Ireland'
    ]
  },
  {
    id: 'CA',
    name: 'Canada',
    zones: [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Nova Scotia',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Northwest Territories',
      'Nunavut',
      'Yukon'
    ]
  },
  {
    id: 'AU',
    name: 'Australia',
    zones: [
      'New South Wales',
      'Victoria',
      'Queensland',
      'Western Australia',
      'South Australia',
      'Tasmania',
      'Australian Capital Territory',
      'Northern Territory'
    ]
  }
];

export const OTHER_COUNTRIES = [
  { id: 'FR', name: 'France' },
  { id: 'DE', name: 'Germany' },
  { id: 'IT', name: 'Italy' },
  { id: 'PT', name: 'Portugal' },
  { id: 'MX', name: 'Mexico' },
  { id: 'SA', name: 'Saudi Arabia' },
  { id: 'QA', name: 'Qatar' },
  { id: 'KW', name: 'Kuwait' },
  { id: 'BH', name: 'Bahrain' },
  { id: 'OM', name: 'Oman' },
  { id: 'GLOBAL', name: 'Global / Multi-National' }
];

export const getAllCountries = () => {
  return [...MULTI_ZONE_COUNTRIES, ...OTHER_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
};

export const getZonesForCountry = (countryId) => {
  const country = MULTI_ZONE_COUNTRIES.find(c => c.id === countryId);
  return country ? country.zones : null;
};
