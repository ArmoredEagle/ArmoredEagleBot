class RemovePermission {
    constructor() {
        this.help = {
            name: 'removepermission',
            description: 'Remove a permission from a user/role/channel or the whole server',
            usage: 'removepermission [command]',
            detailedUsage: '`{prefix}removepermission ping` Will remove the ping permission from the whole server(if set)\n`{prefix}removepermission ping -role [role_resolvable(s)]` Will remove the ping permission for the specified role(s)\n`{prefix}removepermission ping -user [user_resolvable(s)]` Will remove the ping permission from the specified user(s)\n`{prefix}removepermission ping -channel [channel_resolvable(s)]` Will remove the ping permission from the specified channel(s)\n\n**Note:** You can use `[category]*` instead of a command name to remove a whole command category, so for example\n`{prefix}removepermission generic*` Will remove the generic category permission of the whole server.>'
        }
        this.conf = {
            guildOnly: true,
            aliases: ["removeperm", "rp"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                let permission = args.filter(c => client.commands.find(cmd => cmd.help.name === c.toLowerCase() && cmd.help.category !== 'admin') || client.commands.find(cmd => cmd.help.category !== 'admin' && cmd.help.category === c.substr(0, c.indexOf('*'))));
                let targets = 'global';
                if (args.find(a => a.search(/\-user|\-u/gim) !== -1)) targets = await message.getUserResolvable();
                else if (args.find(a => a.search(/\-channel|\-c/gim) !== -1)) targets = await message.getChannelResolvable();
                else if (args.find(a => a.search(/\-role|\-r/gim) !== -1)) targets = await message.getRoleResolvable();
                //Handle missing args
                if (!permission[0]) return resolve(await message.channel.createMessage(`:x: You did not specified a permission to remove`));
                if (targets !== 'global' && targets.size < 1) return resolve(await message.channel.createMessage(`:x: You did not specified a target`));
                //Remove global permissions
                if (targets === 'global') {
                    if (!guildEntry.permissions.global.allowedCommands.includes(permission[0]) && !guildEntry.permissions.global.restrictedCommands.includes(permission[0])) return resolve(await message.channel.createMessage(`:x: \`${permission[0]}\` is not set as a permission for the whole server`));
                    //Remove the permission from enabled || disabled
                    if (guildEntry.permissions.global.allowedCommands.includes(permission[0])) guildEntry.permissions.global.allowedCommands.splice(guildEntry.permissions.global.allowedCommands.findIndex(rc => rc === permission[0]), 1);
                    if (guildEntry.permissions.global.restrictedCommands.includes(permission[0])) guildEntry.permissions.global.restrictedCommands.splice(guildEntry.permissions.global.restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, \`${permission[0]}\` has been removed from the whole server`));
                }
                //Remove users permissions
                else if (targets.first().username) { //(If the collection contains user objects)
                    targets.forEach(m => {
                        if (!guildEntry.permissions.users.find(u => u.id === m.id)) return;
                        let userPos = guildEntry.permissions.users.findIndex(u => u.id === m.id);
                        if (guildEntry.permissions.users[userPos].allowedCommands.includes(permission[0])) guildEntry.permissions.users[userPos].allowedCommands.splice(guildEntry.permissions.users[userPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        if (guildEntry.permissions.users[userPos].restrictedCommands.includes(permission[0])) guildEntry.permissions.users[userPos].restrictedCommands.splice(guildEntry.permissions.users[userPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        if (guildEntry.permissions.users[userPos].allowedCommands.length === 0 && guildEntry.permissions.users[userPos].restrictedCommands.length === 0) guildEntry.permissions.users.splice(userPos, 1);
                    });
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, \`${permission[0]}\` has been removed from the user(s) **${targets.map(u => u.tag).join(', ')}**`));
                }
                //Remove channels permissions
                else if (typeof targets.first().type !== "undefined") { //(If the collection contains channels objects)
                    targets.forEach(gc => {
                        if (!guildEntry.permissions.channels.find(c => c.id === gc.id)) return
                        let channelPos = guildEntry.permissions.channels.findIndex(c => c.id === gc.id);
                        if (guildEntry.permissions.channels[channelPos].allowedCommands.includes(permission[0])) guildEntry.permissions.channels[channelPos].allowedCommands.splice(guildEntry.permissions.channels[channelPos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        if (guildEntry.permissions.channels[channelPos].restrictedCommands.includes(permission[0])) guildEntry.permissions.channels[channelPos].restrictedCommands.splice(guildEntry.permissions.channels[channelPos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        if (guildEntry.permissions.channels[channelPos].allowedCommands.length === 0 && guildEntry.permissions.channels[channelPos].restrictedCommands.length === 0) guildEntry.permissions.channels.splice(channelPos, 1);
                    });
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, \`${permission[0]}\` has been removed from the channel(s) **${targets.map(c => c.name).join(', ')}**`));
                }
                //Remove roles permissions
                else if (typeof targets.first().hoist !== "undefined") { //(If the collection contains roles objects)
                    targets.forEach(gr => {
                        if (!guildEntry.permissions.roles.find(r => r.id === gr.id)) return;
                        let rolePos = guildEntry.permissions.roles.findIndex(r => r.id === gr.id);
                        if (guildEntry.permissions.roles[rolePos].allowedCommands.includes(permission[0])) guildEntry.permissions.roles[rolePos].allowedCommands.splice(guildEntry.permissions.roles[rolePos].allowedCommands.findIndex(ac => ac === permission[0]), 1);
                        if (guildEntry.permissions.roles[rolePos].restrictedCommands.includes(permission[0])) guildEntry.permissions.roles[rolePos].restrictedCommands.splice(guildEntry.permissions.roles[rolePos].restrictedCommands.findIndex(rc => rc === permission[0]), 1);
                        if (guildEntry.permissions.roles[rolePos].allowedCommands.length === 0 && guildEntry.permissions.roles[rolePos].restrictedCommands.length === 0) guildEntry.permissions.roles.splice(rolePos, 1);
                    });
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, \`${permission[0]}\` has been removed from the role(s) **${targets.map(c => c.name).join(', ')}**`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new RemovePermission();
