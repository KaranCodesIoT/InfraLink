import moment from 'moment';

export const calculateDemandTrends = async (role, city) => {
    // Premium heuristic for demand calculation
    // In production, this would query historical job posting data
    const baseDemand = 75; // percentage
    const multiplier = city === 'Mumbai' ? 1.2 : 1.0;
    const finalDemand = Math.min(100, Math.round(baseDemand * multiplier + (Math.random() * 5)));
    
    const percentageChange = 12; // Example increase
    const trend = finalDemand > 80 ? 'Rising' : 'Stable';
    
    return {
        role,
        city,
        score: finalDemand,
        trend,
        percentageChange,
        summary: `Demand for ${role}s in ${city} has increased by ${percentageChange}% over the last 14 days, driven by new infrastructure projects.`,
        lastUpdated: moment().toISOString()
    };
};
