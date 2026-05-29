⚙️ FIGMA FUNCTIONALITY PROMPT — Funcionalidad de Búsqueda, Mi Viaje, Perfil y Mini-Buseta

    Continuación del rediseño de la app de transporte urbano Santa Marta. Este prompt cubre exclusivamente la lógica de interacción y comportamiento funcional de los módulos identificados en las capturas.

🔍 MÓDULO 1 — BARRA DE BÚSQUEDA (Funcionalidad completa)
Estado por defecto

    Placeholder animado que hace tipo "typing effect": "Buscar ruta... / Buscar paradero... / ¿A dónde vas?" alternando cada 2.5s con fade

    Ícono de lupa (izquierda) en color #8B8FA8

    Al tap: el campo recibe foco, el teclado sube, la lupa cambia a color #00E5A0

Estado con foco activo

    El border del input pasa de rgba(255,255,255,0.09) → #00E5A0 con glow 0 0 0 3px rgba(0,229,160,0.15)

    Aparece una X de limpiar (derecha) si hay texto

    El fondo del input hace micro-transición a Surface 2 (#1E2029)

Lógica de búsqueda en tiempo real

text
INPUT del usuario → filtra simultáneamente en 3 categorías:

1. RUTAS — busca por número (ej. "1", "7U") o nombre destino (ej. "Rodadero", "Taganga")
2. PARADEROS — busca por nombre (ej. "Terminal", "Parque de Los Novios", "Buenavista")
3. SECTORES — busca por zona/barrio (ej. "Mamatoco", "Gaira", "Centro")

Panel de resultados (dropdown/sheet)

    Aparece 200ms después del primer carácter escrito

    Animación: slide-up + fade-in desde abajo (translateY: 8px → 0, opacity: 0 → 1)

    Organizado en secciones con header:

text
━━━ 🚌 RUTAS (2) ━━━━━━━━━━━━━━━━
  [Badge Ruta 1]  Centro → Rodadero     $3.000  →
  [Badge Ruta 3]  Centro → Taganga      $3.000  →

━━━ 📍 PARADEROS (3) ━━━━━━━━━━━━━
  📌  Terminal de Transportes  ·  Av. del Libertador  →
  📌  Parque de Los Novios     ·  Centro Histórico     →

━━━ 🗺️ SECTORES (1) ━━━━━━━━━━━━━
  🏙️  Rodadero                ·  Zona Turística       →

    Si no hay resultados → estado vacío con ícono animado + texto "No encontramos esa ruta. Prueba con otro nombre."

    Al seleccionar resultado tipo RUTA → navega a Detalle de Ruta

    Al seleccionar PARADERO → centra mapa en ese paradero + muestra popup con rutas que pasan

    Al seleccionar SECTOR → centra mapa en la zona

Búsquedas recientes

    Si el input está vacío y con foco → muestra historial de las últimas 5 búsquedas

    Header: "Búsquedas recientes" + botón "Limpiar todo"

    Cada ítem: ícono reloj (#4A4D60) + texto + X para eliminar individualmente

🗺️ MÓDULO 2 — PANTALLA "MI VIAJE" — Botones de acción (panel inferior)
Referencia visual (imagen capturada)

Los 4 botones en fila horizontal: Alerta · Compartir · Favorito · Cancelar
Botón 1 — 🔔 ALERTA

Estado por defecto: Ícono de campana en #00E5A0, texto "Alerta" en blanco

Al tocar:

    Abre un Bottom Sheet modal (altura: 45% pantalla) con:

    text
    Título: "Configurar alerta de llegada"

    Opciones (radio buttons estilo pill):
    ○  Notificarme 1 parada antes
    ● Notificarme 2 paradas antes   ← default seleccionado
    ○  Notificarme 5 min antes
    ○  Solo vibración (sin sonido)

    [Cancelar]   [Guardar alerta →]

    Al guardar → toast de confirmación en top: "✓ Recibirás una alerta antes de llegar a Rodadero" (slide-down, 3s, color fondo #00E5A0, texto negro)

    El ícono de campana en el botón agrega un badge dot pulsante verde para indicar que hay alerta activa

Botón 2 — 📤 COMPARTIR

Al tocar:

    Abre Share Sheet nativo del sistema (iOS/Android share API)

    Mensaje pre-armado:

    text
    "Estoy tomando la Ruta 1 · Centro → Rodadero 🚌
    Llego aproximadamente en 11 min.
    Sigue mi ruta: [deep-link de la app]"

    Opciones: WhatsApp, Telegram, SMS, Copiar enlace

    Si el usuario copia el enlace → toast: "Enlace copiado al portapapeles" (2s)

Botón 3 — ⭐ FAVORITO

Estado inactivo: ícono estrella outline en #E5A000

Al tocar (toggle):

    Animación: la estrella hace scale(0) → scale(1.3) → scale(1) en 300ms con spring

    El ícono cambia de outline → filled en amarillo dorado #E5A000

    Toast: "Ruta 1 añadida a tus favoritas" (2.5s)

    La ruta aparece guardada en el perfil → sección "Rutas favoritas"

Al tocar de nuevo (quitar favorito):

    Animación inversa: shake leve + vuelta a outline

    Toast: "Ruta eliminada de favoritas"

Botón 4 — ❌ CANCELAR

Al tocar:

    Abre un Dialog de confirmación (no Bottom Sheet — es una acción destructiva):

    text
    ╔═══════════════════════════════╗
    ║  ¿Terminar el viaje?          ║
    ║                               ║
    ║  Se cerrará el seguimiento    ║
    ║  de tu ruta actual.           ║
    ║                               ║
    ║  [Seguir en ruta]  [Terminar] ║
    ╚═══════════════════════════════╝

        Fondo overlay: rgba(0,0,0,0.7) + blur

        "Seguir en ruta": botón ghost con borde rgba(255,255,255,0.2)

        "Terminar": botón rojo sólido #FF6B6B

        Al confirmar → animación de salida del panel (slide-down), el mapa vuelve al estado Home, la buseta del mapa desaparece con fade-out

Toggle "Notificarme antes de llegar"

Estado OFF (por defecto):

    Toggle pill: fondo #2A2D3E, círculo blanco-grisáceo

    Texto: #8B8FA8

Al activar:

    Toggle anima a estado ON: fondo cambia a #00E5A0, círculo desliza a la derecha con spring

    Texto cambia a #F0F2FF

    Ícono de campana al lado del texto añade micro-bounce

    Comportamiento: equivalente al botón Alerta con configuración por defecto (2 paradas antes)

Barra de progreso del viaje (tira verde animada)

Comportamiento:

    La barra al 100% del ancho representa el trayecto total de la ruta

    La parte completada (izquierda) usa gradiente: #00E5A0 → #4F8EF7

    La parte pendiente: rgba(255,255,255,0.08)

    El avance se actualiza en tiempo real (simular con interpolación cada 5s en demo)

    Al final del recorrido: la barra hace un pulso de llenado completo + confetti micro-animación + toast "¡Llegaste a Rodadero! 🎉"

👤 MÓDULO 3 — PANTALLA PERFIL — Funcionalidad de cada ítem
Header card (gradiente verde → azul)

    Avatar (círculo con ícono persona):

        Al tocar → abre selector de foto: "Tomar foto" / "Elegir de galería" / "Avatar predeterminado"

        El avatar soporta imagen real del usuario; si no hay foto, muestra iniciales del nombre en display

    Botón ⚙️ (settings, esquina superior derecha):

        No es navegación independiente — hace scroll suave hasta la sección "Configuración" dentro de la misma pantalla

        Agrega un highlight temporal (glow de 1s) en la card de Configuración para orientar al usuario

    Stats (Viajes · Favoritas · Rating):

        Los números hacen count-up animation al entrar a la pantalla (0 → valor final, 800ms, easeOut)

        "Viajes" → al tocar navega a Historial de Viajes

        "Favoritas" → al tocar navega a Rutas Favoritas

        "Rating" → al tocar abre modal con desglose de calificaciones (escala 1-5, distribución en barras)

Lista de opciones (menu items)

Comportamiento general de cada fila:

    Al tap: scale(0.98) + fondo Surface 3 (feedback táctil visual)

    La flecha → hace translateX(+3px) al hover/press

    Transición de entrada a sub-pantalla: slide-left (nueva pantalla entra desde la derecha)

1. Información personal
Abre pantalla con formulario editable:

text
Campos:
- Nombre completo  [editable]
- Número de celular [editable, con validación]
- Email            [editable, con validación]
- Ciudad           [readonly: Santa Marta]

Botón inferior: [Guardar cambios]  → toast de confirmación

    Los campos en modo readonly tienen fondo Surface 1, en modo edición Surface 2 + borde #00E5A0

2. Historial de viajes
Lista con cards de viaje previo:

text
Cada card:
- Fecha y hora (ej. "30 Apr · 3:45 PM")
- Ícono de ruta con badge de número
- "Centro → Rodadero"  ·  Duración: 18 min
- Costo: $3.000
- Badge estado: "Completado" (verde) / "Cancelado" (rojo)

    Agrupados por fecha (headers sticky: "Hoy", "Ayer", "Esta semana")

    Swipe-left en un ítem → opción "Repetir ruta" (inicia el viaje de nuevo)

    Estado vacío si no hay historial: ícono animado de reloj + "Aún no tienes viajes registrados"

3. Rutas favoritas
Grid 2 columnas de route cards compactas:

text
Cada card:
- Badge número de ruta con color único
- Nombre: "Centro → Rodadero"
- Sub: "Cada 10-15 min · $3.000"
- Botón: [Iniciar →]

    Long-press en card → contexto menu: "Iniciar viaje" / "Ver detalles" / "Eliminar de favoritos"

    Estado vacío: ícono de estrella animado + "Guarda tus rutas más usadas aquí" + botón [Explorar rutas]

4. Notificaciones
Lista de toggles:

text
[Toggle] Alertas de llegada            ON  (verde)
[Toggle] Actualizaciones de rutas      ON
[Toggle] Noticias y novedades          OFF
[Toggle] Ofertas y promociones         OFF
[Toggle] Sonidos                       ON
[Toggle] Vibración                     ON

    Cada toggle tiene animación spring al cambiar estado

    Sección header "Alertas de viaje" / "Comunicaciones" / "Sonido" para agrupar

    Al desactivar "Alertas de llegada" → dialog de confirmación: "¿Seguro? No recibirás avisos antes de llegar a tu parada."

5. Configuración
Sub-secciones:

text
APARIENCIA:
  [Selector tema] Oscuro · Claro · Sistema  (segmented control)
  [Toggle] Mapa en modo satélite            OFF

IDIOMA:
  Español (Colombia)                        → selector con opciones

DATOS:
  [Botón] Limpiar caché de mapas
  [Botón] Exportar mis datos

CUENTA:
  [Botón rojo ghost] Eliminar cuenta        → con doble confirmación

6. Ayuda y soporte

text
Secciones:
- Preguntas frecuentes  → lista acordeón de FAQs
- Reportar un problema  → formulario con selector de tipo + campo texto + botón enviar
- Contactar soporte     → abre WhatsApp Business de la app
- Versión de la app     → "v2.0.0 (Build 204)"  [readonly]
- Términos y privacidad → abre webview

Botón "Cerrar sesión"

Al tocar:

    Dialog de confirmación (igual patrón que "Cancelar viaje"):

    text
    "¿Cerrar sesión?"
    "Deberás ingresar nuevamente."
    [Cancelar]  [Cerrar sesión →]

    El botón de Cerrar sesión del dialog tiene fondo rgba(255,107,107,0.15) + texto #FF6B6B + borde rgba(255,107,107,0.3)

    Al confirmar: animación fade-out de toda la pantalla → transición a pantalla de Login/Bienvenida

    La sesión en memoria se limpia completamente

🚌 MÓDULO 4 — MINI-BUSETA EN EL MAPA (corrección y especificación técnica)
Problema actual

La buseta actualmente aparece como un cuadrado/badge plano con número. Necesita ser rediseñada como un ícono reconocible de vehículo.
Diseño del ícono SVG (especificación exacta)

text
Vista: top-down (vista desde arriba, bird's eye view)
Forma base: rectángulo redondeado 28x16dp, border-radius 5dp
  - Carrocería: color primario de la ruta (ej. #00E5A0 para Ruta 1)
  - Parabrisas delantero: rectángulo más claro 10x5dp en la parte delantera
  - Ventanas laterales: 2 rectángulos pequeños semitransparentes a cada lado
  - Ruedas: 4 círculos pequeños (3dp) en esquinas, color #0D0F14
  - Dirección de movimiento: el "frente" apunta hacia donde se mueve
  - Sombra bajo el ícono: `drop-shadow(0px 3px 6px rgba(0,0,0,0.5))`

Tamaño total del marker: 40x40dp (el SVG del vehículo centrado dentro)

Comportamiento de rotación

    El ícono rota en tiempo real para apuntar en la dirección de movimiento del vehículo

    La rotación usa transform: rotate(Ndeg) calculada con Math.atan2(deltaY, deltaX) entre posición anterior y actual

    Transición de rotación: transition: transform 400ms ease-in-out (suave, sin giros bruscos)

    Si el vehículo se detiene por >5s: el ícono hace un micro-pulse (scale 1 → 1.05 → 1) para indicar que está parado

Estado de la buseta según situación

text
En movimiento normal:   color sólido de la ruta + glow sutil
Detenida en paradero:   mismo color + badge flotante "En paradero" por 3s
Próxima a ti (<200m):   borde blanco pulsante + ícono más grande (scale 1.2)
Fuera de servicio:      color gris `#4A4D60` + ícono de "zzz" pequeño encima

Popup al hacer tap en la buseta

    Aparece un tooltip flotante encima del ícono (no bottom sheet):

    text
    ┌─────────────────────────────────┐
    │  🚌 Ruta 1 · Centro → Rodadero  │
    │  ⏱  Llega a tu parada en ~4 min │
    │  📍  En: Av. Santa Rita         │
    │           [Ver detalles →]      │
    └─────────────────────────────────┘

        Fondo: rgba(22, 24, 32, 0.96) + blur

        Borde: rgba(0, 229, 160, 0.3) 1px

        Border radius: 14dp

        Sombra: Card shadow

        Flecha triangular apuntando hacia el marcador

        Auto-cierra después de 6s o al tocar afuera

Múltiples busetas en el mapa

    Cuando hay más de 3 busetas de la misma ruta muy juntas (distancia <50px en pantalla): se agrupan en un cluster badge:

    text
    Badge circular 32dp, fondo accent de la ruta, número blanco grande
    Ejemplo: "3" (3 busetas cercanas)
    Al hacer zoom-in → el cluster se expande mostrando cada buseta individual

📐 ESPECIFICACIONES DE PROTOTIPADO FIGMA

text
Flows adicionales a crear:

BÚSQUEDA:
  Home → tap search bar → typing "Rodadero" → seleccionar resultado → Detalle Ruta

MI VIAJE — BOTONES:
  My Trip Screen → tap "Alerta" → Bottom Sheet configuración → guardar → toast
  My Trip Screen → tap "Compartir" → Share Sheet overlay
  My Trip Screen → tap "Favorito" → animación estrella → toast
  My Trip Screen → tap "Cancelar" → Dialog confirmación → [Terminar] → Home

PERFIL:
  Profile → tap "Historial" → Historial screen → swipe item → Repetir ruta
  Profile → tap avatar → photo picker overlay
  Profile → tap "Cerrar sesión" → Dialog → confirmar → Login screen

BUSETA EN MAPA:
  Home Map → tap buseta → tooltip aparece → tap "Ver detalles" → Detalle Ruta

VARIANTES DE COMPONENTE BUSETA:
  Variant 1: moving (animating)
  Variant 2: stopped-at-stop
  Variant 3: near-user (pulse border)
  Variant 4: out-of-service (gray)
  Variant 5: clustered (con número)