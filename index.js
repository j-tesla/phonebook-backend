require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const Person = require('./models/people');

const app = express();

app.use(express.static('build'));

app.use(express.json());

morgan.token('body', (req, res) => {
  const body = JSON.stringify(req.body);
  if (body === '{}') {
    return '-';
  }
  return body;
});
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :body',
));

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((people) => people.map((person) => person.toJSON()).length)
    .then((count) => {
      res.send(`Phonebook has info for ${count} people\n\n${new Date()}`);
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((people) => {
      res.json(people.map((person) => person.toJSON()));
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save()
    .then((savedPerson) => res.json(savedPerson.toJSON()))
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  const { id } = req.params;
  console.log(req.params.id);
  Person.findById(id)
    .then((person) => {
      if (person) {
        return res.json(person.toJSON());
      }
      return res.status(404).send({ error: 'requested resource not found' });
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;

  Person.findByIdAndUpdate(req.params.id, { number: body.number },
    {
      runValidators: true,
      new: true,
      context: 'query',
    })
    .then((person) => {
      if (person) {
        return res.json(person.toJSON());
      }
      return res.status(404).send({ error: 'requested resource not found' });
    })
    .catch((error) => next(error));
});

// unknown endpoint handler
app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  console.log(error);
  return res.status(500).send({ error: error.message });
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
