const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://kumbharpiyush01_db_user:mOa5NAdcOt33Hgmn@namastenode.izclixq.mongodb.net/DevTinder",
  );
};

module.exports = { connectDB };
