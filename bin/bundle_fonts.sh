#!/bin/bash

set -e

font_files=(
  https://github.com/google/fonts/raw/59f86d8fc9353b362d45c981917024bc45a64145/apache/roboto/static/Roboto-Regular.ttf
  https://github.com/google/fonts/raw/59f86d8fc9353b362d45c981917024bc45a64145/apache/roboto/static/Roboto-Medium.ttf
  https://github.com/google/fonts/raw/59f86d8fc9353b362d45c981917024bc45a64145/apache/roboto/static/Roboto-Italic.ttf
  https://github.com/google/fonts/raw/59f86d8fc9353b362d45c981917024bc45a64145/apache/roboto/static/Roboto-MediumItalic.ttf
  https://github.com/layerssss/wqy/raw/c808324d36e9836bb4c9052e27e7db99633673ff/fonts/WenQuanYiZenHei.ttf
  https://github.com/googlefonts/noto-fonts/raw/fa6a9f1d0ac6cb67fc70958a2713d4b47c89dcf7/hinted/ttf/NotoSansThaiUI/NotoSansThaiUI-Regular.ttf
  https://github.com/googlefonts/noto-fonts/raw/fa6a9f1d0ac6cb67fc70958a2713d4b47c89dcf7/hinted/ttf/NotoSansArabicUI/NotoSansArabicUI-Regular.ttf
  https://github.com/googlefonts/noto-fonts/raw/fa6a9f1d0ac6cb67fc70958a2713d4b47c89dcf7/hinted/ttf/NotoSansGeorgian/NotoSansGeorgian-Regular.ttf
  https://github.com/googlefonts/noto-fonts/raw/fa6a9f1d0ac6cb67fc70958a2713d4b47c89dcf7/hinted/ttf/NotoSansArmenian/NotoSansArmenian-Regular.ttf
  https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf
  https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansMalayalam/hinted/ttf/NotoSansMalayalam-Regular.ttf
  https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansKannada/hinted/ttf/NotoSansKannada-Regular.ttf
)
target="$(pwd)/public/vfs-fonts.bundle.v3.json"
tmpdir=$(mktemp -d)

if [ -f $target ]; then
  echo 'Fonts bundle already exists' && exit 0
fi

cd $tmpdir
echo 'Building fonts'
for file in ${font_files[@]}; do
  echo "- Downloading $(basename $file)..."
  wget -q $file
done
echo '- Creating fonts bundle...'
(
  echo '{'
	file_number=1
  for file in *.ttf; do
    echo -n "  \"$file\": \"$(openssl base64 -A -in $file)\""
    if [ $file_number -ne ${#font_files[@]} ]; then echo ','; else echo ''; fi
    ((file_number++))
  done
  echo '}'
) > $target
echo "Created bundle at $target"
rm -rf $tmpdir
