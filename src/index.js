require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');


const mongoURL = process.env.MONGODB_URI;

mongoose.connect(mongoURL).then(()=>{
    console.log('Connected to database');    
}).catch(err=>{
    console.error('Error connecting to database:', err);
});

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

const CHANNELS = ['1236916722200481812'];

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
})

client.on('messageCreate', async(message) =>{
    //testing

    console.log(message.author.tag);
    if(message.author.bot) {
        return;
    }
    if(!CHANNELS.includes(message.channelId)) return;

    const translationPrompt = `Translate the following text to Chinese: "${message.content}"`;

    const response =await openai.chat.completions.create({
        model:'gpt-3.5-turbo',
        messages:[
            {
                //name:
                role: 'system',
                content:translationPrompt
            }
        ]
    }).catch((error)=>console.error('OpenAI Error:\n',error))
    
    if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        console.log(response.choices[0].message.content);
        message.reply(response.choices[0].message.content);
    }else{
        console.log('translate error.')
    }
});


const token = process.env.TOKEN;
client.login(token);