require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())

//Database settings
const Person = require('./models/person')


app.get('/', (request, response) => {
  response.send('<h1>PhoneBook Backend</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(person => {
      response.json(person)
    })
})

const infoPage = (persons) => {
  return(`
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    </div>
  `)
}

app.get('/info', (request, response) => {
  Person.find({})
    .then(persons => response.send(infoPage(persons)) )
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person)
        response.json(person)
      else
        response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* const generateId = () => {
  return Math.floor(Math.floor(Math.random() * 1000000))
} */

morgan.token('body',  (req, res) => { return JSON.stringify(req.body)})

app.use(morgan(':method :url :response-time :body'))

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(body.name === undefined || body.number === undefined )
    return response.status(400).json({error: 'name or number missing'})

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savePerson => {
    response.json(savePerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number, 
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError')
  {
    return response.status(400).send({error: 'malformatted id'})
  }
  
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

