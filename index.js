require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/people')

const app = express()

app.use(express.static('build'))

app.use(express.json())

morgan.token('body', function (req, res) {
    const body = JSON.stringify(req.body)
    if (body === '{}')
        return '-'
    else
        return body
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/info', (req, res, next) => {
    Person.find({})
        .then(people => {
            res.send(`Phonebook has info for ${people.map(person => person.toJSON()).length} people\n\n${new Date()}`)
        })
        .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(people => {
            res.json(people.map(person => person.toJSON()))
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (body.name && body.number) {
        const person = new Person({
            name: body.name,
            number: body.number
        })
        person.save()
            .then(savedPerson => {
                return res.json(savedPerson.toJSON())
            })
            .catch(error => next(error))

    } else {
        return res.status(400).json({
            error: 'both name and number fields are necessary'
        })
    }
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    console.log(req.params.id)
    Person.findById(id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else
                return res.status(404).send({error: 'requested resource not found'})
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    if (body.name && body.number) {
        const updatedPerson = {
            name: body.name,
            number: body.number
        }
        Person.findByIdAndUpdate(req.params.id, updatedPerson, {new: true})
            .then(person => {
                if (person)
                    res.json(person.toJSON())
                else
                    return res.status(404).send({error: 'requested resource not found'})
            })
            .catch(error => next(error))
    } else {
        return res.status(400).json({
            error: 'both name and number fields are necessary'
        })
    }
})

// TODO middleware for error handling and unidentified requests
const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).send({error: 'malformatted id'})
    }

    console.log(error)
    return res.status(500).send({error: `${error.name}: ${error.message}`})
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
