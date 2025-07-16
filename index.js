const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.emeucb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let teachersCollection;
let usersCollection;


async function run() {
  try {
    await client.connect();
    const db = client.db('highSchool');
    teachersCollection = db.collection('teachers');
    usersCollection = db.collection('users');

    // Ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}
run().catch(console.dir);

// Routes
//users collection
app.get('/users', async (req, res) => {
  if (!usersCollection) {
    return res.status(500).json({ message: "Database not connected" });
  }
  try {
    const users = await usersCollection.find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users', error: err.message });
  }
});
//post user 
app.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ uid: userData.uid });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }
    // Insert new user
    const result = await usersCollection.insertOne(userData);
    res.status(201).json({ message: 'User saved', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save user', error: err.message });
  }
});



app.get('/teachers', async (req, res) => {
  try {
    if (!teachersCollection) {
      return res.status(500).json({ message: "Database not connected" });
    }
    const teachers = await teachersCollection.find().toArray();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get teachers', error: err.message });
  }
});

app.post('/teachers', async (req, res) => {
  try {
    if (!teachersCollection) {
      return res.status(500).json({ message: "Database not connected" });
    }
    const newTeacher = req.body;
    const result = await teachersCollection.insertOne(newTeacher);
    res.status(201).json({ message: 'Teacher added', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add teacher', error: err.message });
  }
});
//teacher details
app.get("/teachers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(id) });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teacher", error: err.message });
  }
});


app.get('/', (req, res) => {
  res.send('High School Server is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
