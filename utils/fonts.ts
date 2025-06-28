type Font = {
  family: string;
  url: string;
  options: {
    weight: string;
    style: string;
  };
};

function loadFonts(fonts: Font[], fontFamily: string) {
  const fontFaces = fonts.map((font) => {
    return new FontFace(font.family, `url(${font.url})`, font.options);
  });

  async function loadFontFace(fontFace) {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
  }

  if (!fontFaces.length) return;

  fontFaces.forEach((fontFace) => {
    loadFontFace(fontFace);
  });
  document.documentElement.style.setProperty(
    '--fontFamily',
    `'${fontFamily}', sans-serif`
  );
}

export { loadFonts };
