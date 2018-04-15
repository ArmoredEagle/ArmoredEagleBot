const sleep = require("../modules/sleep");

module.exports = async(client, message) => {
    let commandsStats = client.clientData.get("commandsStats");
    //Return if the message does not start with the prefix nor Felix's mention
    if (!message.content.startsWith(message.guild ? client.guildData.get(message.guild.id).generalSettings.prefix : client.config.prefix) && !message.content.startsWith(`<@${client.user.id}>`) && !message.content.startsWith(`<@!${client.user.id}>`)) return;
    //Get the args and isolate the command
    const args = message.content.split(/\s+/g);
    const supposedCommand = !message.content.startsWith('<') ? args.shift().slice(message.guild ? client.guildData.get(message.guild.id).generalSettings.prefix.length : client.config.prefix.length).toLowerCase() : (args[1] ? args[1].toLowerCase() : false);
    //Just return if the command is not found
    if ((!client.commands.has(supposedCommand)) && (!client.aliases.has(supposedCommand))) return;
    const command = client.commands.get(supposedCommand) ? client.commands.get(supposedCommand) : client.commands.get(client.aliases.get(supposedCommand));
    //Return if the command/category is disabled
    if (message.guild &&
        (client.guildData.get(message.guild.id).generalSettings.disabledModules.includes(`${command.help.category}*`) ||
            client.guildData.get(message.guild.id).generalSettings.disabledModules.includes(command.help.name)) &&
        !message.guild.members.get(message.author.id).hasPermission("administrator")) {
        return;
    }
    //Once the command is confirmed, store the user in the database if they are not already in
    if (!client.userData.has(message.author.id)) client.userData.set(message.author.id, client.defaultUserData(message.author.id));

    commandsStats[command.help.name]++;
    client.clientData.set("commandsStats", commandsStats);

    if (!message.guild) {
        //Check if the command can be used in dm and if the user has the permissions to use it
        if (command.conf.guildOnly || (command.help.category === 'admin' && !client.config.admins.includes(message.author.id))) return await message.channel.createMessage(":x: This command can only be used in a guild or you don't have the permission to use it");
        //Check if the command is disabled
        if (command.conf.disabled) return await message.channel.createMessage(":x: Sorry but this command is disabled for now\n**Reason:** " + command.conf.disabled);
        try {
            await command.run(client, message, args);
        } catch (err) {
            client.emit('error', err, message);
        } finally {
            command.uses++;
            client.commandsUsed++;
        }
    } else {
        const guildEntry = client.guildData.get(message.guild.id);
        //Ratelimit check
        if (client.ratelimited.has(message.author.id) && client.ratelimited.get(message.author.id) >= 20) return await message.channel.createMessage(`:x: Chill a bit, there, a 20 seconds cooldown for ya :heart:`);
        //Disabled check
        if (command.conf.disabled) return await message.channel.createMessage(":x: Sorry but this command is disabled for now\n**Reason:** " + command.conf.disabled);
        //Permissions check
        const allowed = require(`./permissionsChecker.js`)(client, message, command);
        if (!allowed) return await message.channel.createMessage(":x: You don't have the permission to use this command !");
        else if (Array.isArray(allowed)) return await message.channel.createMessage(`:x: I miss the following permissions to run this command properly: \`${allowed.join(', ')}\``);

        if (message.content.startsWith('<')) {
            message.content = message.content.substr(args[0].length).trim();
            args.splice(0, 2);
        };
        try {
            //Shortcuts
            if (command.shortcut && args.filter(a => command.shortcut.triggers.has(a.toLowerCase())).length > 0) {
                let trigger = args.filter(a => command.shortcut.triggers.has(a.toLowerCase()))[0].toLowerCase();
                //Handle missing argument here to save a line in every shortcut script
                if (command.shortcut.triggers.get(trigger).args && (args.length - 1) < command.shortcut.triggers.get(trigger).args) return await message.channel.createMessage(`:x: You didn't specified any or not enough arguments`);
                await require(`../shortcuts/${command.help.name}/${command.shortcut.triggers.get(trigger).script}`)(client, message, args);
            }
            //Default command 
            else await command.run(client, message, args);
            //Ratelimit
            client.ratelimited.set(message.author.id, client.ratelimited.get(message.author.id) ? (client.ratelimited.get(message.author.id) + command.conf.cooldownWeight) : command.conf.cooldownWeight);
            setTimeout(() => {
                if (client.ratelimited.get(message.author.id) > command.conf.cooldownWeight) client.ratelimited.set(message.author.id, client.ratelimited.get(message.author.id) - command.conf.cooldownWeight)
                else client.ratelimited.delete(message.author.id);
            }, 25000);
        } catch (err) {
            client.emit('error', err, message);
        } finally {
            command.uses++;
            client.commandsUsed++;
        }
    }
}