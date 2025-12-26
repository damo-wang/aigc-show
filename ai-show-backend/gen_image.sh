# 赛博朋克城市封面
convert -size 800x450 xc:"#222233" -gravity center \
  -pointsize 32 -fill white -annotate 0 "Cyber City Cover" \
  public/images/cyber_city_cover.jpg

# 城市图 1
convert -size 800x450 xc:"#111144" -gravity center \
  -pointsize 28 -fill white -annotate 0 "Cyber City 1" \
  public/images/cyber_city_1.jpg

# 城市图 2
convert -size 800x450 xc:"#331133" -gravity center \
  -pointsize 28 -fill white -annotate 0 "Cyber City 2" \
  public/images/cyber_city_2.jpg

# 小说封面
convert -size 800x450 xc:"#442222" -gravity center \
  -pointsize 32 -fill white -annotate 0 "Mars Bar Cover" \
  public/images/mars_bar_cover.jpg

# 游戏封面
convert -size 800x450 xc:"#223322" -gravity center \
  -pointsize 32 -fill white -annotate 0 "Block Dodge" \
  public/images/block_dodge_cover.png

