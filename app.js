const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", require("./routes/userRoutes"));
app.use("/product", require("./routes/productRoutes"));
app.use("/category", require("./routes/categoryRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/order", require("./routes/orderRoutes"));
app.use("/api/mutual-funds", require("./routes/mutualFundRoutes"));
app.use("/wishlist", require("./routes/wishlistRoutes"));
app.use("/address", require("./routes/addressRoutes"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server starting and running at ${PORT}`);
});