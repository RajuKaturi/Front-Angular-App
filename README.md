Server Project

# Prerequisites
* You must have docker installed locally for testing: https://www.docker.com/products/overview

# Quick Start
1. npm install
2. On MacOS or Linux, run the app with this command:
   $ DEBUG=ifgather:* npm run start:local

   On Windows, use this command:
   set DEBUG=ifgather:* & npm run start:local
3. Then load http://localhost:4000/ in your browser to access the app.

# Notes

`npm start` will default to the `config/development.json` config file. It will not start a docker
container with MongoDB, so you need to have a local mongoDB server running.

`npm run start:local` will default start with `NODE_ENV=local`, which will load the `config/local.json`
 configuration file and it will run MongoDB in a docker container, so you don't have to worry about
 setting that up - you just need `docker` working properly on your local system. Local mode will
 also start the server using NodeMon, so it will autorestart the server as you save changes to your code.

`npm run docker:stop` will run `docker-compose down`, which deletes the docker instance of Mongo
  that was created. Next time you run `npm run start:local`, you'll have a fresh instance of docker.

Docker is exposing the mongoDb container on port: `27777`. You can connect to it on `localhost:27777`
  if you're using a tool like RoboMongo.

`.editorconfig` is setup. If webstorm asks you to ignore this file, DO NOT. Please comply with the
settings by not disabling this feature.
