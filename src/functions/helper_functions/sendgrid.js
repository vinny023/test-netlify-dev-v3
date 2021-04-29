const sgMail = require('@sendgrid/mail')
const sentry = require('./sentry')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = async(sgMsg, ) => {

    const Sentry = await sentry.initSentry() 

    try {
        return await sgMail.send({...sgMsg, tracking_settings: {open_tracking: {enable:true}}})
    } catch(error) {   
        if (!Sentry.error) {
            Sentry.captureException('Sendgrid Mail Send Error - '+error)
        }    
        return {            
            error: error
        }
    } 
 
}

