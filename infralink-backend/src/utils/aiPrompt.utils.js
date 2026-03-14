/**
 * Build system / user prompts for Gemini AI job-matching.
 */
export const buildMatchPrompt = (job, workers) => {
    const workerSummaries = workers
        .map(
            (w, i) =>
                `Worker ${i + 1}: Name=${w.name}, Skills=${(w.skills || []).join(', ')}, Experience=${w.yearsOfExperience || 0}yrs, Rating=${w.averageRating || 'N/A'}, Location=${JSON.stringify(w.location || {})}`
        )
        .join('\n');

    return `
You are an AI expert in construction hiring. Rank the following workers for the given job.

JOB:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${(job.requiredSkills || []).join(', ')}
Location: ${JSON.stringify(job.location || {})}
Budget: ${job.budget || 'Not specified'}

WORKERS:
${workerSummaries}

Return a JSON array of { workerIndex, score (0-100), reason } objects, ordered by score descending.
Only return valid JSON. No markdown.
`.trim();
};

export const buildJobDescriptionPrompt = (partialJob) => `
Generate a professional job description for a construction role.
Role: ${partialJob.title}
Key details: ${JSON.stringify(partialJob)}
Return only the description text.
`.trim();
