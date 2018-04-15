class Roleadd {
    constructor() {
        this.help = {
            name: 'roleadd',
            description: 'Add a role to another user.',
            usage: 'roleadd [user] [role_name]',
            detailedUsage: '`{prefix}roleadd [user] [role_name]` will give that user the role imputed if possible.'
        }
        this.conf = {
            guildOnly: true,
            cooldownWeight: 4,
            requirePerms: ['manageRoles']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                guildEntry.generalSettings.autoAssignablesRoles = guildEntry.generalSettings.autoAssignablesRoles.filter(r => message.guild.roles.get(r)); //Filter deleted roles
                if (args.length < 1) {
                    let rolesFields = [];
                        let guildRole = message.guild.roles.get(role);}
                {
                    if (!message.guild.members.get(client.user.id).hasPermission("manageRoles")) {
                        return resolve(await message.channel.createMessage(":x: I don't have the permission to do that"));
                    }
                    let guildRole = await message.getRoleResolvable({
                        text: args.join(" "),
                        single: true,
                    });
                    if (message.guild.members.get(message.author.id).roles.find(r => r === guildRole.first().id)) {
                        return resolve(await message.channel.createMessage(':x: You already have this role'));
                    }
                    await message.guild.members.get(message.author.id).addRole(guildRole.first().id);
                    resolve(await message.channel.createMessage(":white_check_mark: Alright, I gave you the user the role `" + guildRole.first().name + "`"));
                }
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Roleadd();
