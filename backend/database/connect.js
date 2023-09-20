const mongoose = require("mongoose");
const url="mongodb+srv://itzrohit:rohit6@ecommerce.tenbyh2.mongodb.net/librarysystum";

exports.connectDB = async () => {
  try {
    await mongoose.connect(url,{useNewUrlParser:"true",useUnifiedTopology:"true"});
    console.log("Database connected..");
  } catch (error) {
    console.log(error);
  }
};
