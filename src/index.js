/**
 * @file This file contains the main entry point of the micromemo_bot application.
 * It sets up event listeners for Discord messages, connects to a MongoDB database,
 * and utilizes the OpenAI API for natural language processing tasks.
 */

/**
 * Event listener for when a message is created in a channel.
 * 
 * @param {Message} message - The message object representing the created message.
 * @returns {Promise<void>} - A promise that resolves once the message is processed.
 */
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');

// Connect to MongoDB database
const mongoURL = process.env.MONGODB_URI;
mongoose.connect(mongoURL).then(() => {
    console.log('Connected to database');    
}).catch(err => {
    console.error('Error connecting to database:', err);
}); 

// Define the word schema for MongoDB
const wordSchema = new mongoose.Schema({
    headwords: [String]
});
const WordModel = mongoose.model('cards', wordSchema);

// Create a Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

// Event listener for when the client is ready
client.on('ready', (c) => {
    console.log(`${c.user.tag} is ready!`);
});

// Event listener for when an interaction is created
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction.commandName);
});

// Define the channels where the bot will listen for messages
const CHANNELS = ['1236916722200481812'];

// Create an instance of the OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

var message_to_send = (''); 

//Event listener for when an interaction is created
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'add') {
        // Get the word from the interaction
        const word = interaction.options.getString('中文');
        //add the word to the database
        const newWord = new WordModel({ headwords: [word] });
        await newWord.save();
        await interaction.reply(`Successfully added ${word} to the database`);
    }

    if(interaction.commandName === 'delete') {
        // Get the word from the interaction
        const word = interaction.options.getString('word');
        //check if the word exists in the database
        const foundWord = await WordModel.findOne({ headwords: [word] });
        //if the word exists, delete it
        if (foundWord) {
            await WordModel.deleteOne({ headwords: [word] });
            await interaction.reply(`Successfully deleted ${word} from the database`);
        } else {
            await interaction.reply(`Could not find ${word} in the database`);
        }
    }
});
// Event listener for when a message is created
client.on('messageCreate', async (message) => {
    console.log(message.author.tag);
    if (message.author.bot) {
        return;
    }
    if (!CHANNELS.includes(message.channelId)) return;

    if (!message.content.includes(`<@${client.user.id}>`)) {
        // Generate tokenization prompt
        const tokenization_prompt = `Translate the following sentences into Chinese: "${message.content}", then tokenize the translated sentence, then translate the tokens word by word. Output them in the following format:
        [Translated Chinese Sentence]\n\n
        [Token 1/ Token 2/ Token 3/Token 4...]\n\n
        - [Token 1] ([Translation 1])
        - [Token 2] ([Translation 2])
        ...`;

        // Call OpenAI API to tokenize the sentence
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
        let message_to_reply = tokenization_response.choices[0].message.content;
        console.log(message_to_reply);
        const tokenized_sentence = message_to_reply.split('\n\n')[1];
        const tokens = message_to_reply.split('\n\n')[2];

        // Generate data to CSV prompt
        const data_to_csv_prompt = `You will be provided with unstructured data, and your task is to parse it into CSV without column, without the header, written in the format “chinese:english” and should be comma delimited`;

        // Call OpenAI API to translate tokens
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

        // Split the word list into compounds
        let compounds = word_list.split(',');
        let words = [];
        for (let compound of compounds) {
            let translation = compound.split(':');
            if (translation[1] == '-' || translation[1] == '') {
                continue;
            } else {
                let chinese = translation[0];
                let english = translation[1];
                words.push({ chinese, english });
            }
        }
        console.log(words);

        // Find matching words in the database
        var found_words = [];
        for (const word of words) {
            const foundWords = await WordModel.findOne({ headwords: [word.chinese] });
            if (foundWords) {
                console.log(word);
                found_words.push(word.english);
            }
        }

        // Generate a random index and construct the message to send
        let random_index = Math.floor(Math.random() * found_words.length);
        message_to_send = (`How to say "${found_words[random_index]}" in Chinese?`);
        await message.reply(message_to_send); 
        question_sent = true;
    }

    if (message.content.includes(`<@${client.user.id}>`)) {
        // Generate evaluation prompt
        const evaluation_prompt = `Evaluate the accuracy of the answer to the question in English`;

        // Call OpenAI API to evaluate the answer
        let evaluation_response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
            role: "system",
            content: evaluation_prompt
            },{
            role: "user",
            content: message_to_send + message.content
            }],
            max_tokens: 60
        });
        await message.reply(evaluation_response.choices[0].message.content);
        question_sent = false;
    }
});

// Login to Discord using the provided token
const token = process.env.TOKEN;
client.login(token);