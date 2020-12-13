const mongoose = require('mongoose')

if (process.argv.length < 5) {
    console.error('Please provide the password, name and phone-number as arguments: node mongo.js <password> <name> <phone-number>')
    process.exit(1)
}

const password = process.argv[2]
const person_name = process.argv[3]
const person_number = process.argv[4]

db = 'phonebook-db'

const url = `mongodb+srv://cluster0_user:${password}@cluster0.1uspw.mongodb.net/${db}?retryWrites=true&w=majority`

mongoose.connect(url,
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
    .catch((error) => {
            console.error(error)
            process.exit(1)
        }
    )

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)
const person = new Person({
    name: person_name,
    number: person_number
})

const fetchALL = () => {
    Person.find({})
        .then(result => {
            console.log('phonebook:')
            result.forEach(person => {
                console.log(person.name, person.number)
            })

            return mongoose.connection.close()
        })
}

person.save()
    .then(result => {
        console.log(`added ${person_name} number ${person_number} to phonebook`)

        return fetchALL()
    })
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
