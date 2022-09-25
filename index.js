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

const infoPage = () => {
  return(`
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    </div>
  `)
}

app.get('/info', (request, response) => {
  response.send(infoPage())
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
  .then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  
  if(persons.find((person) => person.id === id)){
    persons = persons.filter(person => person.id != id)
    response.status(204).end()
  }
  else
    response.send(`The source doesn't exist`)
  
})

const generateId = () => {
  return Math.floor(Math.floor(Math.random() * 1000000))
}

morgan.token('body',  (req, res) => { return JSON.stringify(req.body)})

app.use(morgan(':method :url :response-time :body'))

app.post('/api/persons', (request, response) => {
  const body = request.body

  if((!body.name || !body.number)) {
    return response.status(400).json({
      error:'Missing name or number'
    })
  }

  if((persons.find(person => person.name === body.name)))
    return response.status(405).json({error: 'name must be unique'})

  const person = {
    "id": generateId(),
    "name": body.name,
    "number": body.number
  }

  persons = persons.concat(person)

  response.json(persons)
})



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

