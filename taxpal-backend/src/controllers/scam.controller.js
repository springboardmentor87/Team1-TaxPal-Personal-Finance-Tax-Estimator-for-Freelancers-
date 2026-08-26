const { GoogleGenAI } = require('@google/genai');

const analyzeScam = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message text is required for analysis.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      const lowerMessage = message.toLowerCase();
      let riskLevel = 'Low';
      const detectedIndicators = [];
      let explanation = 'No typical indicators of financial fraud or scam were detected in this message.';
      let recommendedSafeAction = 'This message seems safe, but always verify the sender before sharing any personal details.';

      if (lowerMessage.includes('otp') || lowerMessage.includes('pin') || lowerMessage.includes('password') || lowerMessage.includes('cvv')) {
        riskLevel = 'High';
        detectedIndicators.push('Request for sensitive authentication details (OTP/PIN/CVV)');
        explanation = 'The message asks for temporary authentication credentials or card security numbers.';
        recommendedSafeAction = 'NEVER share OTPs, PINs, or passwords with anyone. Delete this message immediately.';
      } else if (lowerMessage.includes('urgent') || lowerMessage.includes('block') || lowerMessage.includes('suspend') || lowerMessage.includes('win') || lowerMessage.includes('lottery')) {
        riskLevel = 'High';
        detectedIndicators.push('Urgency or offering unexpected rewards/prizes');
        explanation = 'Scammers use false urgency or promise unexpected prizes to manipulate emotions.';
        recommendedSafeAction = 'Do not click any links or download attachments. Report the sender as spam.';
      } else if (lowerMessage.includes('link') || lowerMessage.includes('click') || lowerMessage.includes('http')) {
        riskLevel = 'Medium';
        detectedIndicators.push('Contains external links');
        explanation = 'The message contains links that request action. Ensure the link points to a verified official domain.';
        recommendedSafeAction = 'Hover over the link to verify the destination URL.';
      }

      res.status(200).json({
        success: true,
        data: {
          riskLevel,
          detectedIndicators,
          explanation,
          recommendedSafeAction,
          disclaimer: 'This scam detection is an offline fallback response. Always exercise caution.',
        },
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze this message to detect if it is a financial scam.
    Return JSON:
    {
      "riskLevel": "Low" | "Medium" | "High",
      "detectedIndicators": ["string"],
      "explanation": "string",
      "recommendedSafeAction": "string"
    }
    Text: """${message}"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const analysisData = JSON.parse(response.text || '{}');
    res.status(200).json({
      success: true,
      data: {
        ...analysisData,
        disclaimer: 'Always verify financial requests through official verified channels.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeScam,
};
