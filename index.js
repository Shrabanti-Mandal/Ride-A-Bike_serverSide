const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95hki.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("ride-a-bike");
    const bikeCollection = database.collection("bikes");
    const orderCollection = database.collection("booking");
    const usersCollection = database.collection("users");

    const reviewCollection = database.collection("review");

    //get api
    app.get("/bikes", async (req, res) => {
      const cursor = bikeCollection.find({}).limit(6);
      const bikes = await cursor.toArray();
      res.send(bikes);
    });
    app.get("/allBikes", async (req, res) => {
      const cursor = bikeCollection.find({});
      const bikes = await cursor.toArray();
      res.send(bikes);
    });

    app.get("/myBooking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const cursor = orderCollection.find(query);
      const myBooking = await cursor.toArray();
      res.send(myBooking);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //post api
    app.post("/bikes", async (req, res) => {
      const bike = req.body;
      const result = await bikeCollection.insertOne(bike);
      console.log(result);
      res.json(result);
    });

    app.post("/createBooking", async (req, res) => {
      const newAddBooking = req.body;
      const result = await orderCollection.insertOne(newAddBooking);

      res.json(result);
    });

    app.post("/reviews", async (req, res) => {
      const newAddReview = req.body;
      const result = await reviewCollection.insertOne(newAddReview);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
      console.log(result);
    });

    //delete api

    app.delete("/myBooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const myBooking = await orderCollection.deleteOne(query);
      res.send(myBooking);
    });

    //delete api

    app.delete("/allBikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const allBikes = await bikeCollection.deleteOne(query);
      res.send(allBikes);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };

      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Bikers!");
});

app.listen(port, () => {
  console.log(`listening at : ${port}`);
});
