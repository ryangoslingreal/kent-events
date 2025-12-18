#Uses  node version 22 as our base image
FROM node:22-slim

#Goes to app directory
WORKDIR /app

#Copy package json and package-lock json
COPY package*.json ./

#Install app dependencies
RUN npm install

#Copy rest of the App into the container
COPY . .    

#Set port enviroment variable
ENV PORT=9000

#Exposes Port
EXPOSE 9000

#Run the app
CMD ["npm", "run", "dev"]