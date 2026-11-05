// Procedural & AI-guided Editorial Artwork & Cover Generator
// Generates crisp, high-resolution SVG data URLs tailored to genre, title, author, and scene prompts.

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

const GENRE_PALETTES: Record<string, { bg1: string; bg2: string; accent: string; text: string; subtext: string }> = {
  terror_misterio: { bg1: '#090b12', bg2: '#1b1226', accent: '#e11d48', text: '#f8fafc', subtext: '#fda4af' },
  fantasia_scifi: { bg1: '#070b19', bg2: '#162044', accent: '#38bdf8', text: '#f0f9ff', subtext: '#7dd3fc' },
  romance: { bg1: '#1a0b16', bg2: '#3b122b', accent: '#f472b6', text: '#fdf2f8', subtext: '#fbcfe8' },
  infantil_juvenil: { bg1: '#0c192c', bg2: '#1d3557', accent: '#fbbf24', text: '#fefce8', subtext: '#fde68a' },
  ensayo_investigacion: { bg1: '#0f172a', bg2: '#1e293b', accent: '#a78bfa', text: '#f8fafc', subtext: '#cbd5e1' },
  tecnico_educativo: { bg1: '#09111e', bg2: '#0f2537', accent: '#10b981', text: '#ecfdf5', subtext: '#6ee7b7' },
  manual_guia: { bg1: '#111827', bg2: '#1f2937', accent: '#f59e0b', text: '#f9fafb', subtext: '#fcd34d' },
  biografia_historia: { bg1: '#18120e', bg2: '#2c2018', accent: '#d97706', text: '#fef3c7', subtext: '#fcd34d' },
  default: { bg1: '#0d101a', bg2: '#1e1b38', accent: '#8b5cf6', text: '#f8fafc', subtext: '#c4b5fd' }
};

