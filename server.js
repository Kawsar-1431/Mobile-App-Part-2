const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs'); // Include the 'fs' module

const app = express();
const PORT = 3000;
let lessonCollection;
app.use(cors());

app.use(express.json());

const connectionString = 'mongodb+srv://Kawsar:123Kawsar@cluster0.tzpa46q.mongodb.net/Node-API?retryWrites=true&w=majority';
const client = new MongoClient(connectionString);

async function start() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        lessonCollection = client.db().collection('lessons');

        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

start();

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Your routes go here...
app.get('/', (req, res) => {
    res.send('Hello Node API');
});

app.get('/blog', (req, res) => {
    res.send('Hello Blog ok');
});

app.get('/lessons', async (req, res) => {
    try {
        const lessons = await lessonCollection.find({}).toArray();
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve a lesson by ID
app.get('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await lessonCollection.findOne({ _id: new ObjectId(id) });

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
        const result = await lessonCollection.insertOne(req.body);
        const lesson = await lessonCollection.findOne({ _id: result.insertedId });
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
        const result = await lessonCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: `Cannot find any lesson with ID ${id}` });
        }

        const updatedLesson = await lessonCollection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a lesson
app.delete('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await lessonCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: `Cannot find any lesson with ID ${id}` });
        }

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Additional route to handle lesson images
app.get('/lesson-images/:filename', (req, res) => {
    const { filename } = req.params;
    const lessonImagesDirectory = path.join(__dirname, 'lesson-images'); // Define the path
    const imagePath = path.join(lessonImagesDirectory, filename);

    // Check if the file exists
    if (fileExists(imagePath)) {
        // Serve the image
        res.sendFile(imagePath);
    } else {
        // Return an error message if the image file does not exist
        res.status(404).json({ message: 'Image not found' });
    }
});


// Helper function to check if a file exists
function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

app.use('/lesson-images', express.static(path.join(__dirname, 'lesson-images')));
