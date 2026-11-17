
const API_URL = "/bookmarks/";
const REPORT_URL = "http://localhost:8001/reports/tags";

// Получаем элементы страницы
const bookmarkForm = document.getElementById("bookmark-form");
const bookmarksList = document.getElementById("bookmarks-list");
const searchInput = document.getElementById("search");
const tagSearchInput = document.getElementById("tag-search");
const tagFilter = document.getElementById("tag-filter");
const tagSelectButton = document.getElementById("tag-select-button");
const tagDropdown = document.getElementById("tag-dropdown");
const tagOptions = document.getElementById("tag-options");
const selectedTagLabel = document.getElementById("selected-tag-label");

let allBookmarksCache = [];
const sortSelect = document.getElementById("sort");
const reportButton = document.getElementById("report-button");
const reportResult = document.getElementById("report-result");

// Загружаем закладки при открытии страницы
document.addEventListener("DOMContentLoaded", updateBookmarks);


bookmarkForm.addEventListener("submit", async function(event) {
    // Отменяем стандартную отправку HTML-формы
    event.preventDefault();

    // Собираем данные из полей формы
    const bookmarkData = {
        url: document.getElementById("url").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        tags: document.getElementById("tags").value
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag !== "")
    };

    try {
        // Отправляем POST-запрос основному сервису
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookmarkData)
        });

        // Проверяем результат запроса
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Не удалось добавить закладку");
        }

        // Очищаем форму
        bookmarkForm.reset();

        // Обновляем список закладок
        await updateBookmarks();

        alert("Закладка успешно добавлена!");

    } catch (error) {
        alert("Ошибка: " + error.message);
    }
});


async function loadBookmarks() {
    try {
        // Отправляем GET-запрос основному сервису
        const response = await fetch(API_URL);

        // Проверяем, успешно ли выполнен запрос
        if (!response.ok) {
            throw new Error("Не удалось загрузить закладки");
        }

        // Преобразуем полученный JSON в JavaScript-объект
        const bookmarks = await response.json();

        // Отображаем полученные закладки
        displayBookmarks(bookmarks);

    } catch (error) {
        console.error("Ошибка:", error);
        bookmarksList.textContent = "Ошибка загрузки закладок";
    }
}


function displayBookmarks(bookmarks) {
    // Очищаем список перед отображением
    bookmarksList.replaceChildren();

    // Если закладок нет
    if (bookmarks.length === 0) {
        bookmarksList.textContent = "Закладок пока нет";
        return;
    }

    // Перебираем все полученные закладки
    bookmarks.forEach(bookmark => {
        // Создаём карточку
        const card = document.createElement("div");
        card.className = "bookmark-card";

        // Название
        const title = document.createElement("h3");
        title.textContent = bookmark.title;

        // Ссылка
        const link = document.createElement("a");
        link.href = bookmark.url;
        link.textContent = bookmark.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        // Описание
        const description = document.createElement("p");
        description.textContent = bookmark.description || "Описание отсутствует";

        // Дата добавления
        const date = document.createElement("p");
        date.textContent =
            "Добавлено: " + new Date(bookmark.created_at).toLocaleString("ru-RU");

        // Теги
        const tags = document.createElement("div");
        tags.className = "bookmark-tags";
        tags.textContent = "Теги: " + bookmark.tags.join(", ");

        // Добавляем элементы в карточку
  
        // Создаём блок с кнопками
        const actions = document.createElement("div");
        actions.className = "bookmark-actions";

        // Кнопка редактирования
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Редактировать";
        editButton.addEventListener("click", () => editBookmark(bookmark));

        // Кнопка удаления
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Удалить";
        deleteButton.addEventListener("click", () => deleteBookmark(bookmark.id));

        // Добавляем кнопки в блок
        actions.append(editButton, deleteButton);

        // Добавляем элементы в карточку
        card.append(title, link, description, date, tags, actions);

        // Добавляем карточку на страницу
        bookmarksList.appendChild(card);

    });
}



async function updateBookmarks() {
    const search = searchInput.value;
    const tag = tagFilter.value;
    const sort = sortSelect.value;

    const params = new URLSearchParams();

    if (search) {
        params.append("search", search);
    }

    if (tag) {
        params.append("tag", tag);
    }

    params.append("sort", sort);

    try {
        // Получаем отфильтрованные закладки
        const response = await fetch(`${API_URL}?${params}`);

        // Отдельно получаем все закладки
        const allResponse = await fetch(API_URL);

        if (!response.ok || !allResponse.ok) {
            throw new Error("Не удалось загрузить закладки");
        }

        const bookmarks = await response.json();
        const allBookmarks = await allResponse.json();

        allBookmarksCache = allBookmarks;

        updateTagFilter(allBookmarksCache);

        // Отображаем только найденные закладки
        displayBookmarks(bookmarks);

    } catch (error) {
        console.error("Ошибка:", error);
        bookmarksList.textContent = "Ошибка загрузки закладок";
    }
}

