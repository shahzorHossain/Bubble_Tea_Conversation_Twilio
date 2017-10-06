const express = require('express');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');

const accountSID = 'AC87d8a93e0b51ec3f88631dd2d09ec347';
const authToken = '2b1c57ab90b954fe708e2cd6d05fb7f4';
var app = express();
var contexts = [];
var twilio = require('twilio');

app.get('/smsent', (req,res) => {
    var message = req.query.Body;
    var number = req.query.From;
    var twilioNumber = req.query.To;

    var context = null;
    var index = 0;
    var contextIndex = 0;
    contexts.forEach((value) => {
        console.log(value.from);
        if(value.from == number){
            context = value.context
            contextIndex = index

        }
        index = index + 1;

    })
    console.log("Received message from "+ number +" saying \""+message + "\"");

    var conversation = new ConversationV1({
        username: 'e098bee7-a5e4-440d-a27f-42f29735fba3',
        password: 'mH0QsinvGON3',
        version_date: ConversationV1.VERSION_DATE_2017_05_26
    })
    console.log(JSON.stringify(context))
    console.log(contexts.length)

    conversation.message({
        input: {text: message},
        workspace_id: 'bd168f5d-8390-4199-b8f4-dc24300a5472',
        context: context
    }, (err,response) => {
        if (err) {
            console.log (err);
        } else {
            console.log(response.output.text[0]);
            if (context == null){
                contexts.push({'from': number ,
                                 'context': context});
            } else {
                contexts[contextIndex].context = response.context
            }
        console.log(response);
        var intent = response.intents[0].intent;
        console.log (intent);
        if (intent == "done"){
            contexts.splice(contextIndex,1);
        }

        var client = new twilio(accountSID,authToken);
        client.messages.create({
            from: twilioNumber,
            to: number,
            body: response.output.text[0]
        }, (err, message) => {
            if (err) {
                console.log(err);
            }
        });
    }

    });
    res.send('');
});

const PORT = process.env.PORT || 8000
app.listen(PORT,(err) =>{
    if (err){
        console.log(err);
    }
    else{
        console.log("Successfully running on port " + PORT);
    }
});