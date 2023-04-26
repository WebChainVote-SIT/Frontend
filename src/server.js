const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const VoterModel = require('./models/voter')
const AdminModel = require('./models/admin')
const electionName = require('./models/electionName');

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

mongoose.connect("mongodb+srv://vardh:vardh@cluster0.aggcl0r.mongodb.net/voters?retryWrites=true&w=majority", {
    useNewUrlParser: true,
});
//const voter = new VoterModel({ email: "vardh@gmail", password: "2133414" })
//VoterModel.insertMany(voter, function (error, docs) { });



app.post('/voter', (req, res) => {

    const email = req.body.email
    const pass = req.body.pass;
    const voter = new VoterModel({ email: req.body.email, password: req.body.pass })
    // console.log(req.body)
    // console.log(req.body.email);


    //const voter = new VoterModel(req.body);
    voter.save().then(() => {
        console.log("Success");
        res.redirect("http://localhost:3000/voting")
    }).catch((err) => {
        console.log(err);
    })
});

app.post('/admin', async (req, res) => {

    const email = req.body.email
    const pass = req.body.pass;
    const admin = new AdminModel({ email: req.body.email, password: req.body.password })


    const user = await AdminModel.findOne({ email: req.body.email });
    console.log(req.body.email)
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    if (user.password !== req.body.password) {
        return res.status(401).send({ message: 'Incorrect password' });
    }
    res.status(200).json({ message: 'Login successful' });


    // admin.save().then(() => {
    //     console.log("Success");
    //     res.redirect("http://localhost:3000/adminPanel")
    // }).catch((err) => {
    //     console.log(err);
    // })
});

//Add election
app.get('/api/electionName', function (req, res) {
    var electionNames = []
    var electionOrganizers = []
    var electionIds = []
    var final = []
    electionName.find({}).then(eachOne => {
        for (i = 0; i < eachOne.length; i++) {
            electionNames[i] = eachOne[i].election_name;
            electionOrganizers[i] = eachOne[i].election_organizer;
            electionIds[i] = eachOne[i].election_id;
            final.push({
                'election_id': eachOne[i].election_id,
                'election_organizer': eachOne[i].election_organizer,
                'election_name': eachOne[i].election_name
            })
        }
        res.send(final);
    })
})

app.post('/api/electionName', async function (req, res) {
    electionName.create({
        election_id: Math.floor(Math.random() * 100),
        election_name: req.body.election_name,
        election_organizer: req.body.election_organizer,
        election_password: req.body.election_password,
    }).then(election => {
        res.json(election);
    });
});

app.listen(3001, () => {
    console.log("Server running on port 3001")
});