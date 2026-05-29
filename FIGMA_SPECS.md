# 📐 ESPECIFICACIONES TÉCNICAS PARA FIGMA — BUSSAMARIO

## 🎨 DISEÑO GENERAL

### Frame Size
- **Dispositivo base**: iPhone 14 Pro
- **Dimensiones**: 390 × 844 px
- **Safe areas**: Top 59px, Bottom 34px

### Grid System
- **Columnas**: 4
- **Gutter**: 16px
- **Margin lateral**: 20px
- **Baseline grid**: 8px

---

## 🎨 DESIGN TOKENS

### Paleta de Colores (Dark Mode)

```
Background Principal:     #0D0F14
Surface 1 (cards):        #161820
Surface 2 (elevated):     #1E2029
Surface 3 (modal/drawer): #252733

Accent Primario:          #00E5A0  (verde menta eléctrico)
Accent Secundario:        #4F8EF7  (azul vibrante)
Accent Terciario:         #FF6B6B  (rojo/coral para alertas)

Texto Primario:           #F0F2FF
Texto Secundario:         #8B8FA8
Texto Faint:              #4A4D60

Divider:                  rgba(255,255,255,0.06)
Border Sutil:             rgba(255,255,255,0.09)

Gradiente Hero:           linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)
```

### Tipografía

**Fuentes:**
- Display (títulos): "Plus Jakarta Sans" — Bold/ExtraBold
- Body (UI text): "Inter" — Regular/Medium/SemiBold
- Mono (números): "JetBrains Mono" — Medium

**Escala:**
```
Hero Title:     32px / line-height 1.1 / Bold
Screen Title:   22px / line-height 1.2 / Bold
Section Title:  18px / line-height 1.3 / SemiBold
Body:           15px / line-height 1.6 / Regular
Label/Badge:    12px / line-height 1.0 / SemiBold / letter-spacing +0.5px
Micro:          11px / UPPERCASE / letter-spacing +1px
```

### Border Radius

```
XL (cards principales):   20px
LG (cards secundarias):   14px
MD (botones/inputs):      10px
SM (badges/chips):        6px
Full (pills/avatars):     9999px
```

### Sombras

```
Glow Accent:   0px 0px 24px rgba(0, 229, 160, 0.18)
Card Shadow:   0px 8px 32px rgba(0, 0, 0, 0.4)
Navbar Shadow: 0px -4px 20px rgba(0, 0, 0, 0.35)
```

---

## 📱 COMPONENTES — VARIANTES REQUERIDAS

### 1. Ruta Card
**Estados:**
- `default` — Estado por defecto
- `pressed` — scale(0.97), ligero glow en borde
- `active` — Borde accent primario, glow sutil
- `skeleton` — Shimmer loading state

**Estructura:**
- Badge izquierdo: 64×64px, border-radius 12px, gradiente único
- Contenido: nombre ruta (Bold 16px) + origen→destino chips
- Badges: frecuencia (azul) + tarifa (verde)
- Arrow derecha: 24×24px, color accent

### 2. Chip de Ruta
**Estados:**
- `default` — Gris faint
- `selected` — Borde accent + glow
- `disabled` — Opacity 0.5

**Estructura:**
- Height: 44px
- Padding: 12px 16px
- Border-radius: 12px
- Ícono bus: 24×24px
- Dot separador: 6px diameter

### 3. Bottom Sheet
**Estados:**
- `collapsed` — 35% altura pantalla
- `expanded` — 85% altura pantalla

**Estructura:**
- Handle bar: 32×4px, color #4A4D60
- Border-radius top: 24px
- Backdrop blur: 20px
- Background: Surface 1 con 95% opacity

### 4. Tab Bar
**Estados por tab:**
- `active` — Ícono accent, label visible, punto indicador
- `inactive` — Ícono #4A4D60, label faint

**Estructura:**
- Height total: 80px (incluye safe area)
- Grid: 4 columnas iguales
- Ícono: 24×24px
- Label: 10px Medium
- Badge (Mi Viaje): 12×12px, pulsante

### 5. Buseta Icon (Mapa)
**Estados:**
- `animating` — Moviéndose en ruta
- `stopped` — Estático en parada
- `selected` — Glow accent alrededor

**Estructura:**
- Size: 28×28px
- Border-radius: 6px
- Border: 2px white
- Shadow: 0 0 16px accent/0.3
- Número interior: 12px Bold Mono

---

## 🎬 ANIMACIONES Y MICROINTERACCIONES

### Timing Functions
```
Ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1)
Spring bounce:   mass 1, stiffness 200, damping 20
Quick transition: 200ms ease-out
Standard:        300ms ease-in-out
```

### Animaciones Específicas

**1. Buseta en Movimiento**
- Interpolación: ease-in-out, 500ms
- Path: coordenadas GPS
- Rotation: hacia dirección de viaje

**2. Bottom Sheet Drag**
- Spring physics al soltar
- Snap points: 35% y 85%
- Resistance al pasar límites

**3. Card Tap**
- Scale: 1 → 0.97 (100ms)
- Feedback: vibración suave (si disponible)

**4. Badge Pulsante (Ruta Activa)**
- Scale: 1 → 1.15 → 1
- Duration: 2s loop infinito
- Ease: ease-in-out

**5. Línea de Ruta Activa**
- Dash-offset animation
- Dirección: sentido del viaje
- Duration: 3s linear infinite

**6. ETA Flip Number**
- Y translation: ±20px
- Opacity: 0 → 1
- Spring transition

