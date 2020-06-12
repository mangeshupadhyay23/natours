const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection Successful');
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
