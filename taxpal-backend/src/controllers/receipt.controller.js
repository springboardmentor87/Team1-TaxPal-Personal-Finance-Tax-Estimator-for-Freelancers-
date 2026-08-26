const { GoogleGenAI } = require('@google/genai');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const Category = require('../models/Category');

const matchCategory = (scannedCategory, userCategories) => {
  const normScanned = (scannedCategory || '').trim().toLowerCase();

  if (!normScanned) {
    const otherCat = userCategories.find((c) => c.name.toLowerCase() === 'other');
    return otherCat ? otherCat.name : 'Other';
  }

  for (const cat of userCategories) {
    const normCat = cat.name.toLowerCase();
    if (normCat === normScanned || normCat.includes(normScanned) || normScanned.includes(normCat)) {
      return cat.name;
    }
  }

  const keywordMappings = {
    'Travel/Meals': ['food', 'meal', 'cafe', 'restaurant', 'starbucks', 'uber', 'taxi', 'travel', 'dining'],
    'Software/SaaS': ['software', 'saas', 'aws', 'github', 'subscription', 'cloud', 'hosting'],
    'Hardware/Gadgets': ['hardware', 'gadget', 'laptop', 'computer', 'phone', 'electronics'],
    'Office Supplies': ['supplies', 'stationery', 'paper', 'desk', 'staples'],
    'Marketing/Ads': ['marketing', 'ads', 'campaign', 'promo', 'seo'],
  };

  for (const [standardName, keywords] of Object.entries(keywordMappings)) {
    const matchingUserCat = userCategories.find((c) => c.name === standardName);
    if (matchingUserCat) {
      for (const keyword of keywords) {
        if (normScanned.includes(keyword)) {
          return matchingUserCat.name;
        }
      }
    }
  }

  const otherCat = userCategories.find((c) => c.name.toLowerCase() === 'other');
  if (otherCat) return otherCat.name;

  return userCategories.length > 0 ? userCategories[0].name : 'Other';
};

const scanReceipt = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!req.file) {
      throw new ApiError(400, 'Please upload a receipt image or PDF file.');
    }

    let extractedData;

    if (!process.env.GEMINI_API_KEY) {
      const fileName = (req.file.originalname || '').toLowerCase();
      let category = 'Other';
      let description = 'Business Expense';
      let amount = 45.99;
      let transactionType = 'Expense';
      const currency = 'USD';

      if (fileName.includes('uber') || fileName.includes('travel') || fileName.includes('meal')) {
        category = 'Travel & Meals';
        description = 'Travel / Ride';
      } else if (fileName.includes('aws') || fileName.includes('github') || fileName.includes('software')) {
        category = 'Software & Subscriptions';
        description = 'Cloud Subscription';
      } else if (fileName.includes('hardware') || fileName.includes('laptop')) {
        category = 'Hardware & Equipment';
        description = 'Hardware Purchase';
      }

      const today = new Date();
      extractedData = {
        amount,
        currency,
        date: today.toISOString().split('T')[0],
        vendor: description,
        category,
        transactionType,
        taxDeductible: true,
        notes: 'Scanned receipt offline simulation',
      };

      const userCategories = await Category.findForUser(userId);
      extractedData.matchedCategory = matchCategory(extractedData.category, userCategories);

      res.status(200).json(new ApiResponse(extractedData, 'Receipt parsed successfully (Mock Mode)'));
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const prompt = `Analyze this receipt/invoice. Extract in strict JSON:
    {
      "amount": 0.00,
      "currency": "USD",
      "date": "YYYY-MM-DD",
      "vendor": "Merchant Name",
      "category": "Category name",
      "transactionType": "Expense" | "Income",
      "taxDeductible": true,
      "notes": "Optional summary"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const userCategories = await Category.findForUser(userId);
    parsed.matchedCategory = matchCategory(parsed.category, userCategories);

    res.status(200).json(new ApiResponse(parsed, 'Receipt parsed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanReceipt,
};
