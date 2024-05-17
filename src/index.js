require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
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
    if(message.content === 'testing'){
        message.reply('tested');
    }
})


const token = process.env.TOKEN;
client.login(token);