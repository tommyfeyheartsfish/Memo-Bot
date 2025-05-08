require('dotenv').config();
const {REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const commands = [
    {
        name: 'add',
        description: 'add new word to the database',
        options: [
            {
                name: '中文',
                description: 'The Chinese word to add',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'delete',
        description: 'delete a word from the database',
        options:[
            {
                name: '中文',
                description: 'The word to delete',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },
];

const rest = new REST({VERSION: '10'}).setToken(process.env.TOKEN);
(async()=>{
    try{
        console.log('Registering slash commands!')

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        );

        console.log('Successfully registered slash commands!');
    }catch(error){
        console.log (`There was an error: ${error}`);
    }
})();