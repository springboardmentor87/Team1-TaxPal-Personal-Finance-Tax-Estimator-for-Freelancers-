const { GoogleGenAI } = require('@google/genai');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const TaxEstimate = require('../models/TaxEstimate');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { ApiResponse } = require('../utils/ApiResponse');

const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userRecord = await User.findById(userId);
    const country = userRecord?.country?.toLowerCase() || 'us';
    const currencySymbol = country === 'india' || country === 'in' ? '₹' : '$';

    let chatSession;
    if (sessionId) {
      chatSession = await Chat.findById(sessionId, userId);
    }

    if (!chatSession) {
      const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      chatSession = await Chat.create({
        userId,
        title,
        messages: [],
      });
    }

    const messages = chatSession.messages || [];
    messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    let botResponse = '';

    if (!process.env.GEMINI_API_KEY) {
      botResponse = "I'm your offline financial assistant.\n\n";
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('budget') || lowerMsg.includes('limit')) {
        const budgets = await Budget.findByUserId(userId);
        if (budgets.length > 0) {
          botResponse += `**Your Budgets:**\n` + budgets.map((b) => `- **${b.category}**: Limit is ${currencySymbol}${b.limit}`).join('\n');
        } else {
          botResponse += `You haven't set any category budgets yet.`;
        }
      } else if (lowerMsg.includes('transaction') || lowerMsg.includes('expense') || lowerMsg.includes('income')) {
        const transactions = await Transaction.findByUserId(userId);
        if (transactions.length > 0) {
          botResponse += `**Recent Transactions:**\n` + transactions.slice(0, 5).map((t) => `- **${t.description}** (${t.category}): ${t.type === 'income' ? '+' : '-'}${currencySymbol}${t.amount}`).join('\n');
        } else {
          botResponse += `No transactions found.`;
        }
      } else if (lowerMsg.includes('tax')) {
        const estimates = await TaxEstimate.findByUserId(userId);
        if (estimates.length > 0) {
          const latest = estimates[0];
          botResponse += `Your latest tax estimate for **${latest.quarter}** is **${currencySymbol}${latest.estimatedTax}**.`;
        } else {
          botResponse += `No tax estimates found. Use the Tax Estimator to compute one.`;
        }
      } else {
        botResponse += `How can I help you manage your taxes, expenses, or budgets today?`;
      }
    } else {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [{ role: 'user', parts: [{ text: message }] }],
        });
        botResponse = response.text || 'I am processing your financial request.';
      } catch (err) {
        botResponse = 'Unable to reach AI assistant service. Please check your API key.';
      }
    }

    messages.push({ role: 'assistant', content: botResponse, timestamp: new Date().toISOString() });
    await Chat.updateMessages(chatSession.id, userId, messages);

    res.status(200).json(
      new ApiResponse(
        {
          sessionId: chatSession.id,
          message: botResponse,
          history: messages,
        },
        'Message sent'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const sessions = await Chat.findByUserId(userId);
    res.status(200).json(new ApiResponse(sessions, 'Chat sessions retrieved'));
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const chat = await Chat.findById(id, userId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(new ApiResponse(chat, 'Chat history retrieved'));
  } catch (error) {
    next(error);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await Chat.deleteById(id, userId);
    res.status(200).json(new ApiResponse(null, 'Chat deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatSessions,
  getChatHistory,
  deleteChat,
};
