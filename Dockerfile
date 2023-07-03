From node:20.3.1-alpine

COPY . /usr/app
WORKDIR /usr/app

RUN npm install

VOLUME [ "/usr/app/db" ]
CMD ["npm", "--no-warnings", "start"]
