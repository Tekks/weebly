FROM node:18.7.0

RUN apt-get update && \
	apt-get purge -y --auto-remove

COPY . /usr/app
WORKDIR /usr/app

RUN npm install

VOLUME [ "/usr/app/db" ]
CMD ["npm", "--no-warnings", "start"]
