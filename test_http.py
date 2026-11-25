import urllib.request

resp = urllib.request.urlopen('http://localhost:10010/')
print('HTTP Status:', resp.status)
html = resp.read().decode('utf-8')
print('HTML Length:', len(html))
print('Has gemshop tab:', 'data-tab="gemshop"' in html)
print('Has active-buffs-hud:', 'active-buffs-hud' in html)
print('Has trait-warning-modal:', 'trait-warning-modal' in html)
print('Has unique-awakening-modal:', 'unique-awakening-modal' in html)
print('Has Trait Chances:', 'Trait Chances' in html)
print('Has Reset to Default:', 'Reset Everything to Default' in html)
