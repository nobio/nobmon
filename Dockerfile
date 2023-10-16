#FROM node:18-alpine
FROM node:20

# Create app directory
WORKDIR /usr/src/app

RUN apt update
RUN apt upgrade -y
RUN apt install nmap -y

# take the package.json only
COPY package.json ./

# install dependencies (but only those needed for production)
#RUN npm install --omit=dev
RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
