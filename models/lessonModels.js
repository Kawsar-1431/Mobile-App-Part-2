const mongoose = require('mongoose')

const lessonSchema = mongoose.Schema(
    {
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
               type:Number,
               required: true,
          },
          image: {
               type: String,
               required: false,
          },
          location: {
            type: String,
            required: [true, "Please enter location for lesson"]

          
    },
},

        {
            timestamps: true
            
        }
          




    
)
 const lesson = mongoose.model('lesson',lessonSchema);

 module.exports = lesson;