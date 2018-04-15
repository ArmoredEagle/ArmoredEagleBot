class Ping {
    constructor() {
        this.help = {
            name: 'ping',
            usage: 'ping',
            description: `You can see how fast im running with thsi.`,
        }
        this.conf = {
            aliases: ["pong"],
            cooldownWeight: 4
        }
    }

    run(client, message) {
        return new Promise(async(resolve, reject) => {
            try {
                let startTime = Date.now();
                resolve(message.channel.createMessage(`Pinging so fast that you won't even notice...`).then(m => m.edit(`Pong ! \`${Date.now() - startTime}\`ms`)));
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Ping();
