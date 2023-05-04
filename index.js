const app = require ('./src/app');


const port = process.env.PORT || 5000;

app.listen(port);

console.log('Server on port', app.get('port'));