export interface DesignTemplate {
  id: string;
  name: string;
  category: 'book' | 'comic_manga' | 'cover';
  description: string;
  palette: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    border: string;
  };
  fontFamily: string;
  chapterTitleStyle: 'classic_centered' | 'modern_left' | 'ornate_fantasy' | 'comic_banner' | 'minimal_number';
  imagePlacement: 'top' | 'inline' | 'full_bleed' | 'side_by_side';
  decorativeStyle: 'none' | 'minimal_line' | 'ornate_frame' | 'comic_gutter' | 'storybook_border';
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // ---------------- BOOK DESIGNS (7) ---------------- //
  {
    id: 'modern_minimalist',
    name: 'Modern Minimalist',
    category: 'book',
    description: 'Líneas limpias, amplios márgenes y tipografía sans-serif contemporánea.',
    palette: { bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', accent: '#6366f1', border: '#e2e8f0' },
    fontFamily: 'Inter, system-ui, sans-serif',
    chapterTitleStyle: 'minimal_number',
    imagePlacement: 'top',
    decorativeStyle: 'minimal_line'
  },
  {
    id: 'premium_editorial',
    name: 'Premium Editorial',
    category: 'book',
    description: 'Papel crema cálido, serif clásico y capitulares de alta edición literaria.',
    palette: { bg: '#fbf8f1', surface: '#f3ede0', text: '#1c1917', accent: '#9a3412', border: '#d6cfc2' },
    fontFamily: 'Georgia, Cambria, serif',
    chapterTitleStyle: 'classic_centered',
    imagePlacement: 'inline',
    decorativeStyle: 'minimal_line'
  },
  {
    id: 'fantasy_illustrated',
    name: 'Fantasy Illustrated',
    category: 'book',
    description: 'Marcos ornamentales, tonos pergamino oscuro y encabezados épicos.',
    palette: { bg: '#13111c', surface: '#1c1829', text: '#ede9fe', accent: '#f59e0b', border: '#4c1d95' },
    fontFamily: 'Georgia, serif',
    chapterTitleStyle: 'ornate_fantasy',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'ornate_frame'
  },
  {
    id: 'vintage_classic',
    name: 'Vintage & Classic',
    category: 'book',
    description: 'Estética de imprenta clásica del siglo XIX con tinta sepia y filetes.',
    palette: { bg: '#f4ecd8', surface: '#e9dec4', text: '#2c221e', accent: '#7c2d12', border: '#b8a68e' },
    fontFamily: 'Palatino, Georgia, serif',
    chapterTitleStyle: 'classic_centered',
    imagePlacement: 'inline',
    decorativeStyle: 'ornate_frame'
  },
  {
    id: 'childrens_colorful',
    name: "Children's Colorful Design",
    category: 'book',
    description: 'Colores alegres, bordes redondeados y gran protagonismo visual.',
    palette: { bg: '#fffbeb', surface: '#fef3c7', text: '#1e293b', accent: '#ec4899', border: '#fbcfe8' },
    fontFamily: 'Verdana, sans-serif',
    chapterTitleStyle: 'comic_banner',
    imagePlacement: 'top',
    decorativeStyle: 'storybook_border'
  },
  {
    id: 'professional_nonfiction',
    name: 'Professional Non-Fiction',
    category: 'book',
    description: 'Estructura clara para ensayos, manuales, guías y libros educativos.',
    palette: { bg: '#f8fafc', surface: '#eff6ff', text: '#0f172a', accent: '#0284c7', border: '#bae6fd' },
    fontFamily: 'Inter, system-ui, sans-serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'side_by_side',
    decorativeStyle: 'minimal_line'
  },
  {
    id: 'dark_cinematic',
    name: 'Dark Cinematic',
    category: 'book',
    description: 'Atmósfera oscura de alto contraste ideal para thriller, terror y sci-fi.',
    palette: { bg: '#090b10', surface: '#111622', text: '#e2e8f0', accent: '#22d3ee', border: '#1e293b' },
    fontFamily: 'Georgia, serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'none'
  },

  // ---------------- COMIC & MANGA DESIGNS (7) ---------------- //
  {
    id: 'american_superhero',
    name: 'American Superhero Comic',
    category: 'comic_manga',
    description: 'Viñetas dinámicas, colores primarios vibrantes y rótulos de acción.',
    palette: { bg: '#0f172a', surface: '#1e293b', text: '#f8fafc', accent: '#ef4444', border: '#facc15' },
    fontFamily: 'Impact, Arial Black, sans-serif',
    chapterTitleStyle: 'comic_banner',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'dark_graphic_novel',
    name: 'Dark Graphic Novel',
    category: 'comic_manga',
    description: 'Novela gráfica noir con sombras profundas y alto contraste.',
    palette: { bg: '#05070c', surface: '#0f131d', text: '#f1f5f9', accent: '#e11d48', border: '#334155' },
    fontFamily: 'Arial, sans-serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'japanese_manga',
    name: 'Japanese Manga',
    category: 'comic_manga',
    description: 'Blanco y negro puro, tramas de semitono y lectura dinámica.',
    palette: { bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', accent: '#18181b', border: '#09090b' },
    fontFamily: 'Arial, sans-serif',
    chapterTitleStyle: 'minimal_number',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'full_color_action',
    name: 'Full-Color Action Comic',
    category: 'comic_manga',
    description: 'Aventura a todo color con paneles panorámicos y energía visual.',
    palette: { bg: '#111827', surface: '#1f2937', text: '#f9fafb', accent: '#f97316', border: '#38bdf8' },
    fontFamily: 'Verdana, sans-serif',
    chapterTitleStyle: 'comic_banner',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'vintage_comic',
    name: 'Vintage Comic Book',
    category: 'comic_manga',
    description: 'Papel envejecido de los años 60-70 con tintas cálidas retro.',
    palette: { bg: '#f5ebd6', surface: '#ebe0c5', text: '#1c1917', accent: '#dc2626', border: '#292524' },
    fontFamily: 'Courier New, monospace',
    chapterTitleStyle: 'comic_banner',
    imagePlacement: 'inline',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'cinematic_graphic_novel',
    name: 'Cinematic Graphic Novel',
    category: 'comic_manga',
    description: 'Encuadres panorámicos 16:9 estilo storyboard cinematográfico.',
    palette: { bg: '#090d16', surface: '#131b2e', text: '#e2e8f0', accent: '#818cf8', border: '#312e81' },
    fontFamily: 'Inter, sans-serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'comic_gutter'
  },
  {
    id: 'indie_underground',
    name: 'Independent Underground Comic',
    category: 'comic_manga',
    description: 'Estilo fanzine independiente con trazo expresivo y alto contraste.',
    palette: { bg: '#fafafa', surface: '#e4e4e7', text: '#09090b', accent: '#7c3aed', border: '#18181b' },
    fontFamily: 'Courier New, monospace',
    chapterTitleStyle: 'minimal_number',
    imagePlacement: 'inline',
    decorativeStyle: 'comic_gutter'
  },

  // ---------------- COVER DESIGNS (7) ---------------- //
  {
    id: 'cover_minimalist',
    name: 'Minimalist Typography',
    category: 'cover',
    description: 'Portada tipográfica limpia con gran espacio negativo.',
    palette: { bg: '#0f172a', surface: '#1e293b', text: '#f8fafc', accent: '#38bdf8', border: '#334155' },
    fontFamily: 'Inter, sans-serif',
    chapterTitleStyle: 'minimal_number',
    imagePlacement: 'top',
    decorativeStyle: 'minimal_line'
  },
  {
    id: 'cover_cinematic',
    name: 'Illustrated Cinematic',
    category: 'cover',
    description: 'Composición cinematográfica con iluminación dramática.',
    palette: { bg: '#090d16', surface: '#162033', text: '#f8fafc', accent: '#f59e0b', border: '#d97706' },
    fontFamily: 'Georgia, serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'none'
  },
  {
    id: 'cover_fantasy',
    name: 'Fantasy Artwork',
    category: 'cover',
    description: 'Arte épico con marcos dorados y tipografía clásica.',
    palette: { bg: '#1e1b4b', surface: '#312e81', text: '#fef3c7', accent: '#fbbf24', border: '#f59e0b' },
    fontFamily: 'Georgia, serif',
    chapterTitleStyle: 'ornate_fantasy',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'ornate_frame'
  },
  {
    id: 'cover_photorealistic',
    name: 'Photorealistic Style',
    category: 'cover',
    description: 'Acabado editorial fotorrealista de alto impacto.',
    palette: { bg: '#18181b', surface: '#27272a', text: '#fafafa', accent: '#10b981', border: '#3f3f46' },
    fontFamily: 'Inter, sans-serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'none'
  },
  {
    id: 'cover_vintage',
    name: 'Vintage Publishing',
    category: 'cover',
    description: 'Estilo editorial clásico de colección con bordes grabados.',
    palette: { bg: '#292524', surface: '#44403c', text: '#f5f5f4', accent: '#d97706', border: '#78716c' },
    fontFamily: 'Palatino, Georgia, serif',
    chapterTitleStyle: 'classic_centered',
    imagePlacement: 'inline',
    decorativeStyle: 'ornate_frame'
  },
  {
    id: 'cover_bestseller',
    name: 'Modern Bestseller',
    category: 'cover',
    description: 'Tipografía audaz de alto contraste estilo bestseller comercial.',
    palette: { bg: '#1e1b4b', surface: '#4338ca', text: '#ffffff', accent: '#a3e635', border: '#6366f1' },
    fontFamily: 'Impact, sans-serif',
    chapterTitleStyle: 'comic_banner',
    imagePlacement: 'top',
    decorativeStyle: 'minimal_line'
  },
  {
    id: 'cover_horror',
    name: 'Dark Horror & Thriller',
    category: 'cover',
    description: 'Estética oscura, sombría y perturbadora para terror y suspenso.',
    palette: { bg: '#050507', surface: '#140c10', text: '#f8fafc', accent: '#dc2626', border: '#7f1d1d' },
    fontFamily: 'Georgia, serif',
    chapterTitleStyle: 'modern_left',
    imagePlacement: 'full_bleed',
    decorativeStyle: 'none'
  }
];
