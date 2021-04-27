// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
const msg = {
  to: 'aanandacoumar@gmail.com', // Change to your recipient
  from: 'order@supplyhero.co', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(response => {
    console.log(response)
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })