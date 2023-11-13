#FROM node:18-alpine
#FROM node:16 AS base-image
FROM node:18-alpine AS base-image

# Create app directory
WORKDIR /usr/src/app

#RUN apt update; \
#    apt upgrade -y; \
#    apt install nmap -y

# take the package.json only
COPY package.json ./

# install dependencies (but only those needed for production)
RUN npm install --omit=dev
COPY . .

# switch to alpine
##FROM node:alpine
RUN apk add nmap

##WORKDIR /usr/src/app
##COPY --from=base-image /usr/src/app /usr/src/app
CMD [ "npm", "start" ]
