class Afk {
    constructor() {
        this.help = {
            name: 'afk',
            usage: 'afk im out',
            description: 'Enable/disable your afk status, if enabled, Felix will display it every time someone mentions you.',
            detailedUsage: "`{prefix}afk im out` Will set/update your afk status `im out`\n`{prefix}afk` Will enable/disable your afk status"
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const userEntry = client.userData.get(message.author.id);
                if (!args.length) {
                    userEntry.generalSettings.afk = userEntry.generalSettings.afk === false ? "" : false;
                    userEntry.generalSettings.afkSetAt = userEntry.generalSettings.afk === false ? 0 : Date.now();
                    client.userData.set(message.author.id, userEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, I ${userEntry.generalSettings.afk === false ? "disabled" : "enabled"} your afk status`));
                } else {
                    userEntry.generalSettings.afk = args.join(" ");
                    userEntry.generalSettings.afkSetAt = Date.now();
                    client.userData.set(message.author.id, userEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, I updated your afk status`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Afk();
