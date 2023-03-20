/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const prompt = "Ciao, sono Chat G. P. T. come posso aiutarti?";
const openaiApiKey = 'INSERISCI LA CHIAVE';
const organization = 'INSERISCI ORGANIZATION ID';
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: organization,
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

var resultit='';

const getChatGPTResponse = async (query) => {
  const response = await openai.createChatCompletion({
    "model": "gpt-3.5-turbo",
    "max_tokens": 99,
    "messages": [{"role": "user", "content": query}]
  });
  return response.data.choices[0].message.content;
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const speakOutput = prompt;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const ChatGPTIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChatGPTIntent';
  },
  async handle(handlerInput) {
    const userInput = handlerInput.requestEnvelope.request.intent.slots.userInput.value;
    const response = await getChatGPTResponse(userInput);
    resultit = response;
    return handlerInput.responseBuilder
      .speak(response + ".  Se vuoi che continui, puoi dirmi continua")
      .reprompt("oppure puoi farmi un'altra domanda")
      .getResponse();
  }
};

const ContinueIntentHandler = {
    canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContinueIntent';
  },
  async handle(handlerInput){
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const lastResult = sessionAttributes.lastResult || 'input initial';
    const result = await getChatGPTResponse("Ho bisogno di sapere di più su" + resultit);
    sessionAttributes.lastResult += result;
    resultit += " " + result
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(result + ".  Se vuoi che continui, puoi dirmi continua")
      .withShouldEndSession(false)
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error: ${error.message}`);
    const speakOutput = `Error: ${error.message}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
      const speakOutput = 'Puoi chiedere qualcosa! Come posso aiutare?';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
              || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
              || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
      const speakOutput = 'Arrivederci!';

      return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
  }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        ChatGPTIntentHandler,
        ContinueIntentHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();