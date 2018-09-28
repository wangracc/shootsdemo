const CronJob = require('cron').CronJob;

/**
 *
 * @method run
 Seconds: 0-59
Minutes: 0-59
Hours: 0-23
Day of Month: 1-31
Months: 0-11
Day of Week: 0-6
*/
module.exports = async function(params, ctx   ) {
    return ctx.CronJob('0 * * * * *', async function() {
            console.log("JOB TODO ");
        }
    );
}
