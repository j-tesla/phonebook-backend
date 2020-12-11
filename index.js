const express = require('express')
const app = express()

app.use(express.json())

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
    res.json(persons)
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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
