'use strict'

const config = require('../../services/config');
const axios = require('axios');


const { accountSid, authToken } = config.twilio;
const client = require('twilio')(accountSid, authToken);

const TWILIO_WORKSPACE_SID = 'WS69927d878405ad5ee52c7ede7ef7dc8f';
const TWILIO_WORKFLOW_SID = 'WWb51c8f5d8c4801ed5dd32b91bfb493a5';
const TWILIO_CHAT_SERVICE_SID = 'IS015edca31b264901ad0704be93a59df8';


const twilio = client;
const chatService = twilio.chat.services(TWILIO_CHAT_SERVICE_SID);
const taskrouterService = twilio.taskrouter.v1.workspaces(TWILIO_WORKSPACE_SID);

const whatsappServices = require('../../services/whatsapp')

// let prom = [];
// setTimeout(() => {
//   console.log('starting')
  
//   chatService.channels.each(channel => {
//     console.log(channel.sid)
//     prom.push(chatService.channels(channel.sid).remove())
//   })
// }, 5000);

// setTimeout(() => {
//   console.log('to remove')
//   Promise.all(prom).then(() => {
//     console.log('REMOVED')
//   }).catch((err)=> console.log(err))
// }, 15000);



function getChannelAttrs(from, to) {
  return {
        text: "Nueva comunicacion por Whatsapp",
        channelName: "chat",
        from, 
        to
      };
}




exports.subscribe = function(req, res) {
  console.log('adding member')
  
  let newMember = req.params.worker;



  console.log('====================================');
  console.log(newMember);
  console.log('====================================');
  let toRemove = []
  let currents = [];
  chatService.channels(req.params.channel).members.each((member) => {
    console.log(member)
    currents.push(member);
  })
  setTimeout(() => {
    currents.map((item) => {
      toRemove.push(chatService.channels(req.params.channel).members.get(item.sid).remove())
    })  
  }, 500);

  setTimeout(() => {
    Promise.all(toRemove).then((response) => {
      console.log('====================================');
      console.log("All removed");
      console.log('====================================');
      chatService.channels(req.params.channel).members.create({
        identity: newMember,
        attributes: JSON.stringify({})
      })
      .then(() => {
        res.status(200).send(newMember)
      })
      .catch(err => {
        if(err.code == 50404) {
          console.log('user is already member of this chat')
          res.status(200).send({})
          return
        }
        console.error(`unable to add a member to the channel`,err);
        res.status(500).send("")
      });
    })
  }, 1200);
  
}

exports.messages = function(req, res) {
  chatService.channels(req.body.ChannelSid).fetch().then((channel) => {
    let {from, to } = JSON.parse(channel.attributes);

    let  data = { number: from.replace('whatsapp:+', ''), text: req.body.Body }
    whatsappServices.sendMessage(data)
    .then((response) => {
      return res.status(200).send(channel)
    }).catch(err => {
      console.log('===============ERROR AL ENVIAR WP=====================');
      console.log(err);
      console.log('====================================');
    })
  })

  

}


exports.task = function(req, res) {

    
  WhatsappInteraction(req.body)
  .then((task) => {
    console.log('====================================');
    console.log(task);
    console.log('====================================');
    res.status(200).send(task)
  })
  .cath((err) => {
    console.log('=============ERROR=======================');
    console.log(err);
    console.log('====================================');
  })
  

};

const WhatsappInteraction = (payload) => {
    return new Promise((resolve, reject) => {
      const { From, To, Body } = payload;
      const attrs = getChannelAttrs(From, To);

      getOrCreateChatChannel(From, To, attrs)
        .then(channel =>
          getOrCreateOngoingTasks(From, channel.sid).then(task => {
            return { task, channel };
          })
        )
        .then(({ task, channel }) => {
          return sendMessage(channel, From, Body).then(message => {
            return { task, channel, message };
          });
        })
        .then(({ task, channel, message }) => {
          const msg = `new message received from ${ message.from } with: chatChannelSid ${channel.sid}, taskSid:${task.sid}`;
          console.log(msg)
          return resolve(task)
        })
        .catch(err => {
          console.error(err);
          return reject(err)
        });
    })
}



function sendMessage(channel, from, body) {
  return chatService.channels(channel.sid).messages.create({ from, body, attributes: JSON.stringify({ source: "inbound" })})
  .then(message => {
    return message;
  });
}

function getOrCreateChatChannel(from, to, attrs) {
  const name = from.replace(/[^\w:]/gi, "");
  console.log(name)
  const uniqueName = `${attrs.channelName}_channel_${name}`;
  const channelAttributes = { from, to, type: 'public' };

  return fetchChannel(uniqueName, channelAttributes).catch(err => {

    return createNewChatChannel(uniqueName, channelAttributes).then(channel => {
      return channel
    })
    .catch(err => {
      console.log('===============CHAT CREATE=====================');
      console.log(err);
      console.log('====================================');
      if (err.code === 50307) {
        console.log('====================================');
        console.log('Al ready created', err);
        console.log('====================================');
        return fetchChannel(uniqueName, channelAttributes).then(channel => addMemberToChannel(channel, from, attrs));
      }
      throw new Error(`Unable to create a chat channel`);
    });
  });

}

function createNewChatChannel(uniqueName, channelAttributes) {
  return chatService.channels.create({ uniqueName, attributes: JSON.stringify(channelAttributes) }).then(channel => addMemberToChannel(channel, from, {} ));
}

function fetchChannel(uniqueName, channelAttributes) {
  const channelService = chatService.channels(uniqueName);
  return channelService.fetch().then(channel => {
    return channelService
      .update({ attributes: JSON.stringify(channelAttributes) })
      .then(() => channel);
  });
}

function addMemberToChannel(channel, identity, attrs) {
  return chatService.channels(channel.sid).members.create({ identity: identity, attributes: JSON.stringify(attrs)})
    .then(member => channel)
    .catch(err => {
      console.error(`unable to add a member to the channel ${channel.uniqueName}`,err);
      return channel;
    });
}

function getOrCreateOngoingTasks(from, channelSid) {
  let query = {
    assignmentStatus: "pending,assigned,reserved",
    evaluateTaskAttributes: `(identity=='${from}') OR (channelSid=='${channelSid}')`
  };
  return taskrouterService.tasks.list(query).then(tasks => tasks.length < 1 ? createTask(from, channelSid) : tasks[0] );
}

function createTask(from, channelSid) {

  const data = {
    workflowSid: TWILIO_WORKFLOW_SID,
    taskChannel: 'chat',
    timeout: 2500,
    attributes: JSON.stringify({
      name: from,
      channelSid: channelSid || "default",
      channelType: 'whatsapp',
    })
  };

  return taskrouterService.tasks.create(data);
}


exports.interaction = WhatsappInteraction;