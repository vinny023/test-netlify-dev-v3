const Sentry = require('@sentry/node');

const { SENTRY_DSN } = process.env;

let sentryInitialized = false;

exports.initSentry = () => {
    console.log('initializing sentry')
    try{
    if (SENTRY_DSN) {     
        Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 1.0 });
        sentryInitialized = true;
        return Sentry
    }   else {
        return {error:'error'}
    }
    } catch(error) {
        return {error:error}
    }
}

