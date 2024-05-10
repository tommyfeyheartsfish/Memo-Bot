require('dotenv').config();
const {REST, Routes} = require('discord.js');

const commands =[
    {
        name: 'hey',
        description: 'Replies with hey',
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