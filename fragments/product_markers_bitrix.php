<?php
// Пример: как добавить атрибуты data-oko-id в шаблон карточки Bitrix (catalog.element)
// Это не полный шаблон, а подсказка по правке. Ищите у себя аналогичные места.

// Поле количества:
?>
<input type="number" name="quantity" value="1" min="1" max="999" data-oko-id="qty" />

<?php
// Кнопка «В корзину»:
?>
<button class="btn btn-primary" data-oko-id="cart">В корзину</button>