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
  let newMember = req.params.worker;
  let toRemove = []
  let currents = [];
  console.log('New Member', newMember);
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
  }, 1500);
  
}

exports.messages = function(req, res) {
  chatService.channels(req.body.ChannelSid).fetch().then((channel) => {
    let {from, to } = JSON.parse(channel.attributes);

    whatsappServices.sendMessage({ number: from.replace('whatsapp:', ''), text: req.body.Body })
    .then((response) => {
      return res.status(200).send(channel)
    }).catch(err => {
      console.log(err);
      return res.status(500).send(err)
    })
  })

  

}


exports.task = function(req, res) {
  WhatsappInteraction(req.body, res)
};


const WhatsappInteraction = (payload, res) => {
    const { From, To, Body } = payload;
    const attrs = getChannelAttrs(From, To);

    getOrCreateChatChannel(From, To, attrs)

      .then(channel => getOrCreateOngoingTasks(From, channel.sid).then(task => ({ task, channel })))

      .then(({ task, channel }) => sendMessage(channel, From, Body).then(message => ({ task, channel, message })))

      .then(({ task, channel, message }) => {
        res.status(200).send(task)
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err)
      });
}



function sendMessage(channel, from, body) {
  return chatService.channels(channel.sid).messages.create({ from, body, attributes: JSON.stringify({ source: "inbound" })})
}

function getOrCreateChatChannel(from, to, attrs) {
  const name = from.replace(/[^\w:]/gi, "");
  const uniqueName = `${attrs.channelName}_channel_${name}`;
  const channelAttributes = { from, to, type: 'public' };

  return fetchChannel(uniqueName, channelAttributes).catch(err => {

    return createNewChatChannel(uniqueName, channelAttributes, from).then(channel => {
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

function createNewChatChannel(uniqueName, channelAttributes, from) {
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
    timeout: 3600,
    attributes: JSON.stringify({
      name: from.replace('whatsapp:', ''),
      channelSid: channelSid || "default",
      channelType: 'whatsapp',
    })
  };

  return taskrouterService.tasks.create(data);
}



function createGenericTask(from, channelSid) {

  const data = {
    workflowSid: TWILIO_WORKFLOW_SID,
    taskChannel: 'chat',
    timeout: 3600,
    attributes: JSON.stringify({
      name: from.replace('whatsapp:', ''),
      channelSid: channelSid || "default",
      channelType: from.search('whatsapp') > 0 ? 'whatsapp' : 'sms',
    })
  };

  return taskrouterService.tasks.create(data);
}


createGenericTask('1132066451', 'CHb0cb4f5081fd48ee873e87223a517ae3').then(task => {
  console.log('====================================');
  console.log(task);
  console.log('====================================');
})


exports.interaction = WhatsappInteraction;

const headers = { 'Content-Type': 'application/x-www-form-urlencoded', "Access-Control-Allow-Origin": "*", };

exports.getEvents = function(req, res) {

  console.log('=========================================');
  console.log(req.body.EventType);
  console.log('=========================================');

  // if(req.body.EventType === 'reservation.created') {
  //   console.log(req.body.ReservationSid)
  //   console.log('asdasdasdasd')
  //   client.taskrouter.v1
  //     .workspaces(req.body.WorkspaceSid)
  //     .tasks(req.body.TaskSid)
  //     .reservations(req.body.ReservationSid)
  //     .update({
  //       from: '+5492215976300',
  //       instruction: 'call',
  //       callFrom: '+5492215976300',
  //       callUrl: ''
  //     })
  //     .then(reservation => console.log('reservation',reservation))
  //     .catch(err => console.log('Error',err))
  // }

  res.status(200).send(headers).end()
}

exports.conferenceEvents = function(req, res) {
  console.log('____________-_________')
  console.log(req.body)

  res.status(200).send(headers)
}

function taskCreate(task) {
  console.log(task.attributes)
  let attr = JSON.parse(task.attributes)
  return taskrouterService
    .tasks
    .create({attributes: JSON.stringify({
      channelType: attr.channelType,
      channelSid: attr.channelSid,
      name: attr.name,
      type: 'sales',
      preferred_agents: 'agente 1'
    }), workflowSid: 'WWf8a61548867d0a92938b51a4575464f9', taskChannel: 'chat' })
} 

exports.transferTask = function(req, res) {
  console.log(req.body)

  taskrouterService
    .tasks(req.body.taskSid)
    .update({
      assignmentStatus: 'wrapping',
      reason: 'transfered'
    })
    .then(task => {
      taskCreate(task).then((newTask) => res.status(200).send(newTask))
    })
    .done();  
    // res.send('succes');
}

exports.genericTask = data => taskrouterService.tasks.create({attributes: JSON.stringify(data.attr), workflowSid: TWILIO_WORKFLOW_SID, taskChannel: data.channel || 'chat' });


exports.enqueueTask = () => {
  
}