import * as demandService from './demand.service.js';

export const getDemandTrends = async (req, res) => {
    try {
        const { role, city } = req.query;
        const trendData = await demandService.calculateDemandTrends(role, city);
        res.status(200).json({
            success: true,
            data: trendData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
