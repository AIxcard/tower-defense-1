with open('d:/My Project/pixel_tower_defense/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('top-bar')
if idx != -1:
    print(text[idx:idx+800])
