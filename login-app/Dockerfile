# official Node.js image. Using latest versison
FROM node:20

WORKDIR /usr/src/app

# copy the dependency file
COPY package*.json ./

# install all the dependencies
RUN npm install

# Copy the application code to the working directory.
COPY . .

# expose the port
EXPOSE 3000

CMD ["node", "app.js"]

