#FROM node:18-alpine
#FROM node:16 AS base-image
#FROM node:24-alpine AS base-image
FROM node:lts-alpine3.22 AS base-image

# Create app directory
WORKDIR /usr/src/app

RUN apk --no-cache add curl

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
