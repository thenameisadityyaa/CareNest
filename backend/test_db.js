const mongoose = require('mongoose');
const uri = "mongodb+srv://dbAdmin:SVuX4fvdWdduFGZx@carenest.fev6mij.mongodb.net/?appName=CareNest";

console.log("Testing connection to MongoDB Atlas...");
mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE: Could not connect to MongoDB Atlas.");
    console.error(err);
    process.exit(1);
  });
