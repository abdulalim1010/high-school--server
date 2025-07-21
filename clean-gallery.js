// clean-gallery.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.emeucb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

async function cleanGallery() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const galleryCollection = client.db('highSchool').collection('gallery');

    const updateResult = await galleryCollection.updateMany(
      { imageUrl: null },
      { $set: { imageUrl: "https://example.com/default-image.jpg" } }
    );
    console.log(`Updated ${updateResult.modifiedCount} gallery items with default imageUrl.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

cleanGallery();
