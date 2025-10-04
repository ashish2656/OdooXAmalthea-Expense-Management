// Exchange rate utility functions

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || 'demo-key'

// Get exchange rate from external API
export async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1

  try {
    // Using exchangerate-api.com (free tier available)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()
    return data.rates[toCurrency] || 1
  } catch (error) {
    console.error('Exchange rate API error:', error)
    // Fallback rates (should be updated regularly in production)
    const fallbackRates = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-INR': 83.0,
      'EUR-USD': 1.18,
      'EUR-GBP': 0.86,
      'GBP-USD': 1.37,
      'GBP-EUR': 1.16,
      'INR-USD': 0.012,
    }
    
    const key = `${fromCurrency}-${toCurrency}`
    return fallbackRates[key] || 1
  }
}

// Convert amount to company currency
export async function convertToCompanyCurrency(amount, fromCurrency, companyCurrency) {
  if (fromCurrency === companyCurrency) {
    return parseFloat(amount)
  }

  const rate = await getExchangeRate(fromCurrency, companyCurrency)
  return parseFloat(amount) * rate
}