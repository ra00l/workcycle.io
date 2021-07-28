'use strict';
const nodemailer = require('nodemailer');
const config = require('../config').getCurrent();
const logger = require('./logger');


const smtpTransporter = nodemailer.createTransport(config.email);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.email.APIKEY);

const defaultMailOptions = {
  from: `WorkCycle Team 👻 <${config.email.from}>`
};

const templates = {
  'test': {
    subject: 'test subject {date}',
    body: 'test body content {date}'
  },
  'reset': {
    subject: 'Reset your password',
    body: `
      Dear {name},<br /><br />
      
      You (or someone else) requested a password reset for your email. <br /> 
      Click the following link to set a new password: <a href="{appHost}/reset/{confirmKey}">{appHost}/reset/{confirmKey}</a><br /><br />
      
      Your friends from WorkCycle!<br /><br />
    `
  },
  'welcome': {
    subject: 'Welcome to WorkCycle, {name}',
    body: `
      Dear {name},<br /><br />
      
      We welcome {company} to WorkCycle, the only project management tool you'll ever need!<br />
      Please confirm your email and set your password by following this link: <a href="{appHost}/reset/{confirmKey}">{appHost}/reset/{confirmKey}</a><br /><br />
            
      Feel free to reply this email with any questions you might have. We answer all emails!<br /><br />
      
      Your friends from WorkCycle!<br /><br />
      
      <p style="color: #999">PS: If you didn't signed up for our service, this is the first and last email you will receive from us. However, you might want to have a look at a short intro at <a href="{appHost}/intro">{appHost}/intro</a></p>`
  },
  'invite-user': {
    subject: 'Invitation to use WorkCycle from {senderName}',
    body: `
      Dear {name},<br /><br />
      
      {senderName} has invited you to join his workspace {boardName} on WorkCycle, the only project management tool you'll ever need!<br />
      Get started by confirming your email address from here: <a href="{appHost}/invitation/{confirmKey}">{appHost}/invitation/{confirmKey}</a><br /><br />
            
      Feel free to reply this email with any questions you might have. We answer all emails!<br /><br />
      
      Your friends from WorkCycle!<br /><br />
      
      <p style="color: #999">PS: If you didn't signed up for our service, this is the first and last email you will receive from us. However, you might want to have a look at a short intro at <a href="{appHost}/intro">{appHost}/intro</a></p>`
  },
  'invite-existing-user': {
    subject: '{senderName} added you to a new workspace',
    body: `
      Dear {name},<br /><br />
      
      {senderName} has invited you to join his workspace {boardName} on WorkCycle, the only project management tool you'll ever need!<br />
      
      Since you already have an existing account, you can simply log in to your account at <a href="{appHost}/login">{appHost}/login</a>and find the workspace on the menu.<br /><br />
            
      Feel free to reply this email with any questions you might have. We answer all emails!<br /><br />
      
      Your friends from WorkCycle!<br /><br />
      
      <p style="color: #999">PS: If you didn't signed up for our service, this is the first and last email you will receive from us. However, you might want to have a look at a short intro at <a href="{appHost}/intro">{appHost}/intro</a></p>`
  },
  'assign-user': {
    subject: 'You\'ve been assigned to {workItemName} ',
    body: `
      Dear {name},<br /><br />
      
      {asignerName} has assigned you to {boardName} / {workItemName} <a href="{appHost}/{workspaceId}/boards/{boardId}/item/{workItemId}">{appHost}/{workspaceId}/boards/{boardId}/item/{workItemId}</a><br /><br />
            
      
      Your friends from WorkCycle!<br /><br />`
  },
  'mention-user': {
    subject: '{commentorName} mentioned you in a comment on {workItemName} ',
    body: `
      Dear {name},<br /><br />
      
      <b>{commentorName}</b> has commented on <b>{workItemName}</b> mentioning you: <br /><br /> 
      
      <div style="border: solid 1px #ddd;padding:5px;border-radius: 5px;font-style: italic">{commentText}</div>
      <br /><br />
      
      View or reply to the comment: <a href="{appHost}/{workspaceId}/boards/{boardId}/item/{workItemId}">{appHost}/{workspaceId}/boards/{boardId}/item/{workItemId}</a><br /><br />
            
      
      Your friends from WorkCycle!<br /><br />`
  },
  'log-email': {
    subject: '[workcycle] {eventType}',
    body: `
      Calin, Raul, Lazar,<br /><br />
      
      <b>{user}</b> has done <b>{eventType}</b>: <br /><br /> 
      
      Related information:<br />
      <pre>{data}</pre>
      
      Your friends from WorkCycle!<br /><br />`
  }

};

function getTemplate(type, data) {
  let tpl = JSON.parse(JSON.stringify(templates[type]));

  for(let key of Object.keys(config.emailVars)) {
    data[key] = config.emailVars[key];
  }

  for(let key of Object.keys(data)) {
    tpl.subject = replace(tpl.subject, key, data[key]);
    tpl.body = replace(tpl.body, key, data[key]);
  }

  return tpl;

  function replace(src, str, val) {
    return src.replace(new RegExp('{' + str + '}', 'gi'), val);
  }
}

module.exports = {
  verify: function () {
    return smtpTransporter.verify();
  },
  send: async function (to, type, replacements, user) {
    const template = getTemplate(type, replacements);

    if (!template) {
      logger.warn('No email type defined: ', type);
      return;
    }

    const msg = {
      to: to,
      from: defaultMailOptions.from,
      subject: template.subject,
      //text: template.body,
      html: template.body,
    };

    if(['mention-user', 'assign-user'].indexOf(type) === -1) {
      setTimeout(async function() {
        const logTemplate = getTemplate('log-email', {
          eventType: type,
          user: user ? `${user.name} (${user.email}})` : 'not-known',
          data: JSON.stringify(replacements)
        });

        const logMsg = {
          to: 'newuser@workcycle.io',
          from: defaultMailOptions.from,
          subject: logTemplate.subject,
          html: logTemplate.body,
        };

        if(config.noSendEmail) {
          return logger.warn('Faking send log email: ', logMsg);
        }

        try {
          await sgMail.send(logMsg);
        }
        catch(err) {
          logger.error('error sending email: ', err);
        }
      });

    }


    if(config.noSendEmail) {
      return logger.warn('Faking send email: ', msg);
    }

    try {
      await sgMail.send(msg);
    }
    catch(err) {
      logger.error('error sending email: ', err);
    }
  }
};

