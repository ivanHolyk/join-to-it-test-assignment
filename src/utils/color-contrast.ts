type RGB = { r: number; g: number; b: number }
type PickOptions = { prefer?: 'black' | 'white' | 'contrast'; minContrast?: number }
type PickResult = {
  color: '#000' | '#fff'
  meetsContrast: boolean
  contrastWithBlack: number
  contrastWithWhite: number
}

function hexToRgb(hex: string): RGB {
  hex = hex.replace('#', '').trim()
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  if (hex.length !== 6) throw new Error('Invalid hex color: ' + hex)
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

function rgbStringToRgb(str: string): RGB {
  const m = str.match(/rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)(?:[,\s]+([0-9.]+))?\s*\)/i)
  if (!m) throw new Error('Invalid rgb(a) string: ' + str)
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
}

function parseColor(input: string): RGB {
  input = input.trim()
  if (input.startsWith('#')) return hexToRgb(input)
  if (input.startsWith('rgb')) return rgbStringToRgb(input)
  throw new Error('Unsupported color format. Provide hex "#rrggbb" or "rgb(...)"')
}

function relativeLuminance({ r, g, b }: RGB): number {
  const srgb = [r, g, b].map((v) => v / 255)
  const lin = srgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrastRatio(l1: number, l2: number): number {
  const L1 = Math.max(l1, l2)
  const L2 = Math.min(l1, l2)
  return (L1 + 0.05) / (L2 + 0.05)
}

export function pickForegroundColor(
  bgColor: string,
  options: PickOptions = {},
): '#000' | '#fff' | PickResult {
  const pref = options.prefer ?? 'contrast'
  const rgb = parseColor(bgColor)
  const Lbg = relativeLuminance(rgb)
  const contrastWithBlack = contrastRatio(Lbg, 0)
  const contrastWithWhite = contrastRatio(1, Lbg)

  let color: '#000' | '#fff' = contrastWithBlack >= contrastWithWhite ? '#000' : '#fff'
  if (pref === 'black') color = '#000'
  if (pref === 'white') color = '#fff'

  if (options.minContrast) {
    return {
      color,
      meetsContrast: Math.max(contrastWithBlack, contrastWithWhite) >= options.minContrast,
      contrastWithBlack,
      contrastWithWhite,
    }
  }

  return color
}
