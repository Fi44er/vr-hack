const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const { getOrders, updateOrder, deleteOrder } = require("./api/order/order");
const { getTeams, updateTeam, deleteTeam } = require("./api/team/team");

const BOT_TOKEN = "6706590553:AAHjcCNfUy4ZZvd_sRb4u5O7ZmHh6NZza5E";
const bot = new Telegraf(BOT_TOKEN);

// Состояние пользователя
const userStates = {};

// Функция для авторизации
bot.start((ctx) => {
  userStates[ctx.from.id] = {}; // Инициализируем состояние для пользователя
  ctx.reply(
    "Добро пожаловать в админ-панель. Выберите действие:",
    Markup.keyboard([
      ["Получить все заявки", "Получить все команды"],
      ["Добавить/Обновить заявку", "Добавить/Обновить команду"],
      ["Удалить заявку", "Удалить команду"],
    ]).resize()
  );
});

// Получить все заявки
bot.hears("Получить все заявки", async (ctx) => {
  const orders = await getOrders();
  if (orders.length === 0) {
    return ctx.reply("Нет заявок.");
  }

  let message = "Список заявок:\n\n";
  orders.forEach((order) => {
    message += `ID: ${order.id}\nФИО: ${order.fio}\nТелефон: ${order.phone_number}\nEmail: ${order.email}\n\n`;
  });

  ctx.reply(message);
});

// Удалить заявку
bot.hears("Удалить заявку", (ctx) => {
  userStates[ctx.from.id] = { action: "delete_order" };
  ctx.reply("Введите ID заявки для удаления:");
});

// Удалить команду
bot.hears("Удалить команду", (ctx) => {
  userStates[ctx.from.id] = { action: "delete_team" };
  ctx.reply("Введите ID команды для удаления:");
});

// Получить все команды
bot.hears("Получить все команды", async (ctx) => {
  const teams = await getTeams();
  if (teams.length === 0) {
    return ctx.reply("Нет команд.");
  }

  let message = "Список команд:\n\n";
  teams.forEach((team) => {
    message += `ID: ${team.id}\nНазвание: ${team.team_name}\nСсылка: ${team.link}\nТрек: ${team.track}\n\n`;
  });

  ctx.reply(message);
});

// Добавить/Обновить заявку
bot.hears("Добавить/Обновить заявку", (ctx) => {
  userStates[ctx.from.id] = { action: "update_order", step: "choose_field" };
  ctx.reply(
    "Выберите поле для обновления:",
    Markup.inlineKeyboard([
      Markup.button.callback("ФИО", "update_fio"),
      Markup.button.callback("Телефон", "update_phone_number"),
      Markup.button.callback("Email", "update_email"),
      Markup.button.callback("Готово", "update_order_confirm"),
    ]).resize()
  );
});

