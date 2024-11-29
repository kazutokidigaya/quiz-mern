import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URI);
    if (!res) console.log("Error Connecting DB");
    console.log("MongoDb Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDb;
