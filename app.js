/**
 * Интерактивность портфолио Noir Atelier:
 * 1) мобильное меню;
 * 2) аккуратное появление секций;
 * 3) подробности учебных кейсов в dialog;
 * 4) калькулятор стоимости;
 * 5) безопасная настройка Telegram без битых ссылок.
 */

/* Ник указывается без символа @. Пустое значение не создаёт неверную ссылку. */
const TELEGRAM_USER = "";

/* Все числа калькулятора собраны в одном месте, чтобы их было легко менять. */
const SITE_TYPES = {
  landing: { label: "Лендинг", price: 40000, days: 7 },
  catalog: { label: "Сайт-каталог", price: 60000, days: 12 },
  multipage: { label: "Сайт компании", price: 80000, days: 14 },
};

const FEATURES = {
  animation: { label: "Анимация интерфейса", price: 15000, days: 3 },
  telegram: { label: "Заявка в Telegram", price: 8000, days: 2 },
  quiz: { label: "Квиз", price: 12000, days: 4 },
};

/* Тексты подробностей отделены от разметки карточек. */
const CASES = {
  catalog: {
    label: "Учебный проект · каталог",
    title: "Каталог «Сияние»",
    description:
      "Прототип каталога для бренда ухода. Основная задача — дать человеку быстро найти нужную категорию, изучить товар и перейти к заявке без сложного оформления.",
    features: [
      "Категории и фильтрация ассортимента",
      "Поиск по названию и описанию",
      "Карточка товара в модальном окне",
      "Адаптация для телефона и планшета",
      "Простой сценарий заявки",
    ],
    note:
      "Это учебный проект, поэтому здесь нет выдуманных продаж, клиентов или показателей конверсии.",
  },
  shop: {
    label: "Учебный проект · интернет-магазин",
    title: "Магазин с корзиной",
    description:
      "Клиентская часть небольшого магазина: каталог, изменение количества, сохранение корзины и последовательное оформление заказа.",
    features: [
      "Каталог и фильтры",
      "Добавление и удаление товаров",
      "Изменение количества в корзине",
      "Сохранение корзины в браузере",
      "Проверка формы оформления",
    ],
    note:
      "Проект демонстрирует интерфейс и логику корзины. Боевой магазин дополнительно требует сервер, базу данных, оплату, чеки и мониторинг.",
  },
  payment: {
    label: "Учебный прототип · сервер и оплата",
    title: "Магазин + ЮKassa",
    description:
      "Серверный учебный проект, в котором заказ сохраняется в базе, тестовый платёж создаётся через ЮKassa, а владелец получает уведомление.",
    features: [
      "Серверное создание заказа",
      "Тестовый платёж ЮKassa",
      "Статусы заказа и страница результата",
      "Telegram-уведомление владельцу",
      "Вход в административную часть",
    ],
    note:
      "Оплата работает в тестовом режиме. Перед коммерческим запуском необходимы production-хостинг, webhook, резервные копии и полный аудит безопасности.",
  },
};

function cleanTelegramUser() {
  return TELEGRAM_USER.trim().replace(/^@/, "");
}

function formatMoney(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatDays(value) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  let word = "дней";

  if (mod10 === 1 && mod100 !== 11) {
    word = "день";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = "дня";
  }

  return `${value} ${word}`;
}

function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const lines = document.querySelectorAll("#menu-icon span");

  function setOpen(isOpen) {
    menu.classList.toggle("hidden", !isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");

    lines[0].style.transform = isOpen ? "translateY(6.5px) rotate(45deg)" : "";
    lines[1].style.transform = isOpen ? "translateY(-6.5px) rotate(-45deg)" : "";
  }

  toggle.addEventListener("click", () => {
    setOpen(menu.classList.contains("hidden"));
  });

  menu.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      setOpen(false);
    }
  });
}

function setupRevealAnimation() {
  const elements = document.querySelectorAll(".reveal");

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  elements.forEach((element) => observer.observe(element));
}