// Обработка кнопок для обновления заявки
bot.action("update_fio", (ctx) => {
  userStates[ctx.from.id].fio = true;
  ctx.reply("Поле 'ФИО' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_phone_number", (ctx) => {
  userStates[ctx.from.id].phone_number = true;
  ctx.reply("Поле 'Телефон' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_email", (ctx) => {
  userStates[ctx.from.id].email = true;
  ctx.reply("Поле 'Email' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_order_confirm", (ctx) => {
  userStates[ctx.from.id].step = "awaiting_order_id";
  ctx.reply("Введите ID заявки, которую хотите обновить.");
});

// Добавить/Обновить команду
bot.hears("Добавить/Обновить команду", (ctx) => {
  userStates[ctx.from.id] = { action: "update_team", step: "choose_field" };
  ctx.reply(
    "Выберите поле для обновления:",
    Markup.inlineKeyboard([
      Markup.button.callback("Название команды", "update_team_name"),
      Markup.button.callback("Ссылка", "update_link"),
      Markup.button.callback("Трек", "update_track"),
      Markup.button.callback("Готово", "update_team_confirm"),
    ]).resize()
  );
});

// Обработка кнопок для обновления команды
bot.action("update_team_name", (ctx) => {
  userStates[ctx.from.id].team_name = true;
  ctx.reply("Поле 'Название команды' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_link", (ctx) => {
  userStates[ctx.from.id].link = true;
  ctx.reply("Поле 'Ссылка' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_track", (ctx) => {
  userStates[ctx.from.id].track = true;
  ctx.reply("Поле 'Трек' выбрано.");
  ctx.answerCbQuery();
});

bot.action("update_team_confirm", (ctx) => {
  userStates[ctx.from.id].step = "awaiting_team_id";
  ctx.reply("Введите ID команды, которую хотите обновить.");
});

// Обработка текстовых сообщений
bot.on("text", async (ctx) => {
  const state = userStates[ctx.from.id];

  if (!state) {
    return ctx.reply("Пожалуйста, выберите действие.");
  }

  const text = ctx.message.text.trim();

  // Логика для удаления заявки
  if (state.action === "delete_order") {
    const result = await deleteOrder(text);
    if (result) {
      ctx.reply("Заявка успешно удалена.");
    } else {
      ctx.reply("Ошибка при удалении заявки.");
    }
    userStates[ctx.from.id] = {}; // Сброс состояния
  }

  // Логика для удаления команды
  if (state.action === "delete_team") {
    const result = await deleteTeam(text);
    if (result) {
      ctx.reply("Команда успешно удалена.");
    } else {
      ctx.reply("Ошибка при удалении команды.");
    }
    userStates[ctx.from.id] = {}; // Сброс состояния
  }

  // Логика для обновления заявки
  if (state.action === "update_order" && state.step === "awaiting_order_id") {
    userStates[ctx.from.id].id = text;
    ctx.reply("Теперь введите новые данные для выбранных полей.");
    state.step = "awaiting_fields";

    if (state.fio) {
      ctx.reply(
        "Введите новое ФИО (или оставьте пустым, если не нужно менять):"
      );
    } else if (state.phone_number) {
      ctx.reply(
        "Введите новый телефон (или оставьте пустым, если не нужно менять):"
      );
    } else if (state.email) {
      ctx.reply(
        "Введите новый email (или оставьте пустым, если не нужно менять):"
      );
    }
  } else if (state.step === "awaiting_fields") {
    const updateData = {};

    if (state.fio) updateData.fio = text;
    if (state.phone_number) updateData.phone_number = text;
    if (state.email) updateData.email = text;

    const result = await updateOrder(
      state.id,
      updateData.fio,
      updateData.phone_number,
      updateData.email
    );

    if (result) {
      ctx.reply("Заявка успешно обновлена.");
    } else {
      ctx.reply("Ошибка при обновлении заявки.");
    }
    userStates[ctx.from.id] = {}; // Сброс состояния
  }

  // Логика для обновления команды
  if (state.action === "update_team" && state.step === "awaiting_team_id") {
    userStates[ctx.from.id].id = text;
    ctx.reply("Теперь введите новые данные для выбранных полей.");
    state.step = "awaiting_team_fields";

    if (state.team_name) {
      ctx.reply(
        "Введите новое название команды (или оставьте пустым, если не нужно менять):"
      );
    } else if (state.link) {
      ctx.reply(
        "Введите новую ссылку (или оставьте пустым, если не нужно менять):"
      );
    } else if (state.track) {
      ctx.reply("Введите новый трек:");
    }
  } else if (state.step === "awaiting_team_fields") {
    const updateData = {};

    if (state.team_name) updateData.team_name = text;
    if (state.link) updateData.link = text;
    if (state.track) updateData.track = text;

    const result = await updateTeam(
      state.id,
      updateData.team_name,
      updateData.link,
      updateData.track
    );

    if (result) {
      ctx.reply("Команда успешно обновлена.");
    } else {
      ctx.reply("Ошибка при обновлении команды.");
    }
    userStates[ctx.from.id] = {}; // Сброс состояния
  }
});

// Запуск бота
bot.launch();