function updateTagFilter(bookmarks) {
    const selectedTag = tagFilter.value;
    const searchText = tagSearchInput.value.toLowerCase();

    const allTags = [...new Set(
        bookmarks.flatMap(bookmark => bookmark.tags)
    )];

    const filteredTags = allTags
        .filter(tag => tag.toLowerCase().includes(searchText))
        .sort((a, b) => a.localeCompare(b, "ru"));

    // Обновляем скрытый select
    tagFilter.innerHTML = '<option value="">Все теги</option>';

    filteredTags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });

    // Сохраняем выбранный тег, если он подходит под поиск
    if (filteredTags.includes(selectedTag)) {
        tagFilter.value = selectedTag;
    } else {
        tagFilter.value = "";
    }

    selectedTagLabel.textContent = tagFilter.value || "Все теги";

    // Формируем видимый список
    tagOptions.innerHTML = "";

    const allTagsButton = document.createElement("button");
    allTagsButton.type = "button";
    allTagsButton.className = "tag-option";
    allTagsButton.textContent = "Все теги";

    allTagsButton.addEventListener("click", () => {
        selectTag("");
    });

    tagOptions.appendChild(allTagsButton);

    filteredTags.forEach(tag => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tag-option";
        button.textContent = tag;

        button.addEventListener("click", () => {
            selectTag(tag);
        });

        tagOptions.appendChild(button);
    });

    if (filteredTags.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "tag-empty";
        emptyMessage.textContent = "Теги не найдены";
        tagOptions.appendChild(emptyMessage);
    }
}

function selectTag(tag) {
    tagFilter.value = tag;
    selectedTagLabel.textContent = tag || "Все теги";

    tagDropdown.hidden = true;
    tagSearchInput.value = "";

    updateTagFilter(allBookmarksCache);
    updateBookmarks();
}

// Открываем и закрываем список
tagSelectButton.addEventListener("click", () => {
    tagDropdown.hidden = !tagDropdown.hidden;

    if (!tagDropdown.hidden) {
        tagSearchInput.focus();
    }
});

// Фильтруем теги при вводе текста
tagSearchInput.addEventListener("input", () => {
    updateTagFilter(allBookmarksCache);
});

// Закрываем список при клике вне него
document.addEventListener("click", (event) => {
    if (!document.getElementById("tag-select").contains(event.target)) {
        tagDropdown.hidden = true;
    }
});

async function deleteBookmark(bookmarkId) {
    // Спрашиваем подтверждение
    const confirmed = confirm("Вы действительно хотите удалить эту закладку?");

    if (!confirmed) {
        return;
    }

    try {
        // Отправляем DELETE-запрос
        const response = await fetch(`${API_URL}${bookmarkId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Не удалось удалить закладку");
        }

        // Обновляем список
        await updateBookmarks();

        alert("Закладка удалена!");

    } catch (error) {
        alert("Ошибка: " + error.message);
    }
}


async function editBookmark(bookmark) {
    // Запрашиваем новые значения
    const url = prompt("Адрес сайта:", bookmark.url);

    if (url === null) return;

    const title = prompt("Название:", bookmark.title);

    if (title === null) return;

    const description = prompt("Описание:", bookmark.description);

    if (description === null) return;

    const tags = prompt(
        "Теги через запятую:",
        bookmark.tags.join(", ")
    );

    if (tags === null) return;

    // Формируем объект с обновлёнными данными
    const updatedData = {
        url: url,
        title: title,
        description: description,
        tags: tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag !== "")
    };

    try {
        // Отправляем PATCH-запрос
        const response = await fetch(`${API_URL}${bookmark.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Не удалось изменить закладку");
        }

        // Обновляем список
        await updateBookmarks();

        alert("Закладка успешно изменена!");

    } catch (error) {
        alert("Ошибка: " + error.message);
    }
}

reportButton.addEventListener("click", async function() {
    try {
        // Отправляем GET-запрос сервису отчётов
        const response = await fetch(REPORT_URL);

        if (!response.ok) {
            throw new Error("Не удалось получить отчёт");
        }

        // Получаем статистику
        const report = await response.json();

        // Очищаем предыдущий отчёт
        reportResult.replaceChildren();

        // Если тегов нет
        if (Object.keys(report).length === 0) {
            reportResult.textContent = "Данных для отчёта пока нет";
            return;
        }

        // Выводим количество закладок для каждого тега
        for (const [tag, count] of Object.entries(report)) {
            const item = document.createElement("div");
            item.className = "report-item";
            item.textContent = `${tag}: ${count} закладок`;

            reportResult.appendChild(item);
        }

    } catch (error) {
        reportResult.textContent = "Ошибка: " + error.message;
    }
});

// Обновляем список при вводе поискового запроса
searchInput.addEventListener("input", updateBookmarks);
// Обновляем список при изменении сортировки
sortSelect.addEventListener("change", updateBookmarks);