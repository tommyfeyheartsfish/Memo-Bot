# Micro Memo Bot 
## Introduction 
Micro Memo Bot is a discord bot that will randomly ask questions on "how to say ... in Chinese?" based on the conversation happening in the discord server and give feedback of your answer.  there is a database stores the vocabulary that you want to memorize. there is an add and delete slash command that you could add and delete vocabulary to the list. Every time the bot detects a word from the vocabulary list is used in the conversation, it will randomly choose to ask the question or not. You can either choose to answer or ignore. 
## Intention 
I am curious about ~~environment enhance learning~~, with event-binding, how does it improve the memorization for vocabulary. 
### What do you mean by 'event-binding'?
By randomly test user's vocabulary as events happening in the discord channel.The user will create memory for the vocabulary together with the event. In other word, creating semantic memory combined with episodic memory to enhance memorization. 
### semantic memory and episodic memory 
semantic memory focuses on knowledge, including facts, concepts and ideas  
episodic memory focuses on the personal experience 
### More Explanation  
coming soon
# Todo list
[] how to set up mongo db database
[] add&delete slash command, store/delete the words from the database
[] convert xml file to JSON
[] how to make chatgpt evaluate the accuracy of the answer in terms of percentage?
# Questions - solutions 
[] when adding a new word to the database, where does the word come from?
[X] the user has to enter both the word and meaning/translation by themselves
[X] connect to a dictionary 
[X] user can choose either
[X] slash command comes with auto-completion 
[] how to ignore the bot/answer the bot, what signal the bot to evaluate the answer?
[X] when the user answers, type "!" 



