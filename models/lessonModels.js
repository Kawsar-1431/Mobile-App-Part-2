// Import MongoDB ObjectId
const { ObjectId } = require('mongodb');

// Lesson schema definition
const lessonSchema = {
    name: {
        type: String,
        required: [true, "Please enter a lesson name"]
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: [true, "Please enter location for lesson"]
    }
};

// Export functions related to lesson operations
module.exports = {
    createLesson: (lessonCollection, lessonData) => {
        return lessonCollection.insertOne(lessonData);
    },

    getLessons: (lessonCollection) => {
        return lessonCollection.find({}).toArray();
    },

    getLessonById: (lessonCollection, lessonId) => {
        return lessonCollection.findOne({ _id: new ObjectId(lessonId) });
    },

    updateLesson: (lessonCollection, lessonId, updateData) => {
        return lessonCollection.updateOne(
            { _id: new ObjectId(lessonId) },
            { $set: updateData }
        );
    },

    deleteLesson: (lessonCollection, lessonId) => {
        return lessonCollection.deleteOne({ _id: new ObjectId(lessonId) });
    }
};
