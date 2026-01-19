export type CsvRecord = Record<string, string>

export function parseCsv(text: string): CsvRecord[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    if (char === '\r') {
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (rows.length === 0) return []

  const headers = rows.shift() || []
  const cleanHeaders = headers.map((header) => header.replace(/^\uFEFF/, '').trim())

  return rows
    .filter((values) => values.some((value) => value && value.trim() !== ''))
    .map((values) => {
      const record: CsvRecord = {}
      cleanHeaders.forEach((header, index) => {
        record[header] = (values[index] || '').trim()
      })
      return record
    })
}
