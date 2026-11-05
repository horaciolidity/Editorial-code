import zlib from 'zlib';

interface ZipEntry {
  name: string;
  data: Buffer;
  store?: boolean;
}

// Standard CRC32 table for ZIP
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const rawData = entry.data;
    const crc = crc32(rawData);
    const compressed = entry.store ? rawData : zlib.deflateRawSync(rawData);
    const method = entry.store ? 0 : 8;

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 flag
    localHeader.writeUInt16LE(method, 8); // compression method
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0x5421, 12); // mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra len

    localParts.push(localHeader, nameBuf, compressed);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x5421, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(rawData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function markdownToXhtmlParagraphs(md: string): string {
  const lines = (md || '').split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      out.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith('> ')) {
      out.push(`<blockquote><p>${escapeHtml(trimmed.slice(2))}</p></blockquote>`);
    } else {
      const formatted = escapeHtml(trimmed)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      out.push(`<p>${formatted}</p>`);
    }
  }
  return out.join('\n    ');
}

export function buildEpubBuffer(project: any, chapters: any[]): Buffer {
  const bookId = `urn:uuid:${project.id || 'editorial-code-book'}`;
  const title = escapeHtml(project.title || 'Libro sin título');
  const subtitle = escapeHtml(project.subtitle || '');
  const author = escapeHtml(project.authorName || 'Autor');
  const lang = escapeHtml(project.language || 'es');
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const entries: ZipEntry[] = [];

  // 1. mimetype (must be first and uncompressed)
  entries.push({
    name: 'mimetype',
    data: Buffer.from('application/epub+zip', 'utf8'),
    store: true
  });

  // 2. META-INF/container.xml
  entries.push({
    name: 'META-INF/container.xml',
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
      'utf8'
    )
  });

  // 3. OEBPS/styles.css
  entries.push({
    name: 'OEBPS/styles.css',
    data: Buffer.from(
      `body { font-family: Georgia, serif; line-height: 1.65; margin: 5%; color: #1a1a1a; }
h1, h2, h3 { font-family: Georgia, serif; color: #111; margin-top: 1.5em; }
p { text-indent: 1.2em; margin: 0.4em 0; text-align: justify; }
blockquote { margin: 1em 1.5em; font-style: italic; color: #444; }
.title-page { text-align: center; margin-top: 20%; }`,
      'utf8'
    )
  });

  // 4. Title Page XHTML
  entries.push({
    name: 'OEBPS/title.xhtml',
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">
<head>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="title-page">
    <h1>${title}</h1>
    ${subtitle ? `<h3>${subtitle}</h3>` : ''}
    <p style="text-indent:0; text-align:center; margin-top:2em;"><strong>${author}</strong></p>
  </div>
</body>
</html>`,
      'utf8'
    )
  });

  // 5. Chapter XHTML files
  const manifestItems: string[] = [
    `<item id="css" href="styles.css" media-type="text/css"/>`,
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>`
  ];
  const spineItems: string[] = [`<itemref idref="title"/>`];
  const navLinks: string[] = [`<li><a href="title.xhtml">Portada Interior</a></li>`];

  chapters.forEach((ch, idx) => {
    const chFile = `chapter_${idx + 1}.xhtml`;
    const chId = `ch${idx + 1}`;
    const chTitle = escapeHtml(ch.name || `Capítulo ${idx + 1}`);
    const bodyHtml = markdownToXhtmlParagraphs(ch.content || '');

    entries.push({
      name: `OEBPS/${chFile}`,
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">
<head>
  <title>${chTitle}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <section>
    ${bodyHtml || `<h1>${chTitle}</h1>`}
  </section>
</body>
</html>`,
        'utf8'
      )
    });

    manifestItems.push(`<item id="${chId}" href="${chFile}" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${chId}"/>`);
    navLinks.push(`<li><a href="${chFile}">${chTitle}</a></li>`);
  });

  // 6. OEBPS/nav.xhtml
  entries.push({
    name: 'OEBPS/nav.xhtml',
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}">
<head>
  <title>Índice</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Índice de Contenidos</h1>
    <ol>
      ${navLinks.join('\n      ')}
    </ol>
  </nav>
</body>
</html>`,
      'utf8'
    )
  });

  // 7. OEBPS/content.opf
  entries.push({
    name: 'OEBPS/content.opf',
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${lang}</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`,
      'utf8'
    )
  });

  return buildZip(entries);
}
