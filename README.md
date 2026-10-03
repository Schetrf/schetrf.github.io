# Счёт РФ — schetrf.github.io

Одностраничный статический сайт сервиса «Счёт РФ»: помощь иностранным гражданам, прибывшим в Россию, в открытии счёта в российском банке.

- Владелец: Владимир Яковлев
- Адрес: https://schetrf.github.io
- Стек: чистый HTML + CSS + немного vanilla JS. Без сборки и зависимостей.

## Файлы

| Файл | Назначение |
|---|---|
| `index.html` | Лендинг (RU по умолчанию, EN через переключатель) |
| `styles.css` | Стили, mobile-first |
| `script.js` | Переключение языка, мобильное меню, форма заявки |
| `favicon.svg` | Логотип / иконка |
| `og-image.png` | Картинка для превью ссылок (Open Graph, 1200×630) |
| `404.html` | Страница «не найдено» для GitHub Pages |
| `.nojekyll` | Отключает Jekyll на GitHub Pages |

## Языки

Русский текст — исходный в HTML. Английский перевод хранится в data-атрибутах:
`data-en` (текст), `data-en-placeholder`, `data-en-aria-label`. Выбор сохраняется в `localStorage`,
также можно открыть `?lang=en`.

## Форма

Форма **ничего не отправляет на сервер**. После проверки полей показывается сообщение «Спасибо»,
открывается почтовый клиент (`mailto:`) с подготовленным текстом и предлагаются кнопки Telegram/email.
Для реального приёма заявок позже можно подключить, например, Formspree или Telegram-бота.

## TODO перед запуском — заменить заглушки

1. **Телефон / WhatsApp**: `+7 (000) 000-00-00` — в `script.js` (`CONTACTS.phone`) и в `index.html` (секция `#contact`, `tel:+70000000000`).
2. **Telegram**: `@schetrf_placeholder` — в `script.js` (`CONTACTS.telegram`) и в `index.html` (2 ссылки `t.me/schetrf_placeholder`).
3. **Email**: `hello@schetrf.example` — в `script.js` (`CONTACTS.email`) и в `index.html` (2 ссылки `mailto:`).
4. Убрать строку «Контакты временные и скоро будут обновлены» (`.placeholder-warning` в `index.html`).
5. Проверить текст согласия на обработку данных; при необходимости добавить политику конфиденциальности (152-ФЗ).
6. По желанию: уточнить ответы FAQ (стоимость, города работы).

Поиск всех заглушек: `grep -rn "placeholder\|000-00-00\|schetrf.example\|TODO" .`

## Локальный запуск

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Публикация на GitHub Pages

1. Создать репозиторий `schetrf.github.io` в аккаунте/организации `schetrf`.
2. `git remote add origin git@github.com:schetrf/schetrf.github.io.git && git push -u origin main`
3. Settings → Pages → Source: *Deploy from a branch*, ветка `main`, папка `/ (root)`.

## Важно

Сайт носит информационный характер. На сайте намеренно нет цен, названий банков-партнёров, статистики,
отзывов и лицензий — добавляйте их только при наличии подтверждённых данных.
