const express = require("express");
const ConversationV1 = require("watson-developer-cloud/conversation/v1");
const keys = require("./config/keys");

const accountSID = keys.watsonAccountSID;
const authToken = keys.watsonAuthToken;
var app = express();
var contexts = [];
var twilio = require("twilio");

app.get("/smssent", (req, res) => {
  var message = req.query.Body;
  var number = req.query.From;
  var twilioNumber = req.query.To;

  var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(value => {
    console.log(value.from);
    if (value.from == number) {
      context = value.context;
      contextIndex = index;
    }
    index = index + 1;
  });
  console.log("Received message from " + number + ' saying "' + message + '"');

  var conversation = new ConversationV1({
    username: keys.conversationUsername,
    password: keys.conversationPassword,
    version_date: ConversationV1.VERSION_DATE_2017_05_26
  });
  console.log(JSON.stringify(context));
  console.log(contexts.length);

  conversation.message(
    {
      input: { text: message },
      workspace_id: keys.conversation_workspace_id,
      context: context
    },
    (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log(response.output.text[0]);
        if (context == null) {
          contexts.push({
            from: number,
            context: response.context
          });
        } else {
          contexts[contextIndex].context = response.context;
        }
        console.log(response);
        var intent = response.intents[0].intent;
        console.log(intent);
        if (intent == "done") {
          contexts.splice(contextIndex, 1);
        }

        var client = new twilio(accountSID, authToken);
        client.messages.create(
          {
            from: twilioNumber,
            to: number,
            body: response.output.text[0]
          },
          (err, message) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  );
  res.send("");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully running on port " + PORT);
  }
});
