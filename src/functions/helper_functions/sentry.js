const Sentry = require('@sentry/node');

const { SENTRY_DSN } = process.env;

let sentryInitialized = false;

exports.initSentry = () => {
    console.log('initializing sentry')
    if (SENTRY_DSN) {
        console.log('found DSN')
        Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 1.0 });
        sentryInitialized = true;
    }    
}

