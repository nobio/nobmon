# 20 is LTS version. For arm7 32bit there is no newer version available, so we will use 22 for all builds
FROM node:20-alpine AS base-image

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# take the package.json only
COPY package.json ./

# install dependencies (but only those needed for production)
RUN npm install --omit=dev
COPY . .

# switch to debian
##FROM node:bookworm
RUN apt-get update && apt-get install -y nmap && rm -rf /var/lib/apt/lists/*

##WORKDIR /usr/src/app
##COPY --from=base-image /usr/src/app /usr/src/app
CMD [ "npm", "start" ]
