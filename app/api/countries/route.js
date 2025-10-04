import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch countries from REST Countries API
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,flag')
    const countries = await response.json()

    // Transform the data to a simpler format
    const formattedCountries = countries
      .map(country => ({
        name: country.name?.common || 'Unknown',
        currency: country.currencies ? Object.keys(country.currencies)[0] : 'USD',
        flag: country.flag || '🏳️'
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ countries: formattedCountries })

  } catch (error) {
    console.error('Countries API error:', error)
    // Return a fallback list of common countries
    const fallbackCountries = [
      { name: 'United States', currency: 'USD', flag: '🇺🇸' },
      { name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
      { name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
      { name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
      { name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
      { name: 'France', currency: 'EUR', flag: '🇫🇷' },
      { name: 'India', currency: 'INR', flag: '🇮🇳' },
      { name: 'Japan', currency: 'JPY', flag: '🇯🇵' }
    ]

    return NextResponse.json({ countries: fallbackCountries })
  }
}