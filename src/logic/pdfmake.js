import pdfMake from 'pdfmake/build/pdfmake';

/* Asynchronously download fonts bundle for PDF Make. */
fetch('vfs-fonts.bundle.json')
  .then(response => response.json())
  .then(vfsFonts => pdfMake.vfs = vfsFonts);

const singleFileFont = file => ({
  normal: file, bold: file, italic: file, bolditalics: file
})

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  WenQuanYiZenHei: singleFileFont('WenQuanYiZenHei.ttf'),
  NotoSansThai: singleFileFont('NotoSansThai-Regular.ttf'),
  NotoSansArabic: singleFileFont('NotoSansArabic-Regular.ttf'),
  NotoSansGeorgian: singleFileFont('NotoSansGeorgian-Regular.ttf'),
  NotoSansArmenian: singleFileFont('NotoSansArmenian-Regular.ttf')
};

export default pdfMake;
