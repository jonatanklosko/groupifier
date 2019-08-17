#!/bin/bash

font_files=(
  https://github.com/google/fonts/raw/master/apache/roboto/Roboto-Regular.ttf
  https://github.com/google/fonts/raw/master/apache/roboto/Roboto-Medium.ttf
  https://github.com/google/fonts/raw/master/apache/roboto/Roboto-Italic.ttf
  https://github.com/google/fonts/raw/master/apache/roboto/Roboto-MediumItalic.ttf
  https://github.com/layerssss/wqy/raw/gh-pages/fonts/WenQuanYiZenHei.ttf
  https://github.com/googlei18n/noto-fonts/raw/master/hinted/NotoSansThaiUI/NotoSansThaiUI-Regular.ttf
  https://github.com/googlei18n/noto-fonts/raw/master/hinted/NotoSansArabicUI/NotoSansArabicUI-Regular.ttf
  https://github.com/googlei18n/noto-fonts/raw/master/hinted/NotoSansGeorgian/NotoSansGeorgian-Regular.ttf
  https://github.com/googlei18n/noto-fonts/raw/master/hinted/NotoSansArmenian/NotoSansArmenian-Regular.ttf
)
target="$(pwd)/public/vfs-fonts.bundle.v2.json"
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
    echo -n "  \"$file\": \"$(base64 -w 0 $file)\""
    if [ $file_number -ne ${#font_files[@]} ]; then echo ','; else echo ''; fi
    ((file_number++))
  done
  echo '}'
) > $target
echo "Created bundle at $target"
rm -rf $tmpdir
