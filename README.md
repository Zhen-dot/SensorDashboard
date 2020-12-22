# sensordashboard-vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Running order
```
1.
dummy_sensors.js >> Runs dummy sensors, outputs results via mqtt to localhost

2.
module.js >> Runs server on port 4000, listens to broker post requests and readings get requests

3.
broker.js >> Runs mosquitto topic subscriber & posts results to module to be stored

4.
App.vue >> Starts server on port 3000 to serve clients
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
