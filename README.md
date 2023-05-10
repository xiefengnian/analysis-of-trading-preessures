# USAGE

## dev

0. run a mongodb

ref: https://hub.docker.com/_/mongo

```shell
docker run -itd --name my-mongo -p 27017:27017 mongo --auth
docker exec -it my-mongo mongosh admin
```

in mongosh

```js
db.createUser({user:'root',pwd:'root',roles:[{role:'root',db:'admin'}]});
db.auth('root','root')
use stress_monitor
db.createuser({user:'test',pwd:'test',roles:[{role:'readWrite',db:'stress_monitor'}]})
```

1. start server

```shell
npm dev
```

2. start web app dev

```shell
cd web
npm i && npm start
```

## build

1. build with docker

```shell
bash ./build.sh
```

##
