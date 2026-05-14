# Iconos PWA

Pendiente de generar. Necesitas estos archivos antes del deploy:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-maskable-192.png` (192×192, safe-area centrada al 80%)
- `icon-maskable-512.png` (512×512, safe-area centrada al 80%)
- `apple-touch-icon.png` (180×180)

## Generar desde un SVG

```bash
# Instala pwa-asset-generator globalmente
bun add -g pwa-asset-generator

# Desde el SVG del logo de Ohana
pwa-asset-generator logo.svg public/icons \
  --background "#FBF7F2" \
  --padding "12%" \
  --opaque false \
  --maskable false

pwa-asset-generator logo.svg public/icons \
  --background "#1A1714" \
  --padding "20%" \
  --opaque true \
  --maskable true
```

Los iconos maskable necesitan padding extra para respetar el safe area (~80% del canvas).
