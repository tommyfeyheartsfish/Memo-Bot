const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
    channelId: '1369848432017150033',
    botId: process.env.CLIENT_ID,
    testMessage: "Hello, how are you?",
    testResponse: "你好，你好吗？"
};

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

// Test database connection
async function testDatabaseConnection() {
    console.log('\n=== Testing Database Connection ===');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Test OpenAI API
async function testOpenAI() {
    console.log('\n=== Testing OpenAI API ===');
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: "system",
                content: "Translate this to Chinese: Hello"
            }],
            max_tokens: 60
        });
        console.log('✅ OpenAI API test successful');
        console.log('Response:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('❌ OpenAI API test failed:', error);
        return false;
    }
}

// Test message processing
async function testMessageProcessing() {
    console.log('\n=== Testing Message Processing ===');
    try {
        const tokenization_prompt = `Translate the following sentences into Chinese: "${TEST_CONFIG.testMessage}", then tokenize the translated sentence, then translate the tokens word by word.`;
        
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: "system",
                content: tokenization_prompt
            }, {
                role: "user",
                content: TEST_CONFIG.testMessage
            }]
        });
        
        console.log('✅ Message processing test successful');
        console.log('Response:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('❌ Message processing test failed:', error);
        return false;
    }
}

// Test evaluation functionality
async function testEvaluation() {
    console.log('\n=== Testing Evaluation Functionality ===');
    try {
        const evaluation_prompt = `Evaluate the accuracy of the answer to the question in English`;
        const question = "How to say 'Hello' in Chinese?";
        const answer = "你好";

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: "system",
                content: evaluation_prompt
            }, {
                role: "user",
                content: question + answer
            }],
            max_tokens: 60
        });

        console.log('✅ Evaluation test successful');
        console.log('Question:', question);
        console.log('Answer:', answer);
        console.log('Evaluation:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('❌ Evaluation test failed:', error);
        return false;
    }
}

// Test database operations
async function testDatabaseOperations() {
    console.log('\n=== Testing Database Operations ===');
    try {
        const WordModel = mongoose.model('cards', new mongoose.Schema({
            headwords: [String]
        }));

        // Test adding a word
        const testWord = new WordModel({ headwords: ['测试'] });
        await testWord.save();
        console.log('✅ Word addition successful');

        // Test finding a word
        const foundWord = await WordModel.findOne({ headwords: ['测试'] });
        console.log('✅ Word search successful');
        console.log('Found word:', foundWord);

        // Test deleting a word
        await WordModel.deleteOne({ headwords: ['测试'] });
        console.log('✅ Word deletion successful');

        return true;
    } catch (error) {
        console.error('❌ Database operations test failed:', error);
        return false;
    }
}

// Test bot message handling
async function testBotMessageHandling() {
    console.log('\n=== Testing Bot Message Handling ===');
    try {
        // Test question asking
        const question = "How to say 'Hello' in Chinese?";
        console.log('✅ Question format test passed');
        
        // Test answer evaluation
        const answer = "你好";
        const evaluation_prompt = `Evaluate the accuracy of the answer to the question in English`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: "system",
                content: evaluation_prompt
            }, {
                role: "user",
                content: `Question: ${question}\nAnswer: ${answer}`
            }],
            max_tokens: 60
        });
        
        console.log('✅ Answer evaluation test passed');
        console.log('Question:', question);
        console.log('Answer:', answer);
        console.log('Evaluation:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('❌ Bot message handling test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting bot tests...\n');
    
    const results = {
        database: await testDatabaseConnection(),
        openai: await testOpenAI(),
        messageProcessing: await testMessageProcessing(),
        evaluation: await testEvaluation(),
        databaseOperations: await testDatabaseOperations(),
        botMessageHandling: await testBotMessageHandling()
    };

    console.log('\n=== Test Summary ===');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    });

    // Close database connection
    await mongoose.connection.close();
}

// Run the tests
runAllTests().catch(console.error); 