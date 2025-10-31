
OKO – шаг 11: Встраиваемый мини-виджет (PC first)

Содержимое:
- public/oko-widget.js — инжектит плавающую кнопку "Помощь на странице". При нажатии:
  1) вызывает window.Oko.startSession() из SDK
  2) показывает модалку с одноразовым кодом и кнопкой "Остановить"
- public/oko-widget.css — резерв (на будущее).
- demo/demo-with-widget.html — пример страницы с подключёнными SDK и виджетом.

Как протестировать локально:
1) Убедитесь, что сервер запущен: npm run dev
2) Откройте http://localhost:3000/demo/demo-with-widget.html
3) Нажмите внизу справа "Помощь на странице" — появится модалка и код, передайте оператору (http://localhost:3000/operator).

Как встроить в любой сайт (например, Битрикс: header.php):
<link rel="stylesheet" href="https://<ваш-домен>/public/oko-widget.css">
<script src="https://<ваш-домен>/public/sdk.js"></script>
<script src="https://<ваш-домен>/public/oko-widget.js" data-site-name="Ваш магазин обоев"></script>

Где <ваш-домен> — адрес, по которому будет доступен наш сервер (на продакшене). Для локального теста используйте http://localhost:3000.
