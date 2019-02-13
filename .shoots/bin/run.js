const app = require('../app.js')
app.listen(process.env.PORT || 3000);

console.log(`Server up and running! On port ${process.env.PORT || 3000}!`);
