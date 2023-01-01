// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'test';

const express = require('express'),
    app = express(),
    fs = require('fs');

const jsonParser = express.json();

const host = '127.0.0.1';
const port = 7000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let file = 'data.json';

if ((process.env.NODE_ENV = 'test')) file = 'data-test.json';

app.use((req, res, next) => {
    fs.readFile(file, (err, data) => {
        if (err)
            return res.status(500).send({message: 'Error while getting users'});

        req.users = JSON.parse(data);

        next();
    });
});

app.get('/api/v1/users/:id', (req, res) => {
    const user = req.users.find((c) => c.id === +req.params.id);

    if (!user) {
        res.sendStatus(404);
        return;
    }
    return res.status(200).json(user);
});

app.get('/api/v1/users', (req, res) => {
    let users = req.users;

    if (req.query.name) {
        users = users.filter((u) => u.name.indexOf(req.query.name) > -1);
    }

    res.json(users);
});

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
