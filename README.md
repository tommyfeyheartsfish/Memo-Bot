Memo Bot - Chinese Language Learning Discord Bot
Overview
Memo Bot is an interactive Discord bot designed to help users learn Chinese vocabulary. The bot translates English messages into Chinese, tokenizes them, and quizzes users on vocabulary. It integrates with MongoDB to store Chinese words and uses OpenAI's GPT models for natural language processing.
Features
Message Translation and Tokenization
Translates English messages to Chinese
Tokenizes Chinese sentences into individual words
Provides word-by-word translations
Vocabulary Quiz System
Automatically generates quizzes based on user messages
Extracts Chinese words from messages and checks if they exist in the database
Asks users "How to say X in Chinese?" questions
Evaluates user responses for accuracy
Database Management
/add command to add new Chinese words to the database
/delete command to remove words from the database
Stores words using MongoDB
Setup Instructions
Prerequisites
Node.js (v14 or later)
MongoDB database
Discord Bot Token
OpenAI API Key
Environment Variables
Create a .env file with the following variables:
TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
CLIENT_ID=your_discord_bot_client_id
OPENAI_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
Installation
Clone the repository
Install dependencies:
Apply to README.md
Run
Register slash commands:
Apply to README.md
Run
Start the bot:
Apply to README.md
Run
Usage
Bot Commands
/add 中文:[word] - Add a Chinese word to the database
/delete 中文:[word] - Delete a Chinese word from the database
Conversation Flow
Send a message in a monitored channel
The bot will translate your message to Chinese and tokenize it
If any words match entries in the database, the bot will ask you how to say one of those words in Chinese
Mention the bot (@Memo Bot) with your answer
The bot will evaluate your answer and provide feedback
Monitored Channels
The bot only responds in specific channels. Current channel IDs:
1369848432017150033
Technical Details
Dependencies
discord.js - Discord API integration
openai - OpenAI API integration
mongoose - MongoDB database integration
dotenv - Environment variable management
Architecture
index.js - Main entry point and event handlers
register-commands.js - Slash command registration
Database Schema
The bot uses a simple MongoDB schema with:
Collection: cards
Document structure: { headwords: [String] }
Troubleshooting
Common Issues
Bot not responding to commands: Ensure the bot has proper permissions and commands are registered
Database connection errors: Verify your MongoDB connection string is correct
OpenAI API errors: Check your API key and usage limits
Missing words in quizzes: Words must be added to the database using the /add command before they can be used in quizzes
Debugging
The bot includes extensive console logging to help diagnose issues:
Command processing logs
Database operation logs
API response logs
Message processing logs
Future Improvements
Add more interactive learning features
Implement spaced repetition for vocabulary review
Support for multiple languages
User progress tracking
Custom quiz difficulty levels
License
ISC License