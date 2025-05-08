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
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log('Command received:', interaction.commandName);
    
    if(interaction.commandName === 'add') {
        // Log all options to see what's available
        console.log('All options:', interaction.options);
        console.log('Options data:', interaction.options._hoistedOptions);
        
        // Get the word from the interaction
        const word = interaction.options._hoistedOptions.find(opt => opt.name === '中文')?.value;
        console.log('Word value:', word);
        
        // Check if word is null or empty
        if (!word || word.trim() === '') {
            await interaction.reply('Error: No word provided. Please provide a Chinese word to add.');
            return;
        }
        
        //add the word to the database
        const newWord = new WordModel({ headwords: [word] });
        await newWord.save();
        await interaction.reply(`Successfully added "${word}" to the database`);
    }

    if(interaction.commandName === 'delete') {
        // Log all options for debugging
        console.log('Delete options:', interaction.options._hoistedOptions);
        
        // Get the word from the interaction using 中文 as the parameter name
        const word = interaction.options._hoistedOptions.find(opt => opt.name === '中文')?.value;
        console.log('Delete word value:', word);
        
        // Check if word is null or empty
        if (!word || word.trim() === '') {
            await interaction.reply('Error: No word provided. Please provide a Chinese word to delete.');
            return;
        }
        
        //check if the word exists in the database
        const foundWord = await WordModel.findOne({ headwords: [word] });
        //if the word exists, delete it
        if (foundWord) {
            await WordModel.deleteOne({ headwords: [word] });
            await interaction.reply(`Successfully deleted "${word}" from the database`);
        } else {
            await interaction.reply(`Could not find "${word}" in the database`);
        }
    }
});

// Define the channels where the bot will listen for messages
const CHANNELS = ['1369848432017150033'];

// Create an instance of the OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

var message_to_send = (''); 

//Event listener for when an interaction is created
// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isChatInputCommand()) return;

//     if(interaction.commandName === 'add') {
//         // Get the word from the interaction
//         const word = interaction.options.getString('中文');
        
//         // Check if word is null or empty
//         if (!word || word.trim() === '') {
//             await interaction.reply('Error: No word provided. Please provide a Chinese word to add.');
//             return;
//         }
        
//         //add the word to the database
//         const newWord = new WordModel({ headwords: [word] });
//         await newWord.save();
//         await interaction.reply(`Successfully added "${word}" to the database`);
//     }

//     if(interaction.commandName === 'delete') {
//         // Get the word from the interaction
//         const word = interaction.options.getString('word');
        
//         // Check if word is null or empty
//         if (!word || word.trim() === '') {
//             await interaction.reply('Error: No word provided. Please provide a word to delete.');
//             return;
//         }
        
//         //check if the word exists in the database
//         const foundWord = await WordModel.findOne({ headwords: [word] });
//         //if the word exists, delete it
//         if (foundWord) {
//             await WordModel.deleteOne({ headwords: [word] });
//             await interaction.reply(`Successfully deleted "${word}" from the database`);
//         } else {
//             await interaction.reply(`Could not find "${word}" in the database`);
//         }
//     }
// });
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
                content: message.content || ""
            }]
        });
        let message_to_reply = tokenization_response.choices[0].message.content;
        console.log(message_to_reply);
        const parts = message_to_reply ? message_to_reply.split('\n\n') : [];
        const tokenized_sentence = parts.length > 1 ? parts[1] : "";
        const tokens = parts.length > 2 ? parts[2] : "";

        // Add check for empty tokens
        if (!tokens || tokens.trim() === "") {
            console.log("No tokens to process, skipping translation");
            return; // Skip the rest of the function if tokens are empty
        }

        // Generate data to CSV prompt
        const data_to_csv_prompt = `You will be provided with unstructured data, and your task is to parse it into CSV without column, without the header, written in the format "chinese:english" and should be comma delimited`;

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

        // Check if the response looks like an error message
        if (word_list.includes("missing") || word_list.includes("provide")) {
            console.log("Received error response from OpenAI, skipping processing");
            return; // Skip processing if it looks like an error message
        }

        // Split the word list into compounds
        let compounds = word_list.split(',');
        let words = [];
        for (let compound of compounds) {
            let translation = compound.split(':');
            // Add additional validation
            if (!translation[1] || translation[1] == '-' || translation[1] == '') {
                continue;
            } else {
                let chinese = translation[0];
                let english = translation[1];
                words.push({ chinese, english });
            }
        }

        // Check if we have any valid words before continuing
        if (words.length === 0) {
            console.log("No valid words found after processing");
            return; // Skip the rest if no valid words
        }

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
        if (found_words.length === 0) {
            console.log("No matching words found in database");
            await message.reply("I couldn't find any words to quiz you on from that message. Try saying something else!");
            return;
        }

        let random_index = Math.floor(Math.random() * found_words.length);
        message_to_send = (`How to say "${found_words[random_index]}" in Chinese?`);
        await message.reply(message_to_send); 
        question_sent = true;
    }

    if (message.content.includes(`<@${client.user.id}>`)) {
        // Generate evaluation prompt
        const evaluation_prompt = `Evaluate the accuracy of the answer to the question in English`;

        // Add null checks here too
        const cleanedContent = message.content
            ? message.content
                .replace(`<@${client.user.id}>`, '')
                .replace(/[.?]/g, '')
                .trim()
            : "";

        // Call OpenAI API to evaluate the answer
        let evaluation_response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: "system",
                content: evaluation_prompt
            },{
                role: "user",
                content: (message_to_send || "") + (cleanedContent || "")
            }],
            max_tokens: 100
        });
        await message.reply(evaluation_response.choices[0].message.content);
        question_sent = false;
    }
});

// Login to Discord using the provided token
const token = process.env.TOKEN;
client.login(token);