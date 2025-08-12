const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.emeucb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

const client = new MongoClient(uri);

async function seedEvents() {
  try {
    await client.connect();
    const db = client.db("highSchool");
    const eventsCollection = db.collection("events");

    const events = [
      {
        title: "স্কুল লাইব্রেরি গবেষণা — সারাহ ময়া",
        date: "১৬ আগস্ট, ২০১৬",
        location: "স্কুল বিল্ডিং ৩য় তলা",
        description: "এই গবেষণায় শিক্ষার্থীরা বই এবং গবেষণার নতুন কৌশল শিখবে।",
        image: "https://via.placeholder.com/400x250?text=লাইব্রেরি+গবেষণা"
      },
      {
        title: "ভায়োলা ওয়ার্কশপ — মিসেস অ্যাঞ্জেলিনা",
        date: "১৫ আগস্ট, ২০১৬",
        location: "স্কুল বিল্ডিং ৩য় তলা",
        description: "ভায়োলার সুর এবং বাজানোর কৌশল শেখানো হবে।",
        image: "https://via.placeholder.com/400x250?text=ভায়োলা+ওয়ার্কশপ"
      },
      {
        title: "যোগা প্রশিক্ষণ — মিসেস এমিলি ফোস্টার",
        date: "২০ আগস্ট, ২০১৬",
        location: "স্কুল বিল্ডিং ৫ম তলা",
        description: "শারীরিক ও মানসিক সুস্থতার জন্য যোগা ট্রেনিং।",
        image: "https://via.placeholder.com/400x250?text=যোগা+প্রশিক্ষণ"
      },
      {
        title: "চিয়ারলিডার অডিশন — এনএফএল",
        date: "১২ আগস্ট, ২০১৬",
        location: "স্কুল পার্কিং হল",
        description: "চিয়ারলিডার দলে যোগ দেওয়ার জন্য অডিশন।",
        image: "https://via.placeholder.com/400x250?text=চিয়ারলিডার+অডিশন"
      },
      {
        title: "বাস্কেটবল প্রতিযোগিতা — স্কুল বনাম কলেজ",
        date: "২২ আগস্ট, ২০১৬",
        location: "স্কুল বাস্কেটবল স্টেডিয়াম",
        description: "রোমাঞ্চকর বাস্কেটবল ম্যাচ স্কুল ও কলেজের মধ্যে।",
        image: "https://via.placeholder.com/400x250?text=বাস্কেটবল+প্রতিযোগিতা"
      },
      {
        title: "ওয়েব ডিজাইন ওয়ার্কশপ — সাইমন সিনেক",
        date: "২৩ আগস্ট, ২০১৬",
        location: "স্কুল মাল্টিপারপাস হল",
        description: "ওয়েব ডিজাইনের মূল বিষয় শেখানো হবে।",
        image: "https://via.placeholder.com/400x250?text=ওয়েব+ডিজাইন"
      },
      {
        title: "জীববিজ্ঞান গবেষণা — হার্ভার্ড বিশ্ববিদ্যালয়",
        date: "২৪ আগস্ট, ২০১৬",
        location: "স্কুল বিল্ডিং ৫ম তলা",
        description: "আধুনিক জীববিজ্ঞানের গবেষণার ওপর কর্মশালা।",
        image: "https://via.placeholder.com/400x250?text=জীববিজ্ঞান+গবেষণা"
      },
      {
        title: "ইংরেজি বিনামূল্যে ক্লাস — স্পিকিং ও রিডিং",
        date: "২৫ আগস্ট, ২০১৬",
        location: "স্কুল বিল্ডিং ২য় তলা",
        description: "ইংরেজি ভাষায় কথা বলা ও পড়ার কৌশল শেখানো হবে।",
        image: "https://via.placeholder.com/400x250?text=ইংরেজি+ক্লাস"
      }
    ];

    const result = await eventsCollection.insertMany(events);
    console.log(`✅ ${result.insertedCount} টি ইভেন্ট যোগ হয়েছে`);
  } catch (error) {
    console.error("❌ ইভেন্ট যোগ করতে সমস্যা:", error);
  } finally {
    await client.close();
  }
}

seedEvents();
