const mongoose = require("mongoose");

const DB =
  "mongodb+srv://vijayoffcl:N28cpDIRA2apKzY9@cluster0.16pmykl.mongodb.net/Authusers?retryWrites=true&w=majority";

mongoose
  .connect(DB, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.log(err);
  });
