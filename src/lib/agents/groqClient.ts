// Groq LLM Client — proxied through Lambda server
// NO API keys on client — all calls go through /api/agents/*

import { serverPost } from '@/lib/serverApi';

export interface AgentThought {
    step: number;
    type: 'thinking' | 'acting' | 'observing' | 'deciding' | 'complete' | 'error';
    title: string;
    content: string;
    timestamp: number;
}

export interface AgentResponse {
    result: any;
    thoughts: AgentThought[];
    rawResponse: string;
}

let thoughtLog: AgentThought[] = [];

export const clearThoughts = () => { thoughtLog = []; };
export const getThoughts = (): AgentThought[] => [...thoughtLog];

const addThought = (
    type: AgentThought['type'],
    title: string,
    content: string
): AgentThought => {
    const thought: AgentThought = {
        step: thoughtLog.length + 1,
        type,
        title,
        content,
        timestamp: Date.now(),
    };
    thoughtLog.push(thought);
    return thought;
};

/**
 * Remediation Agent — Analyzes disease detection results and identifies treatment
 */
export const analyzeDisease = async (
    diseases: Array<{ class_name: string; confidence: number }>,
    cropType: string,
    location?: { lat: number; lng: number }
): Promise<AgentResponse> => {
    clearThoughts();

    addThought('thinking', 'Analyzing Disease Detection Results',
        `Received ${diseases.length} disease(s) detected in ${cropType}. Starting analysis...`);

    addThought('acting', 'Consulting AI Knowledge Base',
        'Querying Groq LLM (LLaMA 3.3 70B) for disease analysis and treatment recommendations...');

    try {
        const data = await serverPost<{ result: any; rawResponse: string }>('/api/agents/remediation', {
            diseases,
            cropType,
            location,
        });

        addThought('observing', 'AI Analysis Received',
            'Processing treatment recommendations from the AI model...');

        addThought('complete', 'Treatment Plan Ready',
            `Identified ${data.result.treatments?.length || 0} treatment options. Severity: ${data.result.analysis?.severity || 'unknown'}. Ready to search ONDC for suppliers.`);

        return { result: data.result, thoughts: getThoughts(), rawResponse: data.rawResponse };
    } catch (error) {
        addThought('error', 'Analysis Failed',
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Sales Agent — Analyzes market conditions and creates negotiation strategy
 */
export const analyzeMarket = async (
    cropType: string,
    quantity: number,
    unit: string,
    quality: string,
    location?: { lat: number; lng: number },
    currentMarketPrices?: Array<{ market: string; modalPrice: number }>
): Promise<AgentResponse> => {
    clearThoughts();

    addThought('thinking', 'Analyzing Market Conditions',
        `Evaluating market for ${quantity} ${unit} of ${cropType} (${quality} quality)...`);

    addThought('acting', 'Consulting AI Market Intelligence',
        'Querying Groq LLM (LLaMA 3.3 70B) for market analysis and pricing strategy...');

    try {
        const data = await serverPost<{ result: any; rawResponse: string }>('/api/agents/sales', {
            cropType,
            quantity,
            unit,
            quality,
            location,
            marketPrices: currentMarketPrices,
        });

        addThought('observing', 'Market Analysis Received',
            'Processing market intelligence and negotiation strategy...');

        addThought('complete', 'Market Strategy Ready',
            `Target price: ₹${data.result.pricing_strategy?.target_price || 'N/A'}/quintal. ${data.result.potential_buyers?.length || 0} buyer types identified.`);

        return { result: data.result, thoughts: getThoughts(), rawResponse: data.rawResponse };
    } catch (error) {
        addThought('error', 'Market Analysis Failed',
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Negotiation round — Agent reasons about an offer and counter-offers
 */
export const negotiateOffer = async (
    cropType: string,
    quantity: number,
    buyerOffer: number,
    targetPrice: number,
    minimumPrice: number,
    roundNumber: number,
    previousOffers: Array<{ round: number; buyerOffer: number; counterOffer?: number }>
): Promise<AgentResponse> => {
    clearThoughts();

    addThought('thinking', `Negotiation Round ${roundNumber}`,
        `Buyer offered ₹${buyerOffer}/quintal. Our target: ₹${targetPrice}. Minimum: ₹${minimumPrice}.`);

    addThought('acting', 'Evaluating Offer',
        `Analyzing buyer offer of ₹${buyerOffer} against our strategy...`);

    try {
        const data = await serverPost<{ result: any; rawResponse: string }>('/api/agents/negotiate', {
            cropType,
            quantity,
            buyerOffer,
            targetPrice,
            minimumPrice,
            roundNumber,
            previousOffers,
        });

        const result = data.result;
        const emoji = result.decision === 'accept' ? '✅' : result.decision === 'counter' ? '🔄' : '❌';
        addThought('complete', `${emoji} Decision: ${result.decision.toUpperCase()}`,
            result.decision === 'accept'
                ? `Accepting offer of ₹${buyerOffer}/quintal. ${result.reasoning}`
                : result.decision === 'counter'
                    ? `Counter-offering ₹${result.counter_offer}/quintal. ${result.reasoning}`
                    : `Rejecting offer. ${result.reasoning}`);

        return { result, thoughts: getThoughts(), rawResponse: data.rawResponse };
    } catch (error) {
        addThought('error', 'Negotiation Error',
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};
