const axios = require('axios');

// @desc    Convert currency
// @route   GET /api/currency/convert
// @access  Private
const convertCurrency = async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ message: 'Please provide from, to, and amount query parameters.' });
  }

  try {
    // IMPORTANT: In a real application, you should cache these results to avoid hitting the API on every request.
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`);
    
    const rates = response.data.rates;
    const rate = rates[to.toUpperCase()];

    if (!rate) {
      return res.status(404).json({ message: `Currency '${to}' not found.` });
    }

    const convertedAmount = (amount * rate).toFixed(2);

    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: parseFloat(amount),
      convertedAmount: parseFloat(convertedAmount),
      rate: rate,
    });

  } catch (error) {
    console.error('Currency conversion API error:', error.message);
    res.status(500).json({ message: 'Error fetching currency conversion data.' });
  }
};

module.exports = {
  convertCurrency,
};