**7. Notificación Slide-Down**
- Y: -100 → 0
- Spring: stiffness 200, damping 20
- Auto-dismiss: 5s

**8. Tab Change**
- Icon bounce: Y -4px (400ms ease-out)
- Active indicator: layoutId shared transition

---

## 🎨 PROTOTYPE FLOWS

### Flow 1: Home Mapa → Selección de Ruta
1. Usuario en pantalla Home (mapa fullscreen)
2. Tap en chip de ruta en bottom sheet
3. Chip cambia a estado `selected` con glow
4. Mapa hace zoom a ruta seleccionada
5. Bottom sheet muestra info detallada de ruta

### Flow 2: Ruta Card → Detalle
1. Usuario en lista de rutas
2. Tap en card de ruta
3. **Shared element transition**: badge de ruta se expande
4. Pantalla detalle hace fade-in
5. Mapa de ruta carga con skeleton → contenido

### Flow 3: Detalle → Iniciar Viaje
1. Usuario en detalle de ruta
2. Tap botón "Iniciar viaje"
3. Transición a pantalla "Mi Viaje"
4. Mapa se centra en ubicación usuario
5. Panel inferior muestra ETA con flip animation

### Flow 4: Tab Bar Navigation
1. Usuario en cualquier pantalla
2. Tap en tab destino
3. Icon hace bounce animation
4. Dot indicator slide transition
5. Pantalla fade cross-transition

---

## 📋 PANTALLAS A DISEÑAR (en orden)

### 1. Home / Mapa en Tiempo Real
**Componentes:**
- Mapa fullscreen oscuro
- Search bar flotante top
- Bottom sheet arrastrable
- Route chips horizontales
- FAB localización
- Bottom tab bar

**Estados:**
- Loading (skeleton)
- Sin rutas cercanas
- Ruta seleccionada
- Múltiples rutas activas

### 2. Lista de Rutas
**Componentes:**
- Header con logo + saludo
- Stats strip (3 pills)
- Search input con glow
- Route cards scrollables
- Bottom tab bar

**Estados:**
- Loading
- Búsqueda vacía
- Filtros aplicados

### 3. Detalle de Ruta
**Componentes:**
- Header con gradiente
- Stats bar (3 métricas)
- Mapa de ruta
- Schedule toggle (segmented control)
- Timeline horarios
- Stops timeline vertical
- Bottom tab bar

**Estados:**
- Loading mapa
- Schedule weekday/weekend
- Parada activa highlight

### 4. Mi Viaje / Tracking
**Componentes:**
- Mapa 60% pantalla
- User position marker (pulsante)
- Bus animado en ruta
- Panel inferior 40%
- ETA card con progress bar
- Destination card
- Notify toggle
- Quick actions grid (4 botones)
- Bottom tab bar

**Estados:**
- Sin viaje activo
- Viaje en curso
- Próximo a parada (notificación)
- Viaje completado

### 5. Perfil
**Componentes:**
- User info card con gradiente
- Stats grid (3 métricas)
- Menu items list
- Logout button
- Version footer
- Bottom tab bar

**Estados:**
- Logged in
- Guest mode

---

## 🎨 SISTEMA DE COMPONENTES (Atoms + Molecules)

### Atoms

**Button**
- Variants: primary, secondary, ghost, destructive
- Sizes: sm (32px), md (44px), lg (56px)
- States: default, hover, pressed, disabled

**Badge**
- Variants: default, accent, success, warning, error
- Sizes: sm, md, lg

**Input**
- States: default, focused, error, disabled
- With/without icon

**Avatar**
- Sizes: xs (24px), sm (32px), md (48px), lg (64px)
- With/without badge

### Molecules

**Route Chip**
- Icon + Number + Dot + Destination
- States: default, selected, disabled

**Stat Card**
- Icon + Label + Value
- Colors: accent variants

**Menu Item**
- Icon + Title + Description + Arrow
- States: default, pressed

**Stop Timeline Item**
- Marker + Name + ETA + Badge (opcional)
- Variants: origin, destination, intermediate

---

## 🔧 CONSIDERACIONES TÉCNICAS

### Auto Layout
- Todos los componentes deben usar Auto Layout
- Responsive: horizontal padding y vertical spacing
- Constraints: definir para resize correcto

### Component Properties
- Todas las variantes como boolean props
- Contenido como text props
- Colores como instance swap (cuando aplique)

### Naming Convention
```
Components/  
  ├── Atoms/
  │   ├── Button/Primary
  │   ├── Button/Secondary
  │   └── Badge/Default
  ├── Molecules/
  │   ├── RouteChip/Default
  │   └── StatCard/Frequency
  └── Organisms/
      ├── RouteCard/Default
      └── BottomSheet/Collapsed
```

### Export Settings
- PNG @2x para assets
- SVG para íconos
- PDF para specs de espaciado

---

## ✅ CHECKLIST DE ENTREGABLES

- [ ] Design system completo con tokens
- [ ] Componentes atoms (Button, Badge, Input, Avatar)
- [ ] Componentes molecules (RouteChip, StatCard, MenuItem)
- [ ] Componentes organisms (RouteCard, BottomSheet, TabBar)
- [ ] 5 pantallas principales con estados
- [ ] Prototype flows interactivos
- [ ] Variantes de cada componente
- [ ] Animaciones documentadas
- [ ] Grid y spacing specs
- [ ] Export de assets

---

**Versión**: 1.0  
**Fecha**: Mayo 2026  
**Proyecto**: BusSamario — Sistema de información de transporte Santa Marta
