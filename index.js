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
let usersCollection;;
let submissionsCollection;
let galleryCollection;


async function run() {
  try {
    await client.connect();
    const db = client.db('highSchool');
    teachersCollection = db.collection('teachers');
    usersCollection = db.collection('users');
    articlesCollection = db.collection('articles');
    submissionsCollection = db.collection("gallery-submissions");
       galleryCollection = db.collection("gallery");
 // এখানে ভুল লাইন বদলে নিচের মত করো:
    await galleryCollection.updateMany(
      { imageUrl: null },
      { $set: { imageUrl: "default_image_url_here" } }
    );
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
//articles
app.get("/articles", async (req, res) => {
  const result = await articlesCollection.find().toArray();
  res.send(result);
});


app.patch("/articles/:id", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const result = await articlesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );
  res.send(result);
});


app.delete("/articles/:id", async (req, res) => {
  const id = req.params.id;
  const result = await articlesCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
//submission
app.get('/gallery', async (req, res) => {
  try {
    const galleryItems = await galleryCollection.find().toArray();
    res.status(200).json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch gallery items", error: error.message });
  }
});

// submissions collection route
app.post('/submissions', async (req, res) => {
  try {
    const data = req.body;
    const result = await submissionsCollection.insertOne(data);
    res.status(201).json({ message: 'Submission received', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save submission', error: error.message });
  }
});

app.get('/submissions', async (req, res) => {
  try {
    const submissions = await submissionsCollection.find().toArray();
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

// Approve Submission and Add to Gallery
app.patch('/submissions/approve/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const submission = await submissionsCollection.findOne({ _id: new ObjectId(id) });

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Use correct image field
    const imageUrl = submission.imageUrl || submission.image || null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Submission has no valid image URL" });
    }

    await galleryCollection.insertOne({
      title: submission.remarks || "No Title",
      imageUrl: imageUrl,
      submittedAt: submission.createdAt || new Date(),
      userEmail: submission.userEmail,
      userName: submission.userName,
    });

    await submissionsCollection.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "Submission approved and added to gallery" });
  } catch (error) {
    console.error("❌ Approval Error:", error);
    res.status(500).json({ message: "Failed to approve submission", error: error.message });
  }
});





app.delete('/submissions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await submissionsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete submission", error: error.message });
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

app.put('/users/:email', async (req, res) => {
  const email = req.params.email;
  const userData = req.body;

  try {
    const filter = { email: email };
    const updateDoc = { $set: userData };
    const options = { upsert: true };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save user', error: error.message });
  }
});


// Make Admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "admin" } }
      );
      res.send(result);
    });

    // Check Admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send({ isAdmin: user?.role === 'admin' });
    });
    app.patch('/users/block/:id', async (req, res) => {
  const id = req.params.id;
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });

  const newStatus = user?.status === "blocked" ? "active" : "blocked";

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: newStatus } }
  );

  res.send(result);
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
