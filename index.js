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

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345'
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: '39-23-6423122'
    }
]

const generateId = () => {
    return Math.round(Math.random() * 1000000000000000)
}
app.get('/info', (request, response) => {
    const info = `Phonebook has info for ${persons.length} people\n\n${new Date()}`
    response.send(info)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people.map(person => person.toJSON()))
        }
    )
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    const id = generateId()

    if (body.name && body.number) {
        if (persons.map(p => p.name).includes(body.name)) {
            res.status(400).json({
                error: 'name must be unique'
            })
        } else {
            const person = {
                id,
                name: body.name,
                number: body.number
            }
            persons.push(person)
            res.json(person)
        }
    } else {
        res.status(400).json({
            error: 'both name and number fields are necessary'
        })
    }
})

app.get('/api/persons/:id', (req, res) => {
    let id
    id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if (person)
        res.json(person)
    else
        res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