export function generateCoverArtwork(params: {
  title: string;
  subtitle?: string;
  authorName?: string;
  genre?: string;
  bookType?: string;
  isBackCover?: boolean;
  synopsis?: string;
  seed?: number;
}): string {
  const palette = GENRE_PALETTES[params.genre || 'default'] || GENRE_PALETTES.default;
  const seed = params.seed || Date.now();
  const titleLines = wrapText(params.title || 'Obra Editorial', 18, 4);
  const subLines = wrapText(params.subtitle || '', 34, 2);
  const author = escapeXml(params.authorName || 'Autor');
  const typeLabel = escapeXml((params.bookType || 'novela').toUpperCase().replace('_', ' '));

  const cx1 = 150 + (seed % 300);
  const cy1 = 220 + ((seed >> 3) % 350);
  const r1 = 140 + ((seed >> 5) % 120);

  if (params.isBackCover) {
    const synLines = wrapText(
      params.synopsis || 'Una obra original creada y maquetada en Editorial Code.',
      44,
      8
    );

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg2}" />
          <stop offset="100%" stop-color="${palette.bg1}" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg)" />
      <rect x="36" y="36" width="528" height="828" fill="none" stroke="${palette.accent}" stroke-opacity="0.35" stroke-width="1.5" />
      <text x="64" y="100" font-family="Georgia, serif" font-size="14" letter-spacing="4" fill="${palette.accent}" font-weight="bold">SINOPSIS</text>
      <line x1="64" y1="116" x2="180" y2="116" stroke="${palette.accent}" stroke-width="2" />
      ${synLines
        .map(
          (line, idx) =>
            `<text x="64" y="${160 + idx * 30}" font-family="Georgia, serif" font-size="18" fill="${palette.text}" fill-opacity="0.9">${escapeXml(line)}</text>`
        )
        .join('\n      ')}
      <rect x="64" y="720" width="220" height="90" rx="6" fill="#ffffff" fill-opacity="0.95" />
      <g fill="#0f172a">
        <rect x="80" y="736" width="3" height="50" />
        <rect x="87" y="736" width="1" height="50" />
        <rect x="92" y="736" width="4" height="50" />
        <rect x="100" y="736" width="2" height="50" />
        <rect x="106" y="736" width="5" height="50" />
        <rect x="115" y="736" width="2" height="50" />
        <rect x="122" y="736" width="3" height="50" />
        <rect x="130" y="736" width="1" height="50" />
        <rect x="136" y="736" width="4" height="50" />
        <rect x="145" y="736" width="2" height="50" />
        <rect x="152" y="736" width="5" height="50" />
        <rect x="162" y="736" width="2" height="50" />
        <rect x="169" y="736" width="3" height="50" />
        <rect x="177" y="736" width="4" height="50" />
        <rect x="186" y="736" width="2" height="50" />
        <rect x="193" y="736" width="3" height="50" />
        <rect x="201" y="736" width="1" height="50" />
        <rect x="207" y="736" width="4" height="50" />
        <rect x="216" y="736" width="2" height="50" />
        <rect x="223" y="736" width="5" height="50" />
        <rect x="233" y="736" width="2" height="50" />
        <rect x="240" y="736" width="3" height="50" />
        <rect x="248" y="736" width="4" height="50" />
        <rect x="257" y="736" width="2" height="50" />
        <rect x="264" y="736" width="3" height="50" />
        <text x="80" y="800" font-family="monospace" font-size="11" fill="#0f172a">ISBN 978-84-0000-000-0</text>
      </g>
      <text x="536" y="795" text-anchor="end" font-family="sans-serif" font-size="13" letter-spacing="2" fill="${palette.subtext}">EDITORIAL CODE</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="100%" stop-color="${palette.bg2}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.45" />
        <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="600" height="900" fill="url(#bg)" />
    <circle cx="${cx1}" cy="${cy1}" r="${r1 * 1.6}" fill="url(#glow)" />
    <circle cx="${cx1}" cy="${cy1}" r="${r1}" fill="none" stroke="${palette.accent}" stroke-opacity="0.45" stroke-width="2" />
    <circle cx="${cx1}" cy="${cy1}" r="${Math.round(r1 * 0.72)}" fill="none" stroke="${palette.subtext}" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="6 6" />
    <rect x="32" y="32" width="536" height="836" fill="none" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="1.5" />
    <text x="300" y="96" text-anchor="middle" font-family="sans-serif" font-size="13" letter-spacing="5" fill="${palette.accent}" font-weight="bold">${typeLabel}</text>
    <line x1="220" y1="114" x2="380" y2="114" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.7" />
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="300" y="${260 + idx * 58}" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-weight="bold" fill="${palette.text}">${escapeXml(line)}</text>`
      )
      .join('\n    ')}
    ${subLines
      .map(
        (line, idx) =>
          `<text x="300" y="${520 + idx * 28}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="20" fill="${palette.subtext}">${escapeXml(line)}</text>`
      )
      .join('\n    ')}
    <line x1="180" y1="770" x2="420" y2="770" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6" />
    <text x="300" y="815" text-anchor="middle" font-family="sans-serif" font-size="20" letter-spacing="4" fill="${palette.text}" font-weight="600">${author.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

export function generateIllustrationArtwork(params: {
  title: string;
  prompt: string;
  type: string;
  genre?: string;
  bookType?: string;
  dialogue?: string;
  seed?: number;
}): string {
  const palette = GENRE_PALETTES[params.genre || 'default'] || GENRE_PALETTES.default;
  const seed = params.seed || Date.now();
  const title = escapeXml(params.title || 'Ilustración');
  const typeLabel = escapeXml((params.type || 'interior').toUpperCase());
  const promptLines = wrapText(params.prompt || '', 46, 2);

  if (params.bookType === 'comic') {
    const d1 = escapeXml((params.dialogue || '¡Algo se mueve en las sombras!').slice(0, 34));
    const d2 = escapeXml('No podemos detenernos ahora.');
    const cap1 = escapeXml((params.title || 'PÁGINA DE CÓMIC').slice(0, 38).toUpperCase());
    const cap2 = escapeXml((params.prompt || 'La tensión aumenta en cada viñeta...').slice(0, 44));

    const comicSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <linearGradient id="cBg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg1}" />
          <stop offset="100%" stop-color="${palette.bg2}" />
        </linearGradient>
        <linearGradient id="cBg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg2}" />
          <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.35" />
        </linearGradient>
      </defs>
      <!-- Comic Page Paper -->
      <rect width="800" height="1000" fill="#0b0e16" />
      <rect x="16" y="16" width="768" height="968" fill="#111624" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.45" />

      <!-- VIÑETA 1: Plano General / Escenario -->
      <g>
        <rect x="32" y="32" width="360" height="440" fill="url(#cBg1)" stroke="#ffffff" stroke-width="4" />
        <!-- Siluetas de edificios / montañas -->
        <polygon points="32,472 32,310 95,270 150,330 225,240 300,305 392,260 392,472" fill="#06080f" fill-opacity="0.85" />
        <circle cx="310" cy="145" r="46" fill="${palette.accent}" fill-opacity="0.75" />
        <!-- Cartucho narrativo -->
        <rect x="44" y="44" width="336" height="36" fill="#fef08a" stroke="#000000" stroke-width="2.5" />
        <text x="54" y="67" font-family="sans-serif" font-size="13" font-weight="bold" fill="#090d16">${cap1}</text>
      </g>

      <!-- VIÑETA 2: Primer Plano Personaje + Globo de Diálogo -->
      <g>
        <rect x="408" y="32" width="360" height="440" fill="url(#cBg2)" stroke="#ffffff" stroke-width="4" />
        <!-- Silueta personaje -->
        <circle cx="588" cy="255" r="64" fill="#070a12" />
        <path d="M475,472 C475,360 520,330 588,330 C656,330 701,360 701,472 Z" fill="#070a12" />
        <circle cx="568" cy="245" r="6" fill="${palette.accent}" />
        <circle cx="608" cy="245" r="6" fill="${palette.accent}" />
        <!-- Globo de diálogo -->
        <rect x="424" y="52" width="328" height="68" rx="22" fill="#ffffff" stroke="#000000" stroke-width="3" />
        <polygon points="550,120 575,120 560,152" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
        <text x="588" y="91" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#090d16">"${d1}"</text>
      </g>

      <!-- VIÑETA 3: Acción y Líneas de Velocidad -->
      <g>
        <rect x="32" y="488" width="360" height="464" fill="url(#cBg1)" stroke="#ffffff" stroke-width="4" />
        <!-- Líneas de acción -->
        <line x1="32" y1="540" x2="392" y2="620" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.5" />
        <line x1="32" y1="680" x2="392" y2="640" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.4" />
        <line x1="32" y1="820" x2="392" y2="710" stroke="${palette.subtext}" stroke-width="1.5" stroke-opacity="0.4" />
        <!-- Figura en movimiento -->
        <polygon points="140,952 195,710 265,730 235,952" fill="#06080f" />
        <circle cx="225" cy="675" r="38" fill="#06080f" />
        <!-- Globo de diálogo 2 -->
        <rect x="52" y="510" width="290" height="58" rx="18" fill="#ffffff" stroke="#000000" stroke-width="3" />
        <text x="197" y="544" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#090d16">"${d2}"</text>
      </g>

      <!-- VIÑETA 4: Clímax / Cierre de Página -->
      <g>
        <rect x="408" y="488" width="360" height="464" fill="url(#cBg2)" stroke="#ffffff" stroke-width="4" />
        <circle cx="588" cy="700" r="115" fill="${palette.accent}" fill-opacity="0.28" />
        <polygon points="520,952 588,640 656,952" fill="#06080f" />
        <!-- Cartucho inferior -->
        <rect x="424" y="882" width="328" height="54" fill="#fef08a" stroke="#000000" stroke-width="2.5" />
        <text x="436" y="914" font-family="sans-serif" font-size="12" font-weight="bold" fill="#090d16">${cap2}</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;base64,${Buffer.from(comicSvg, 'utf8').toString('base64')}`;
  }

  const x1 = 160 + (seed % 420);
  const y1 = 120 + ((seed >> 4) % 160);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
    <defs>
      <linearGradient id="illBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="100%" stop-color="${palette.bg2}" />
      </linearGradient>
      <radialGradient id="illGlow" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="800" height="520" fill="url(#illBg)" />
    <circle cx="${x1}" cy="${y1}" r="210" fill="url(#illGlow)" />
    <!-- Horizonte escénico -->
    <polygon points="0,400 0,290 130,245 260,310 410,215 560,295 700,235 800,280 800,400" fill="#070a12" fill-opacity="0.72" />
    <!-- Silueta central narrativa -->
    <circle cx="400" cy="245" r="28" fill="#05070c" />
    <path d="M352,400 C352,315 372,285 400,285 C428,285 448,315 448,400 Z" fill="#05070c" />
    <rect x="24" y="24" width="752" height="472" fill="none" stroke="${palette.accent}" stroke-opacity="0.35" stroke-width="1.5" />
    <rect x="24" y="396" width="752" height="100" fill="#05070c" fill-opacity="0.86" />
    <text x="48" y="428" font-family="monospace" font-size="12" letter-spacing="3" fill="${palette.accent}" font-weight="bold">${typeLabel} • ${title.toUpperCase()}</text>
    ${promptLines
      .map(
        (line, idx) =>
          `<text x="48" y="${452 + idx * 20}" font-family="Georgia, serif" font-size="14" fill="${palette.text}" fill-opacity="0.9">${escapeXml(line)}</text>`
      )
      .join('\n    ')}
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}