function setupCaseDialog() {
  const dialog = document.getElementById("case-dialog");
  const closeButton = document.getElementById("dialog-close");
  const label = document.getElementById("dialog-label");
  const title = document.getElementById("dialog-title");
  const description = document.getElementById("dialog-description");
  const features = document.getElementById("dialog-features");
  const note = document.getElementById("dialog-note");

  function openCase(caseId) {
    const item = CASES[caseId];
    if (!item) return;

    label.textContent = item.label;
    title.textContent = item.title;
    description.textContent = item.description;
    note.textContent = item.note;
    features.replaceChildren();

    item.features.forEach((feature, index) => {
      const row = document.createElement("li");
      row.className =
        "grid grid-cols-[36px_1fr] gap-3 py-3 text-sm text-black/70";

      const number = document.createElement("span");
      number.className = "font-mono text-[9px] text-black/40";
      number.textContent = String(index + 1).padStart(2, "0");

      const text = document.createElement("span");
      text.textContent = feature;

      row.append(number, text);
      features.append(row);
    });

    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("dialog-open");
    }
  }

  document.querySelectorAll(".case-open").forEach((button) => {
    button.addEventListener("click", () => openCase(button.dataset.case));
  });

  closeButton.addEventListener("click", () => dialog.close());

  /* Клик по затемнённой области вокруг окна тоже закрывает dialog. */
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });
}

function getEstimate() {
  const form = document.getElementById("estimate-form");
  const selectedType = form.querySelector('input[name="siteType"]:checked').value;
  const type = SITE_TYPES[selectedType];

  let total = type.price;
  let days = type.days;
  const lines = [`${type.label} — ${formatMoney(type.price)}`];

  form.querySelectorAll('input[name="feature"]:checked').forEach((input) => {
    const feature = FEATURES[input.value];
    if (!feature) return;

    total += feature.price;
    days += feature.days;
    lines.push(`${feature.label} — ${formatMoney(feature.price)}`);
  });

  return { total, days, lines };
}

function makeEstimateMessage(estimate) {
  return [
    "Здравствуйте! Хочу обсудить проект.",
    "",
    ...estimate.lines,
    "",
    `Ориентир: ${formatMoney(estimate.total)}, ${formatDays(estimate.days)}.`,
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  /* Резервный способ нужен при локальном открытии через file://. */
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setupEstimate() {
  const form = document.getElementById("estimate-form");
  const price = document.getElementById("estimate-price");
  const days = document.getElementById("estimate-days");
  const details = document.getElementById("estimate-details");
  const action = document.getElementById("estimate-action");
  const status = document.getElementById("copy-status");
  const telegramUser = cleanTelegramUser();

  function render() {
    const estimate = getEstimate();

    price.textContent = formatMoney(estimate.total);
    days.textContent = formatDays(estimate.days);
    details.replaceChildren();
    status.textContent = "";

    estimate.lines.forEach((line) => {
      const item = document.createElement("li");
      item.className = "flex justify-between gap-4";
      item.textContent = line;
      details.append(item);
    });

    action.textContent = telegramUser
      ? "Обсудить в Telegram"
      : "Скопировать расчёт";
  }

  form.addEventListener("change", render);

  action.addEventListener("click", async () => {
    const estimate = getEstimate();
    const message = makeEstimateMessage(estimate);

    if (telegramUser) {
      const url = `https://t.me/${telegramUser}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await copyText(message);
      status.textContent = "Расчёт скопирован";
    } catch {
      status.textContent = "Не удалось скопировать. Выделите расчёт вручную.";
    }
  });

  render();
}

function setupTelegramContact() {
  const user = cleanTelegramUser();
  if (!user) return;

  const link = document.getElementById("telegram-link");
  const copy = document.getElementById("contact-copy");

  link.href = `https://t.me/${user}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Написать в Telegram";
  copy.textContent =
    "Напишите в Telegram. Я уточню задачу, предложу подход и подготовлю понятную смету.";
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupRevealAnimation();
  setupCaseDialog();
  setupEstimate();
  setupTelegramContact();

  document.getElementById("year").textContent = String(new Date().getFullYear());
});
