## PDF Fonts

The library used for PDF creation is [`pdfmake`](https://github.com/bpampuch/pdfmake).
In order to display competitor local names correctly, we need to add additional fonts to `pdfmake`.

### Fonts bundling
`bin/bundle_fonts.sh` downloads all the fonts we need and creates a JSON file
representing a virtual file system, which has the following form:
```json
{ "filename": "Base-64 encoded file", ... }
```
This file goes to the `public` directory, so that we can download it asynchronously in `src/logic/pdfmake`.

### Applying the fonts
Unfortunately a font is used only when we specify it explicitly.
In general it's fine to use the default Roboto font and do some additional work
only for competitor local names.
We determine which font should be used in `src/logic/documents/pdf-utils.js`
on the basis of [Unicode block ranges](https://en.wikipedia.org/wiki/Unicode_block).
