import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const outputDir = resolve(here, '../public')

function crc32(buffer) {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)

  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(
    crc32(Buffer.concat([typeBuffer, data])),
  )

  return Buffer.concat([
    length,
    typeBuffer,
    data,
    crcBuffer,
  ])
}

function encodePng(size, rgba) {
  const signature = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10,
  ])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rows = []
  for (let y = 0; y < size; y += 1) {
    rows.push(
      Buffer.concat([
        Buffer.from([0]),
        rgba.subarray(
          y * size * 4,
          (y + 1) * size * 4,
        ),
      ]),
    )
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND'),
  ])
}

function smoothstep(edge0, edge1, value) {
  const t = Math.min(
    1,
    Math.max(0, (value - edge0) / (edge1 - edge0)),
  )
  return t * t * (3 - 2 * t)
}

function blendPixel(buffer, index, color, alpha) {
  const currentAlpha = buffer[index + 3] / 255
  const nextAlpha = alpha + currentAlpha * (1 - alpha)

  if (nextAlpha <= 0) {
    return
  }

  for (let channel = 0; channel < 3; channel += 1) {
    buffer[index + channel] = Math.round(
      (
        color[channel] * alpha +
        buffer[index + channel] *
          currentAlpha *
          (1 - alpha)
      ) / nextAlpha,
    )
  }

  buffer[index + 3] = Math.round(nextAlpha * 255)
}

function createFocusIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const center = (size - 1) / 2
  const outerRadius = size * 0.46
  const ringRadius = size * 0.355
  const ringWidth = Math.max(1.6, size * 0.055)
  const coreRadius = size * 0.09

  const dark = [5, 13, 10]
  const green = [52, 211, 153]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - center
      const dy = y - center
      const distance = Math.sqrt(dx * dx + dy * dy)
      const index = (y * size + x) * 4

      const diskAlpha =
        1 - smoothstep(
          outerRadius - 1,
          outerRadius + 0.7,
          distance,
        )

      if (diskAlpha > 0) {
        blendPixel(
          pixels,
          index,
          dark,
          0.97 * diskAlpha,
        )
      }

      const ringDistance = Math.abs(
        distance - ringRadius,
      )
      const ringAlpha =
        1 - smoothstep(
          ringWidth * 0.45,
          ringWidth * 0.6,
          ringDistance,
        )

      if (ringAlpha > 0) {
        blendPixel(
          pixels,
          index,
          green,
          ringAlpha,
        )
      }

      const coreAlpha =
        1 - smoothstep(
          coreRadius - 0.7,
          coreRadius + 0.7,
          distance,
        )

      if (coreAlpha > 0) {
        blendPixel(
          pixels,
          index,
          green,
          coreAlpha,
        )
      }
    }
  }

  return encodePng(size, pixels)
}

await mkdir(outputDir, { recursive: true })

for (const size of [16, 32, 48, 128]) {
  await writeFile(
    resolve(outputDir, `focus-icon-${size}.png`),
    createFocusIcon(size),
  )
}
