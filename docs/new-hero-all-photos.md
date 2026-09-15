# TAU CLOUD — новый сценарий со всеми 10 референсами

Статус: сценарий и расчёт подготовлены; новый запрос не запускался.
Модель: bytedance/seedance-2-5. Один запрос, 30 секунд, 16:9, без звука, 10 фото, без видео-референса. По живой схеме модель принимает до 30 изображений.

## Подтверждённая цена Krea на 14 сентября 2026
Источник: https://www.krea.ai/app/api/pricing → See all video models → Seedance 2.5.
Тариф при Video Reference = No (фото не являются видео-референсом):
- 720p: $0.2427/с × 30 = $7.281, около $7.28 за один ролик.
- 1080p: $0.4299/с × 30 = $12.897, около $12.90 за один ролик.
API оплачивается отдельно от подписки приложения. Коэффициент конвертации этой цены в CU плагин не показывает; 1564 CU из прежней инструкции не являются ценой нового запроса.
Ожидание ориентировочно 10–15 минут, зависит от очереди.

## Монтажный сценарий
| Время | Референсы | Действие |
| --- | --- | --- |
| 0–4 с | Здание Астана.png | Узнаваемый исходный фасад. Мягкое приближение к входу. |
| 4–7 с | дизель-генераторная установка.png | Чёткая смена сцены на генераторную, боковой проезд камеры вдоль синих установок. |
| 7–11 с | ИБП.png, ИБП2.png | Сначала шкафы и батареи, затем второй ракурс с голубой подсветкой. |
| 11–18 с | Капсула1.png, Капсула2.png, Капсула3.png | Фронтальная пара капсул → боковой ракурс стоек → симметричный проход. Световые импульсы подчёркивают работающую инфраструктуру. |
| 18–22 с | операторская2.png | Оператор со спины контролирует системы; небольшое движение камеры к экрану, человек не разворачивается. |
| 22–26 с | Здание алматы.png | Отдельная площадка: исходный вид сверху, лёгкое отдаление, архитектура зафиксирована по фото. |
| 26–30 с | энергия.avif + Здание алматы.png | Над площадкой возникает голубая энергетическая сфера по референсу; тонкие потоки соединяют её с крышей. Камера замирает. |

Астана и Алматы — два разных объекта: только явная монтажная смена, никакого превращения одного здания в другое. Не добавлять новые корпуса. Подписи городов и статусы площадок при интеграции выводить HTML, не генерировать внутри видео.

## Порядок reference_images
1. astana-new — Здание Астана.png
2. generator — дизель-генераторная установка.png
3. ups — ИБП.png
4. ups-blue — ИБП2.png
5. capsule-front — Капсула1.png
6. capsule-angle — Капсула2.png
7. capsule-wide — Капсула3.png
8. operations — операторская2.png
9. almaty-new — Здание алматы.png
10. energy-reference — энергия.avif (техническая конвертация в PNG)
URL сохранены в new-hero-all-refs.json. Использованы все десять файлов из сообщения пользователя, включая три разных ракурса капсул.

## Production prompt
Create a 30-second photorealistic architectural infrastructure film for TAU CLOUD, with deliberate clean cuts between distinct locations. Preserve the photographed architecture and equipment faithfully. This is a structured tour of infrastructure, not a single impossible flight through unrelated rooms.
Reference roles: @Image1 Astana exterior; @Image2 diesel generator room; @Image3 UPS cabinets and battery racks; @Image4 second UPS room view with blue-lit cabinets; @Image5 frontal paired server capsules; @Image6 oblique server capsule view; @Image7 symmetric capsule entrance view; @Image8 operations room with seated operator seen from behind; @Image9 Almaty aerial exterior; @Image10 blue-violet electrical sphere LIGHT EFFECT ONLY, not architecture.
0–4s: Begin with @Image1's exact facade and composition. A gentle push toward the Astana entrance. Preserve grey panels, black fins, glazing, signage, adjacent residential context and building proportions.
4–7s: Clean cut to @Image2. Slow lateral camera travel along the blue diesel generators. Preserve their mechanical structure, pipes, floor and room geometry. No sparks, smoke or fire.
7–9s: Clean cut to @Image3, a controlled close lateral drift showing UPS cabinets and battery shelves.
9–11s: Matched cut to @Image4's blue-lit UPS view. Keep this specific equipment configuration and bright ceiling.
11–13s: Clean cut to the paired server capsules exactly as @Image5, calm frontal approach.
13–16s: Cut to @Image6's oblique perspective, slide beside the capsule so glass-fronted racks and blue edge lights remain recognizable.
16–18s: Cut to @Image7's symmetric view; gently push toward the glass entrance. Restrained cyan pulses travel along cabinet edge lights, with realistic reflections. Do not transform the equipment.
18–22s: Clean cut to @Image8's operations room, operator remaining seated with back to camera. Slight push toward the monitoring wall. Preserve desk, monitors and room; no face reveal, no new people, no invented large interface text.
22–26s: Clean cut to @Image9's EXACT aerial composition of the Almaty facility. This is a SEPARATE site from Astana. Preserve the single-storey building, flat roof, perimeter road, trees, parking and the four generator enclosures behind it. Very subtle pullback, no orbit, no extra buildings.
26–30s: Keep that same Almaty facility unchanged. A luminous blue-cyan sphere inspired by @Image10 forms in the air above it, with fine blue-violet electrical strands and a restrained soft white glow. Thin energy strands connect the roof to the sphere, a symbolic cloud-computing effect. Settle into a stable final view. Architecture must stay fully intact and identical to @Image9.
Constraints: 30 seconds, silent, natural materials and daylight, crisp stable geometry, restrained cinematic camera. Explicit cuts between sites, no building morphing. No new wings or towers. No explosions, damage, fire or storm. No captions, subtitles, UI overlays or extra branding. Keep the existing photographed TAU CLOUD signage. Use all ten references only for their assigned scenes. Keep important objects in the central area for mobile adaptation and quieter left space during opening and ending for website headings.
