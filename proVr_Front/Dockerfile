# Используем официальный образ Node.js как базовый
FROM node:lts

# Устанавливаем рабочий каталог в /app
WORKDIR /app

# Копируем файлы package.json и yarn.lock в контейнер
COPY package*.json yarn.lock ./

# Устанавливаем зависимости при помощи Yarn
RUN yarn install

# Копируем исходный код приложения в контейнер
COPY . .

# Собираем React-приложение при помощи Yarn
RUN yarn build

# Копируем собранный код в каталог /app/build
RUN cp -r dist /app/build

# Устанавливаем порт, на котором будет работать приложение
EXPOSE 80

# Устанавливаем команду, которая будет запускать приложение
CMD ["yarn", "dev", "--host", "--port", "80"]