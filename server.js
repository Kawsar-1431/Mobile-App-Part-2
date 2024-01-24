// Import necessary modules
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs'); // Include the 'fs' module

// Create an Express app
const app = express();
const PORT = 3000;
let lessonCollection;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Use JSON middleware for parsing request bodies
app.use(express.json());

// MongoDB connection string
const connectionString = 'mongodb+srv://Kawsar:123Kawsar@cluster0.tzpa46q.mongodb.net/Node-API?retryWrites=true&w=majority';
const client = new MongoClient(connectionString);

// Function to start the server and connect to MongoDB
async function start() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        lessonCollection = client.db().collection('lessons');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

// Call the start function to initialize the server
start();

// Logger middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('Hello Node API');
});

app.get('/blog', (req, res) => {
    res.send('Hello Blog ok');
});

app.get('/lessons', async (req, res) => {
    try {
        // Fetch all lessons from the database
        const lessons = await lessonCollection.find({}).toArray();
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/lessons/:id', async (req, res) => {
    try {
        // Retrieve a lesson by ID from the database
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
        // Insert a new lesson into the database
        const result = await lessonCollection.insertOne(req.body);
        const lesson = await lessonCollection.findOne({ _id: result.insertedId });
        res.status(200).json(lesson);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

app.put('/lessons/:id', async (req, res) => {
    try {
        // Update a lesson in the database
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

app.delete('/lessons/:id', async (req, res) => {
    try {
        // Delete a lesson from the database
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
