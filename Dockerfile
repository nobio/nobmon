#FROM node:18-alpine
FROM node:16 AS base-image

# Create app directory
WORKDIR /usr/src/app

RUN apt update
RUN apt upgrade -y
RUN apt install nmap -y

# take the package.json only
COPY package.json ./

# install dependencies (but only those needed for production)
RUN npm install --omit=dev

# Bundle app source
COPY --from=base-image ./ ./


CMD [ "npm", "start" ]
