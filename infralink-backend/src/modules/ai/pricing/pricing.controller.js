import * as pricingService from './pricing.service.js';

export const getRecommendedPrice = async (req, res) => {
    try {
        const { category, city, experience } = req.query;
        const recommendation = await pricingService.calculateRecommendedPrice(category, city, experience);
        res.status(200).json({
            success: true,
            data: recommendation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
