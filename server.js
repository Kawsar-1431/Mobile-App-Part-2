const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;


app.use(express.json());

const connectionString = 'mongodb+srv://Kawsar:123Kawsar@cluster0.tzpa46q.mongodb.net/Node-API?retryWrites=true&w=majority';
const client = new MongoClient(connectionString);

async function start() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

start();

// Rest of your code...


// Your routes go here...

app.get('/', (req, res) => {
    res.send('Hello Node API');
});

app.get('/blog', (req, res) => {
    res.send('Hello Blog ok');
});

app.get('/lessons', async (req, res) => {
    try {
        const lessons = await client.db().collection('lessons').find({}).toArray();
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve a lesson by ID
app.get('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await client.db().collection('lessons').findOne({ _id: new ObjectId(id) });

        if (!lesson) {
            return res.status(404).json({ message: `Cannot find any lesson with ID ${id}` });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post('/lessons', async (req, res) => {
    try {
        const result = await client.db().collection('lessons').insertOne(req.body);
        const lesson = await client.db().collection('lessons').findOne({ _id: result.insertedId });
        res.status(200).json(lesson);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});


// Update a lesson
app.put('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.db().collection('lessons').updateOne(
            { _id: new ObjectId(id) },  // Use new ObjectId(id)
            { $set: req.body }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: `Cannot find any lesson with ID ${id}` });
        }

        const updatedLesson = await client.db().collection('lessons').findOne({ _id: new ObjectId(id) });
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a lesson
app.delete('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.db().collection('lessons').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: `Cannot find any lesson with ID ${id}` });
        }

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
});

