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


const wordSchema = new mongoose.Schema({
    headwords: [String]
  });
const WordModel = mongoose.model('cards', wordSchema);

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

var message_to_send =(''); //message_to_send becomes undefiened after the function finishes 
// var question_sent = false;

client.on('messageCreate', async(message) =>{

    console.log(message.author.tag);
    if(message.author.bot) {
        return;
    }
    if(!CHANNELS.includes(message.channelId)) return;

    if(!message.content.startsWith("！"))
        {
            const tokenization_prompt = `Translate the following sentences into Chinese: "${message.content}", then tokenize the translated sentence, then translate the tokens word by word. Output them in the following format:
            [Translated Chinese Sentence]\n\n
            [Token 1/ Tolen 2/ Token 3/Token 4...]\n\n
            - [Token 1] ([Translation 1])
            - [Token 2] ([Translation 2])
            ...`;
            let tokenization_response = await openai.chat.completions.create({
                model: 'gpt-4o', 
                messages: [{
                    role: "system",
                    content: tokenization_prompt
                }, {
                    role: "user",
                    content: message.content
                }]
            });
            let message_to_reply=tokenization_response.choices[0].message.content;
            console.log(message_to_reply);
            const tokenized_sentence = message_to_reply.split('\n\n')[1];
            const tokens = message_to_reply.split('\n\n')[2];

            const data_to_csv_prompt = `You will be provided with unstructured data, and your task is to parse it into CSV without column, without the header, written in the format “chinese:english” and should be comma delimite`;
            let translation_response = await openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages: [{
                    role: "system",
                    content: data_to_csv_prompt
                },{
                    role: "user",
                    content: tokens
                }]
            });
            let word_list = translation_response.choices[0].message.content;
            
            console.log(word_list);
    
            let compounds=word_list.split(',');
            let words = []
            for(let compound of compounds) 
                {
                    let translation = compound.split(':');
                    if(translation[1]=='-'||translation[1]=='')
                        {
                            continue;
                        }
                    else
                        {
                            let chinese = translation[0];
                            let english = translation[1];
                            words.push({chinese, english})
                        }
                }
            console.log(words);

            var found_words=[];
            for(const word of words){
                const foundWords = await WordModel.findOne({headwords: [word.chinese]});
                if (foundWords) {
                    console.log(word);
                    found_words.push(word.english);
                }
            }
                let random_index = Math.floor(Math.random() * found_words.length);
                message_to_send = (`How to say "${found_words[random_index]}" in Chinese?`);
                await message.reply(message_to_send); 
                question_sent =true;
        }
    if(message.content.startsWith('！'))//or @the bot
        {
            const evaluation_prompt = `Evaluate the accuracy of the answer to the question in English`
            let evaluation_response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{
                    role: "system",
                    content: evaluation_prompt
                },{
                    role: "user",
                    content: message_to_send + message.content
                }]
            });
            await message.reply(evaluation_response.choices[0].message.content);
            question_sent =false;
        }
});

const token = process.env.TOKEN;
client.login(token);