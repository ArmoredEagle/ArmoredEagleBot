module.exports = async(client, message, args) => {
    /**
     * Shortcut to remove a self-assignable role
     * @param {Client} client The bot instance
     * @param {Object} message The message which triggered this shortcut
     * @param {Array} args The splitted arguments
     */
    return new Promise(async(resolve, reject) => {
        const guildEntry = client.guildData.get(message.guild.id);
        let role = await message.getRoleResolvable({ charLimit: 1 });
        if (!role.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the role you specified`));
        if (!guildEntry.generalSettings.autoAssignablesRoles.includes(role.first().id)) return resolve(await message.channel.createMessage(`:x: The role \`${role.first().name}\` is not a self-assignable role`));
        guildEntry.generalSettings.autoAssignablesRoles.splice(guildEntry.generalSettings.autoAssignablesRoles.indexOf(role.first().id), 1);
        client.guildData.set(message.guild.id, guildEntry);
        resolve(await message.channel.createMessage(`:white_check_mark: The role \`${role.first().name}\` is not self-assignable anymore`));
    });
}