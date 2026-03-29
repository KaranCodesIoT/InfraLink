export const calculateRecommendedPrice = async (category, city, experience) => {
    // Market-aware pricing logic
    const baseRates = {
        'Labour': 800,
        'Contractor': 2500,
        'Architect': 5000,
        'default': 1000
    };

    const locationMultipliers = {
        'Mumbai': 1.5,
        'Delhi': 1.4,
        'Bangalore': 1.4,
        'default': 1.0
    };

    const base = baseRates[category] || baseRates.default;
    const mult = locationMultipliers[city] || locationMultipliers.default;
    
    const recommendedValue = Math.round(base * mult);
    const rangeMin = Math.round(recommendedValue * 0.9);
    const rangeMax = Math.round(recommendedValue * 1.2);

    return {
        recommendedValue,
        range: { min: rangeMin, max: rangeMax },
        currency: 'INR',
        basis: 'Per Day',
        marketSentiment: 'High Demand',
        reasoning: `Based on current market rates in ${city} for ${category} roles with ${experience || 'standard'} experience.`
    };
};
