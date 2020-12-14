const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URL
if (url === undefined) {
    console.log('error: environment variable MONGODB_URL is missing')
} else {
    console.log('connecting to', url)

    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
        .then(result => {
            console.log('connected to MongoDB')
        })
        .catch((error) => {
            console.log('error connecting to MongoDB:', error.message)
        })
}

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [3, 'should be at least 3 characters long'],
        required: [true, 'field is mandatory'],
        unique: [true, 'should be unique']
    },
    number: {
        type: String,
        minlength: [8, 'should be at least 8 digits long'],
        required: [true, 'field is mandatory']
    }
})
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)
module.exports = Person