// *importing 
import express from "express";
import mongoose from 'mongoose';
import MessageCollection from './dbMessages.js'
import {connectionUrl, pusher} from'./secureData.js';

// *app config
const app = express();
const port = process.env.PORT || 9000



// *middleware
app.use(express.json());
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
});


// *DB config

mongoose.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to db');

    const msgCollection = db.collection('messages');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
       if (change.operationType === 'insert'){
           const messageDetails = change.fullDocument;
           pusher.trigger('messages','inserted',{
               id:messageDetails._id,
               name:messageDetails.name,
               message:messageDetails.message,
               timestamp:messageDetails.timestamp,
               received:messageDetails.received
           });
       }else{
           console.log('Another operation type than insert');
       }

    });
});
// ???

// *api routes
app.get('/', (req, res) => res.status(200).send('hello world'));
app.get('/api/v1/messages', (req, res) => {
    MessageCollection.find((err, data) => {
        if (err) {
            res.status(501).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})
app.post('/api/v1/messages', (req, res) => {
    const message = req.body;
    MessageCollection.create(message, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
})
// *listen
app.listen(port, () => console.log(`listening on localhost:${port}`));