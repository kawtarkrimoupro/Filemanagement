# FileManagement

Node Application for file upload and download (with compression).

## running instruction 

To run the project : nom run start
To run the project developement mode : npm run start:dev
To run unit test : npm run test


## modules used 

Nodejs, Express, Sequelize, Mullter

## .env file

PORT=3000 (Port that will be used for the server)
ENV=test (test or development if test the auth middleware will be ignored so uploads or downloads could be done without authentication).

## Config file 

Configuration file is separated to 3 different parts :

1 - Applications : [
    {
        name of the application,
        id of the application,
        Absolute path where we will store the file uploaded for the application (the folders should be set up manualy except the application forlder)
        for ex : /home/xox/test/myHSE/ (/home/xox/test, need to be created manualy), but the (/myHSE it's handled by the app, if it's not created manually the application will create it).
    }
]

2 - settings : {
    maxFileUpload : is the max number that a user can upload in a single request,
    usersApi : the URL for the users Api (used for check user token during upload and download).
}

3 - database_settings : {
    dbName : database name (should be created manually).
    username : username that sequelize will use to connect to database.
    password : password that sequelize will use to connect to database.ee
    host : Url for the database.
    dialect : dialect that sequelize will us to talk with the database and       construct it's query's.
}

## Routes All Routes should be given a header {token : "Token content"} for authentication purposes

### POST : "/upload/:app" for example /upload/1 to upload to application 1 storage.
    Content : "file": an array of files to upload, should be form-data content (Multer can only handle form-data content).
    Response : {
        newFileName : fileName of the new uploaded file *(should be storage to be given in the download section).
    }

### POST : "/download"
    Content : {
        appId : application id from which we want to download,
        fileName : FileName we want to download (response of the upload section)
    }


### Dockerizing 
create a server.js file that defines a web app using the Express.js framework:

### Creating a Dockerfile
Create an empty file called Dockerfile:

-- touch Dockerfile
Inside 
FROM node:12
Next we create a directory to hold the application code inside the image, this will be the working directory for your application:

# Create app directory
This image comes with Node.js and NPM already installed so the next thing we need to do is to install your app dependencies using the npm binary. Please note that if you are using npm version 4 or earlier a package-lock.json file will not be generated.

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
Note that, rather than copying the entire working directory, we are only copying the package.json file. This allows us to take advantage of cached Docker layers. bitJudo has a good explanation of this here. Furthermore, the npm ci command, specified in the comments, helps provide faster, reliable, reproducible builds for production environments. You can read more about this here.

To bundle your app's source code inside the Docker image, use the COPY instruction:

# Bundle app source
COPY . .
Your app binds to port 8080 so you'll use the EXPOSE instruction to have it mapped by the docker daemon:

EXPOSE 8080
Last but not least, define the command to run your app using CMD which defines your runtime. Here we will use node server.js to start your server:

CMD [ "node", "server.js" ]
Your Dockerfile should now look like this:

FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]


# .dockerignore file
Create a .dockerignore file in the same directory as your Dockerfile with following content:

node_modules
npm-debug.log
This will prevent your local modules and debug logs from being copied onto your Docker image and possibly overwriting modules installed within your image.

# Building your image
Go to the directory that has your Dockerfile and run the following command to build the Docker image. The -t flag lets you tag your image so it's easier to find later using the docker images command:

docker build -t <your username>/node-web-app .
Your image will now be listed by Docker:

$ docker images



docker run -p 49160:8080 -d <your username>/node-web-app
Print the output of your app:

# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>

# Example
Running on http://localhost:8080  ##jenkins
If you need to go inside the container you can use the exec command:

# Enter the container
$ docker exec -it <container id> /bin/bash
Test
To test your app, get the port of your app that Docker mapped:

$ docker ps

