require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessagePolls
    ]
});
    
client.on('ready',(c)=>{
        console.log(`${c.user.tag} is ready!`);
    })

client.on('interactionCreate',(interaction)=>{
    if(!interaction.isChatInputCommand()) return;

    console.log(interaction.commandName);
});

client.on('messageCreate', message=>{
    //testing
    console.log(message.author.tag);
    if(message.author.bot) {
        return;
    }
    if(message.content === 'hello'){
        message.reply('hello');
    }
})


const token = process.env.TOKEN;
client.login(token);