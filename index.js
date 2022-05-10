const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json())
app.use(express.static('build'))


let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '044-0121200'
    },
    {
        id: 2,
        name: 'Ada lovelace',
        number: '554-078800'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '170-99988212'
    }
];

morgan.token('body', req => {
    return JSON.stringify(req.body)
})
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

 app.use(requestLogger)


const generateId = () => {
    let numRandom = Math.floor(Math.random() * 1000);

    persons.forEach(({id}) => {
        numRandom = id !== numRandom 
        ? numRandom : numRandom + (numRandom / 2);
    });

    return numRandom
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`
        Phonebook has info for ${persons.length} people
        <br>
        <br>
        ${new Date()}
    `)
})

app.get('/api/persons/:id', (request, response) => {
    const {id} = request.params;
    const person = persons.find(person => person.id === Number(id));
    person ? response.json(person) : response.status(404).end();
})

app.delete('/api/persons/:id', (request, response) => {
    const {id} = request.params;
    const len = persons.length;
    persons = persons.filter(person => person.id !== Number(id));

    persons.length === len ? response.status(404).end() 
    : response.status(204).end();
});

app.post('/api/persons', (request, response) => {
    let {name, number} = request.body;

    if(!number || !name || JSON.stringify(persons).includes(name)){
        return response.status(400).json({
            error: !name ? 'name is missing' 
            : !number ? 'number is missing' 
            : 'name must be unique'
        })
    } 
    
    const newPerson = {
        id: generateId(),
        name,
        number
    };

    persons = persons.concat(newPerson);
    response.json(newPerson);
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
})