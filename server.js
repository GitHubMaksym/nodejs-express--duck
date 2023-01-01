// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'test';

const express = require('express'),
    app = express(),
    fs = require('fs');

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

app.route('/api/users')
    .get((req, res) => {
        if (req.query.id) {
            if (req.users.hasOwnProperty(req.query.id))
                return res.status(200).send({data: req.users[req.query.id]});
            else return res.status(404).send({message: 'User not found.'});
        } else if (!req.users)
            return res.status(404).send({message: 'Users not found.'});

        return res.status(200).send({data: req.users});
    })
    .post((req, res) => {
        if (req.body.user && req.body.user.id) {
            if (req.users.hasOwnProperty(req.body.user.id))
                return res.status(409).send({message: 'User already exists.'});

            req.users[req.body.user.id] = req.body.user;

            fs.writeFile(file, JSON.stringify(req.users), (err, response) => {
                if (err)
                    return res
                        .status(500)
                        .send({message: 'Unable create user.'});

                return res.status(200).send({message: 'User created.'});
            });
        } else return res.status(400).send({message: 'Bad request.'});
    })
    .put((req, res) => {
        if (req.body.user && req.body.user.id) {
            if (!req.users.hasOwnProperty(req.body.user.id))
                return res.status(404).send({message: 'User not found.'});

            req.users[req.body.user.id] = req.body.user;

            fs.writeFile(file, JSON.stringify(req.users), (err, response) => {
                if (err)
                    return res
                        .status(500)
                        .send({message: 'Unable update user.'});

                return res.status(200).send({message: 'User updated.'});
            });
        } else return res.status(400).send({message: 'Bad request.'});
    })
    .delete((req, res) => {
        if (req.query.id) {
            if (req.users.hasOwnProperty(req.query.id)) {
                delete req.users[req.query.id];

                fs.writeFile(
                    file,
                    JSON.stringify(req.users),
                    (err, response) => {
                        if (err)
                            return res
                                .status(500)
                                .send({message: 'Unable delete user.'});

                        return res.status(200).send({message: 'User deleted.'});
                    }
                );
            } else return res.status(404).send({message: 'User not found.'});
        } else return res.status(400).send({message: 'Bad request.'});
    });

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
