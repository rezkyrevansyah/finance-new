import { useState } from 'react'

export function useRupiahInput(initialValue: number = 0) {
  const [displayValue, setDisplayValue] = useState(
    initialValue > 0 ? formatNumber(initialValue) : ''
  )
  const [numericValue, setNumericValue] = useState(initialValue)

  function formatNumber(value: number): string {
    return value.toLocaleString('id-ID')
  }

  function parseNumber(value: string): number {
    const cleaned = value.replace(/\./g, '')
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleChange = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')

    if (cleaned === '') {
      setDisplayValue('')
      setNumericValue(0)
      return
    }

    const parsed = parseInt(cleaned, 10)
    setNumericValue(parsed)
    setDisplayValue(formatNumber(parsed))
  }

  const setValue = (value: number) => {
    setNumericValue(value)
    setDisplayValue(value > 0 ? formatNumber(value) : '')
  }

  return {
    displayValue,
    numericValue,
    handleChange,
    setValue,
  }
}
