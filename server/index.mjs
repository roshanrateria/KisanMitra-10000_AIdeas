// KisanMitra Lambda API Server
// Single Lambda function handling all API routes
// Node.js 20 runtime — native fetch, zero npm dependencies
// All API keys read from Lambda environment variables

// ─── CORS & Response Helpers ───────────────────────────────────

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
};

const ok = (body) => ({
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
});

const err = (statusCode, message) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
});

// ─── Environment Variables (set in Lambda config) ──────────────

const env = (key) => process.env[key] || '';

// ─── Route Handler ─────────────────────────────────────────────

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Parse path from API Gateway v1 or v2
    let path = event.path || event.rawPath || '';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

    // Strip API Gateway stage prefix (e.g. /prod, /dev) if present
    // API Gateway HTTP API v2 includes the stage in rawPath
    if (path.match(/^\/(prod|dev|staging)\//)) {
        path = path.replace(/^\/(prod|dev|staging)/, '');
    }

    let body = {};
    if (event.body) {
        try {
            body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body);
        } catch { body = {}; }
    }

    // Parse query string params
    const query = event.queryStringParameters || {};

    console.log(`[${method}] ${path}`);

    try {
        // ─── AGENT ROUTES ────────────────────────────────────────

        if (path === '/api/agents/remediation' && method === 'POST') {
            return await handleRemediationAgent(body);
        }
        if (path === '/api/agents/sales' && method === 'POST') {
            return await handleSalesAgent(body);
        }
        if (path === '/api/agents/negotiate' && method === 'POST') {
            return await handleNegotiation(body);
        }

        // ─── ONDC ROUTES ─────────────────────────────────────────

        if (path === '/api/ondc/search' && method === 'POST') {
            return await handleONDCSearch(body);
        }
        if (path === '/api/ondc/select' && method === 'POST') {
            return await handleONDCSelect(body);
        }
        if (path === '/api/ondc/confirm' && method === 'POST') {
            return await handleONDCConfirm(body);
        }

        // ─── GEMINI ROUTES ───────────────────────────────────────

        if (path === '/api/gemini/chat' && method === 'POST') {
            return await handleGeminiChat(body);
        }
        if (path === '/api/gemini/tasks' && method === 'POST') {
            return await handleGeminiTasks(body);
        }
        if (path === '/api/gemini/treatment' && method === 'POST') {
            return await handleGeminiTreatment(body);
        }
        if (path === '/api/gemini/video' && method === 'POST') {
            return await handleGeminiVideo(body);
        }

        // ─── TRANSLATE ROUTE ─────────────────────────────────────

        if (path === '/api/translate' && method === 'POST') {
            return await handleTranslation(body);
        }

        // ─── WEATHER ROUTE ───────────────────────────────────────

        if (path === '/api/weather' && method === 'GET') {
            return await handleWeather(query);
        }

        // ─── DISEASE DETECTION ROUTE ─────────────────────────────

        if (path === '/api/disease-detect' && method === 'POST') {
            return await handleDiseaseDetection(event);
        }

        // ─── LEDGER ROUTE ────────────────────────────────────────
        if (path === '/api/ledger' && method === 'GET') {
            return await handleLedgerGet(query);
        }
        if (path === '/api/ledger' && method === 'POST') {
            return await handleLedgerPost(body);
        }

        // ─── HEALTH CHECK ────────────────────────────────────────

        if (path === '/api/health') {
            return ok({ status: 'ok', service: 'kisanmitra-api', timestamp: new Date().toISOString() });
        }

        return err(404, `Route not found: ${method} ${path}`);
    } catch (error) {
        console.error('Handler error:', error);
        return err(500, error.message || 'Internal server error');
    }
};

// ═══════════════════════════════════════════════════════════════
// DYNAMODB — Farmer's Digital Ledger
// ═══════════════════════════════════════════════════════════════

const LEDGER_TABLE = 'KisanMitra-Ledger';

const getDynamoDocClient = async () => {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    const client = new DynamoDBClient({ region: env('AWS_REGION') || 'us-east-1' });
    return DynamoDBDocumentClient.from(client);
};

const saveLedgerEntry = async (userId, type, details, title) => {
    try {
        const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
        const docClient = await getDynamoDocClient();
        await docClient.send(new PutCommand({
            TableName: LEDGER_TABLE,
            Item: {
                userId: userId || 'farmer_001',
                timestamp: new Date().toISOString(),
                type,
                title,
                details
            }
        }));
        console.log(`Saved ledger entry: ${type}`);
    } catch (err) {
        console.error('Failed to save to ledger:', err);
    }
};

const handleLedgerGet = async (query) => {
    try {
        const userId = query.userId || 'farmer_001';
        const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
        const docClient = await getDynamoDocClient();
        const data = await docClient.send(new QueryCommand({
            TableName: LEDGER_TABLE,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
            ScanIndexForward: false // latest first
        }));
        return ok({ entries: data.Items || [] });
    } catch (err) {
        console.error('Ledger error:', err);
        return err(500, 'Failed to fetch ledger');
    }
};

const handleLedgerPost = async (body) => {
    try {
        const { userId, type, details, title } = body;
        if (!type || !title) return err(400, "Missing type or title");

        await saveLedgerEntry(userId, type, details, title);
        return ok({ success: true });
    } catch (err) {
        console.error('Ledger POST error:', err);
        return err(500, 'Failed to save to ledger');
    }
};

// ═══════════════════════════════════════════════════════════════
// AWS BEDROCK — Agent Intelligence (Primary)
// ═══════════════════════════════════════════════════════════════

const callBedrock = async (systemPrompt, userMessage, temperature = 0.3) => {
    try {
        // Import AWS SDK v3 Bedrock Runtime client (available in Lambda Node.js 20 runtime)
        const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

        const region = process.env.AWS_REGION || 'us-east-1';
        const client = new BedrockRuntimeClient({ region });

        // Claude 3 Haiku model ID
        const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';

        // Construct Claude API request format
        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            temperature,
            messages: [
                {
                    role: 'user',
                    content: `${systemPrompt}\n\n${userMessage}`,
                },
            ],
        };

        const command = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        console.log('Bedrock inference successful:', { modelId, usage: responseBody.usage });

        return responseBody.content?.[0]?.text || '';
    } catch (error) {
        console.error('Bedrock error:', error.message);
        // Fallback to Groq for development/testing
        console.log('Falling back to Groq...');
        return await callGroq(systemPrompt, userMessage, temperature);
    }
};

// ═══════════════════════════════════════════════════════════════
// GROQ LLM — Agent Intelligence (Fallback)
// ═══════════════════════════════════════════════════════════════

const callGroq = async (systemPrompt, userMessage, temperature = 0.3) => {
    const apiKey = env('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown');
        throw new Error(`Groq API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
};

// ─── Remediation Agent ─────────────────────────────────────────

const handleRemediationAgent = async (body) => {
    const { diseases, cropType, location } = body;
    if (!diseases?.length) return err(400, 'diseases array required');

    const systemPrompt = `You are the KisanMitra Remediation Agent — an expert agricultural AI for Indian farmers. Analyze disease detection results and recommend specific treatments.
RULES: Respond in valid JSON only. Prioritize ORGANIC treatments. Include specific product names available in Indian agri-markets. Provide dosages, application methods, timing. Include urgency level.`;

    const userMessage = `Disease detection for crop: ${cropType || 'General'}
Location: ${location ? `Lat ${location.lat}, Lon ${location.lng}` : 'Not specified'}
Detected diseases:
${diseases.map((d, i) => `${i + 1}. ${d.class_name} (Confidence: ${(d.confidence * 100).toFixed(1)}%)`).join('\n')}

Respond in JSON:
{
  "analysis": {"severity":"low|medium|high|critical","urgency":"immediate|within_24h|within_week|monitoring","summary":"Brief summary"},
  "treatments": [{"disease":"name","treatment_name":"product name","type":"organic|chemical|biological","active_ingredient":"ingredient","dosage":"dosage","application_method":"how","frequency":"frequency","estimated_cost_inr":500,"availability":"widely_available|specialized_store|online","ondc_search_query":"search query for ONDC"}],
  "preventive_measures": ["measure1"],
  "monitoring_advice": "what to watch"
}`;

    const raw = await callBedrock(systemPrompt, userMessage);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return err(500, 'Failed to parse AI response');

    const result = JSON.parse(jsonMatch[0]);

    // Save to digital ledger
    await saveLedgerEntry(
        body.userId || 'farmer_001',
        'DISEASE_ANALYSIS',
        { cropType, diseases, severity: result.analysis?.severity },
        `Disease Analysis for ${cropType || 'Crop'}`
    );

    return ok({ result, rawResponse: raw, aiProvider: 'bedrock' });
};

// ─── Sales Agent ───────────────────────────────────────────────

const handleSalesAgent = async (body) => {
    const { cropType, quantity, unit, quality, location, marketPrices } = body;
    if (!cropType || !quantity) return err(400, 'cropType and quantity required');

    const priceCtx = marketPrices?.length
        ? `\nCurrent market prices:\n${marketPrices.map(p => `- ${p.market}: ₹${p.modalPrice}/quintal`).join('\n')}`
        : '';

    const systemPrompt = `You are the KisanMitra Sales Negotiation Agent for Indian farmers. Analyze market conditions and create negotiation strategies.
RULES: Respond in valid JSON only. Use realistic Indian market prices (INR per quintal). Consider seasonal variations and regional demand.`;

    const userMessage = `Farmer wants to sell:
- Crop: ${cropType}
- Quantity: ${quantity} ${unit || 'quintals'}
- Quality: ${quality || 'Standard'}
- Location: ${location ? `Lat ${location.lat}, Lon ${location.lng}` : 'Not specified'}
${priceCtx}

Respond in JSON:
{
  "market_analysis": {"current_avg_price":2500,"price_trend":"rising|stable|falling","demand_level":"high|moderate|low","best_time_to_sell":"description","summary":"Brief summary"},
  "pricing_strategy": {"minimum_acceptable_price":2200,"target_price":2800,"premium_price":3200,"justification":"why"},
  "potential_buyers": [{"buyer_type":"mandi_trader|fpo|processor|exporter|retailer","description":"desc","expected_price_range":{"min":2200,"max":2800},"pros":["pro"],"cons":["con"],"ondc_search_query":"search query"}],
  "negotiation_tips": ["tip1"],
  "logistics_advice": {"packaging":"rec","transport":"rec","estimated_logistics_cost":500}
}`;

    const raw = await callBedrock(systemPrompt, userMessage);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return err(500, 'Failed to parse AI response');

    return ok({ result: JSON.parse(jsonMatch[0]), rawResponse: raw, aiProvider: 'bedrock' });
};

// ─── Negotiation Round ─────────────────────────────────────────

const handleNegotiation = async (body) => {
    const { cropType, quantity, buyerOffer, targetPrice, minimumPrice, roundNumber, previousOffers } = body;

    const systemPrompt = `You are the KisanMitra Sales Negotiation Agent conducting a price negotiation for an Indian farmer. Protect the farmer's interests while maintaining realistic negotiation.
RULES: Respond in valid JSON only. Never accept below minimum price. Use strategic counter-offers.`;

    const historyStr = (previousOffers || []).map(o =>
        `Round ${o.round}: Buyer ₹${o.buyerOffer} → ${o.counterOffer ? `Counter ₹${o.counterOffer}` : 'Pending'}`
    ).join('\n');

    const userMessage = `Negotiation for ${quantity} quintals of ${cropType}:
- Target: ₹${targetPrice}/quintal, Minimum: ₹${minimumPrice}/quintal
- Current buyer offer: ₹${buyerOffer}/quintal, Round: ${roundNumber}
History:
${historyStr || 'First round'}

Respond in JSON: {"decision":"accept|counter|reject","counter_offer":2800,"reasoning":"why","message_to_buyer":"professional message","confidence":0.85}`;

    const raw = await callBedrock(systemPrompt, userMessage, 0.2);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return err(500, 'Failed to parse negotiation response');

    const result = JSON.parse(jsonMatch[0]);

    // If the agent accepted the deal, log it
    if (result.decision === 'accept') {
        await saveLedgerEntry(
            body.userId || 'farmer_001',
            'NEGOTIATION_ACCEPTED',
            { cropType, quantity, finalPrice: buyerOffer },
            `Sold ${quantity} quintals of ${cropType} for ₹${buyerOffer}/q`
        );
    }

    return ok({ result, rawResponse: raw, aiProvider: 'bedrock' });
};

// ═══════════════════════════════════════════════════════════════
// ONDC SANDBOX — Beckn Protocol Integration
// ═══════════════════════════════════════════════════════════════

const ONDC_GATEWAY = env('ONDC_GATEWAY_URL') || 'https://staging.gateway.proteantech.in';
const ONDC_MOCK = env('ONDC_MOCK_URL');
const BAP_ID = env('BAP_ID') || 'kisanmitra.ondc.org';
const BAP_URI = env('BAP_URI');
const DOMAIN_AGRI_INPUT = 'ONDC:AGR10';
const DOMAIN_AGRI_OUTPUT = 'ONDC:AGR11';

const genTxnId = () => `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
const genMsgId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

const buildContext = (action, domain, transactionId) => ({
    domain,
    country: 'IND',
    city: 'std:080',
    action,
    core_version: '1.2.0',
    bap_id: BAP_ID,
    bap_uri: BAP_URI,
    transaction_id: transactionId || genTxnId(),
    message_id: genMsgId(),
    timestamp: new Date().toISOString(),
    ttl: 'PT30S',
});

const handleONDCSearch = async (body) => {
    const { searchQuery, domain, location, searchType } = body;
    const txnId = genTxnId();
    const domainCode = domain || (searchType === 'buyers' ? DOMAIN_AGRI_OUTPUT : DOMAIN_AGRI_INPUT);

    const payload = {
        context: buildContext('search', domainCode, txnId),
        message: {
            intent: {
                item: { descriptor: { name: searchQuery || '' } },
                ...(location && {
                    fulfillment: {
                        type: searchType === 'buyers' ? 'Seller-Fulfilled' : 'Delivery',
                        [searchType === 'buyers' ? 'start' : 'end']: {
                            location: { gps: `${location.lat},${location.lng}`, area_code: '560001' },
                        },
                    },
                }),
            },
        },
    };

    // Try real ONDC gateway first
    try {
        const res = await fetch(`${ONDC_GATEWAY}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const data = await res.json();
            return ok({ transaction_id: txnId, data, source: 'ondc_gateway' });
        }
    } catch (e) { console.warn('ONDC gateway error:', e.message); }

    // Try ONDC Mock Playground (deployed on EB) — full lifecycle
    try {
        // Pick session based on search type
        const sessionId = searchType === 'buyers'
            ? 'kisanmitra-agri-output-session' : 'kisanmitra-agri-input-session';
        const flowId = searchType === 'buyers'
            ? 'agri-output-sell-flow' : 'agri-input-search-flow';
        const sessionTxnId = searchType === 'buyers'
            ? 'txn_kisanmitra_agri_002' : 'txn_kisanmitra_agri_001';

        const mockBase = `${ONDC_MOCK}/mock/playground`;

        // Step 1: Initialize the flow
        const initRes = await fetch(`${mockBase}/flows/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                flow_id: flowId,
                transaction_id: sessionTxnId,
                inputs: { search_query: searchQuery || 'agricultural products' },
            }),
        });
        const initData = await initRes.json();
        console.log('ONDC mock flow init:', JSON.stringify(initData));

        // Step 2: Send the search action
        const searchPayload = {
            context: {
                ...payload.context,
                transaction_id: sessionTxnId,
                bap_uri: BAP_URI,
            },
            message: payload.message,
        };

        await fetch(`${mockBase}/manual/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchPayload),
        });

        // Step 3: Wait a moment for mock to process on_search
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 4: Fetch the populated catalog from flow status
        const statusRes = await fetch(`${mockBase}/flows/current-status?transaction_id=${sessionTxnId}&session_id=${sessionId}`, {
            method: 'GET'
        });
        const statusData = await statusRes.json();
        let rawRefData = statusData.reference_data || {};
        let refData = rawRefData.catalog_form || rawRefData;

        // Ensure refData values are arrays of objects and strip empty keys
        const productList = Array.isArray(refData) ? refData : Object.values(refData).filter(i => typeof i === 'object');

        // Emulate an on_search ONDC response by wrapping reference_data products
        const onSearchResponse = {
            context: searchPayload.context,
            message: {
                catalog: {
                    "bpp/providers": [
                        {
                            id: "mock_provider_1",
                            descriptor: { name: "ONDC Agri Provider" },
                            items: productList.map((item, idx) => ({
                                id: item.id || `item_${idx}`,
                                descriptor: { name: item.name || "Agri Product", short_desc: item.description || "High quality agricultural input" },
                                price: { value: item.price || "100", currency: "INR" }
                            }))
                        }
                    ]
                }
            }
        };

        if (statusData.data && Object.keys(refData).length === 0) {
            console.log('ONDC mock status empty reference_data:', JSON.stringify(statusData));
        }

        return ok({ transaction_id: sessionTxnId, data: [onSearchResponse], source: 'ondc_mock_playground' });
    } catch (e) {
        console.warn('ONDC mock playground error:', e.message);
    }

    // Return structured fallback with realistic ONDC format data
    const fallbackData = searchType === 'buyers'
        ? generateBuyerFallback(searchQuery, txnId, body.quantity, body.unit)
        : generateTreatmentFallback(searchQuery, txnId);

    return ok({ transaction_id: txnId, data: fallbackData, source: 'ondc_format_catalog' });
};

const handleONDCSelect = async (body) => {
    const { transactionId, providerId, itemId, quantity } = body;
    const payload = {
        context: buildContext('select', DOMAIN_AGRI_INPUT, transactionId),
        message: { order: { provider: { id: providerId }, items: [{ id: itemId, quantity: { count: quantity || 1 } }] } },
    };

    try {
        const res = await fetch(`${ONDC_GATEWAY}/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) return ok({ data: await res.json(), source: 'ondc_gateway' });
    } catch (e) { /* fallback */ }

    return ok({
        data: {
            context: buildContext('on_select', DOMAIN_AGRI_INPUT, transactionId),
            message: { order: { provider: { id: providerId }, items: [{ id: itemId, quantity: { count: quantity || 1 } }], quote: { price: { currency: 'INR', value: '500' }, breakup: [{ title: 'Item', price: { currency: 'INR', value: '450' } }, { title: 'Delivery', price: { currency: 'INR', value: '50' } }] } } },
        },
        source: 'ondc_format_catalog',
    });
};

const handleONDCConfirm = async (body) => {
    const { transactionId, providerId, itemId, quantity, paymentMethod } = body;
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload = {
        context: buildContext('confirm', DOMAIN_AGRI_INPUT, transactionId),
        message: {
            order: {
                id: orderId,
                provider: { id: providerId },
                items: [{ id: itemId, quantity: { count: quantity || 1 } }],
                payment: { type: paymentMethod || 'ON-FULFILLMENT', status: paymentMethod === 'PRE-PAID' ? 'PAID' : 'NOT-PAID' },
            },
        },
    };

    try {
        const res = await fetch(`${ONDC_GATEWAY}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const data = await res.json();
            saveLedgerEntry(body.userId || 'farmer_001', 'ONDC_ORDER', { orderId, providerId, itemId, quantity, providerSource: 'gateway' }, `Placed ONDC Order ${orderId}`);
            return ok({ order_id: orderId, data, source: 'ondc_gateway' });
        }
    } catch (e) { /* fallback */ }

    saveLedgerEntry(body.userId || 'farmer_001', 'ONDC_ORDER', { orderId, providerId, itemId, quantity, providerSource: 'mock' }, `Placed ONDC Order ${orderId}`);

    return ok({
        order_id: orderId,
        transaction_id: transactionId,
        status: 'confirmed',
        fulfillment_status: 'Order Confirmed — Delivery in 2-3 days',
        source: 'ondc_format_catalog',
    });
};

// ─── ONDC Fallback Data Generators ─────────────────────────────

const generateTreatmentFallback = (query, txnId) => {
    const q = (query || '').toLowerCase();
    const providers = [
        {
            id: 'bpp_agri_001', name: 'Krishi Seva Kendra (ONDC)', rating: '4.3',
            location: { city: 'Jaipur', state: 'Rajasthan' },
            items: [
                { id: 'item_f001', name: 'Neem Oil (Organic Fungicide) — 500ml', description: 'Cold-pressed neem oil for organic fungal disease control', price: { currency: 'INR', value: '280' }, quantity: { available: 150, unit: 'bottle' }, category: 'Organic Fungicide', fulfillment: { type: 'Delivery', estimated_delivery: '2-3 days' } },
                { id: 'item_f002', name: 'Trichoderma Viride (Bio-fungicide) — 1kg', description: 'Biological fungicide for soil-borne diseases', price: { currency: 'INR', value: '350' }, quantity: { available: 75, unit: 'kg' }, category: 'Bio-fungicide', fulfillment: { type: 'Delivery', estimated_delivery: '2-3 days' } },
                { id: 'item_f003', name: 'Copper Oxychloride 50% WP — 500g', description: 'Contact fungicide for blights and leaf spots', price: { currency: 'INR', value: '220' }, quantity: { available: 200, unit: 'pack' }, category: 'Fungicide', fulfillment: { type: 'Delivery', estimated_delivery: '1-2 days' } },
            ],
        },
        {
            id: 'bpp_agri_002', name: 'AgriMart India (ONDC)', rating: '4.5',
            location: { city: 'Delhi', state: 'Delhi NCR' },
            items: [
                { id: 'item_f004', name: 'Pseudomonas Fluorescens — 1L', description: 'Bio-control agent for fungal and bacterial diseases', price: { currency: 'INR', value: '420' }, quantity: { available: 50, unit: 'litre' }, category: 'Bio-fungicide', fulfillment: { type: 'Delivery', estimated_delivery: '3-4 days' } },
                { id: 'item_f005', name: 'Mancozeb 75% WP — 500g', description: 'Broad-spectrum contact fungicide', price: { currency: 'INR', value: '195' }, quantity: { available: 300, unit: 'pack' }, category: 'Fungicide', fulfillment: { type: 'Delivery', estimated_delivery: '2-3 days' } },
            ],
        },
        {
            id: 'bpp_agri_003', name: 'Organic Agri Store (ONDC)', rating: '4.6',
            location: { city: 'Pune', state: 'Maharashtra' },
            items: [
                { id: 'item_p001', name: 'Panchagavya (Organic Pesticide) — 5L', description: 'Traditional organic pest repellent', price: { currency: 'INR', value: '450' }, quantity: { available: 80, unit: 'can' }, category: 'Organic Pesticide', fulfillment: { type: 'Delivery', estimated_delivery: '2-3 days' } },
                { id: 'item_p002', name: 'Beauveria Bassiana — 1kg', description: 'Bio-pesticide for whiteflies, aphids, thrips', price: { currency: 'INR', value: '380' }, quantity: { available: 60, unit: 'kg' }, category: 'Bio-pesticide', fulfillment: { type: 'Delivery', estimated_delivery: '3-4 days' } },
            ],
        },
    ];
    return { context: buildContext('on_search', DOMAIN_AGRI_INPUT, txnId), message: { catalog: { 'bpp/providers': providers } } };
};

const generateBuyerFallback = (produceType, txnId, quantity, unit) => {
    const basePrices = { wheat: 2500, rice: 2800, cotton: 7500, sugarcane: 350, maize: 2200, onion: 3500, tomato: 4000, potato: 1800, mustard: 5500, soyabean: 4800 };
    const base = basePrices[(produceType || '').toLowerCase()] || 3000;
    const v = () => Math.floor(base * (0.85 + Math.random() * 0.3));

    const buyers = [
        { id: 'buyer_001', name: 'AgriTrade FPO (ONDC)', rating: '4.5', location: { city: 'Delhi', state: 'Delhi NCR' }, items: [{ id: 'bid_001', name: `Buying: ${produceType} (Grade A)`, description: `Direct purchase. ${quantity || ''} ${unit || 'quintals'}`, price: { currency: 'INR', value: `${v()}` }, category: 'Buyer Bid', fulfillment: { type: 'Seller-Fulfilled', estimated_delivery: 'Pickup in 3-5 days' } }] },
        { id: 'buyer_002', name: 'Kisan Mandi Wholesale (ONDC)', rating: '4.2', location: { city: 'Mumbai', state: 'Maharashtra' }, items: [{ id: 'bid_002', name: `Buying: ${produceType} (FAQ)`, description: 'Wholesale buyer. Quick UPI payment.', price: { currency: 'INR', value: `${v()}` }, category: 'Buyer Bid', fulfillment: { type: 'Seller-Fulfilled', estimated_delivery: 'Pickup in 2-4 days' } }] },
        { id: 'buyer_003', name: 'Fresh Harvest Exports (ONDC)', rating: '4.7', location: { city: 'Chennai', state: 'Tamil Nadu' }, items: [{ id: 'bid_003', name: `Buying: Premium ${produceType}`, description: 'Export-quality required. Premium rates.', price: { currency: 'INR', value: `${Math.floor(base * 1.15)}` }, category: 'Buyer Bid', fulfillment: { type: 'Seller-Fulfilled', estimated_delivery: 'Pickup in 5-7 days' } }] },
        { id: 'buyer_004', name: 'Village Cooperative (ONDC)', rating: '4.0', location: { city: 'Lucknow', state: 'UP' }, items: [{ id: 'bid_004', name: `Buying: ${produceType} (All Grades)`, description: 'Immediate payment. No commission.', price: { currency: 'INR', value: `${v()}` }, category: 'Buyer Bid', fulfillment: { type: 'Seller-Fulfilled', estimated_delivery: 'Pickup in 1-2 days' } }] },
    ];
    return { context: buildContext('on_search', DOMAIN_AGRI_OUTPUT, txnId), message: { catalog: { 'bpp/providers': buyers } } };
};

// ═══════════════════════════════════════════════════════════════
// GEMINI AI — Chat, Tasks, Treatment, Video Analysis
// ═══════════════════════════════════════════════════════════════

const callGemini = async (prompt, model = 'gemini-2.5-flash-lite') => {
    const apiKey = env('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
            }),
        }
    );

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown');
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const callGeminiMultimodal = async (base64Data, mimeType, prompt, model = 'gemini-2.5-flash-lite') => {
    const apiKey = env('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { inlineData: { mimeType, data: base64Data } },
                        { text: prompt },
                    ],
                }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
            }),
        }
    );

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown');
        throw new Error(`Gemini multimodal error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const getSeason = (month) => {
    if (month >= 2 && month <= 5) return 'Summer (Zaid)';
    if (month >= 6 && month <= 9) return 'Monsoon (Kharif)';
    return 'Winter (Rabi)';
};

const handleGeminiChat = async (body) => {
    const { message, context } = body;
    if (!message) return err(400, 'message required');

    const season = getSeason(new Date().getMonth());

    const systemPrompt = `You are KisanMitra AI, an ORGANIC FARMING expert for Indian farmers.

YOUR MISSION: Promote sustainable, chemical-free agriculture.
ALWAYS PRIORITIZE ORGANIC METHODS:
1. Pest Control: Neem oil, panchagavya, botanical extracts, companion planting
2. Fertilizers: Compost, vermicompost, FYM, green manure, biofertilizers
3. Disease Management: Trichoderma, pseudomonas, organic copper fungicides
4. Traditional Wisdom: Panchagavya, Jeevamrut, Amrit Pani, Beejamrut

CURRENT SEASON: ${season}
DATE: ${new Date().toLocaleDateString('en-IN')}`;

    const userMessage = `${(context || []).length > 0 ? `Previous conversation:\n${context.join('\n')}\n\n` : ''}Farmer's question: ${message}

Provide practical, organic farming advice in simple language with Indian context.`;

    // Use Claude 3 Haiku (Bedrock) for chat responses
    const text = await callBedrock(systemPrompt, userMessage, 0.7);
    return ok({ response: text });
};

const handleGeminiTasks = async (body) => {
    const { userData, soilData, weather } = body;

    const layers = soilData?.properties?.layers || [];
    const ph = layers.find(l => l.name === 'phh2o')?.depths?.[0]?.values?.mean;
    const nitrogen = layers.find(l => l.name === 'nitrogen')?.depths?.[0]?.values?.mean;
    const clay = layers.find(l => l.name === 'clay')?.depths?.[0]?.values?.mean;
    const sand = layers.find(l => l.name === 'sand')?.depths?.[0]?.values?.mean;
    const soc = layers.find(l => l.name === 'soc')?.depths?.[0]?.values?.mean;

    const currentDate = new Date();
    const season = getSeason(currentDate.getMonth());
    const cropType = userData?.fields?.[0]?.crop || 'Not specified';

    const prompt = `You are an ORGANIC FARMING expert for Indian farmers.

CURRENT CONTEXT:
- Date: ${currentDate.toLocaleDateString('en-IN')} (${currentDate.toLocaleDateString('en-IN', { weekday: 'long' })})
- Season: ${season}
- Crop: ${cropType}
- Field Size: ${userData?.fields?.[0]?.area?.toFixed(2) || 'N/A'} acres

SOIL DATA:
- pH: ${ph ? (ph / 10).toFixed(1) : 'N/A'}
- Nitrogen: ${nitrogen ? (nitrogen / 100).toFixed(2) : 'N/A'} g/kg
- Clay: ${clay ? (clay / 10).toFixed(0) : 'N/A'}%
- Sand: ${sand ? (sand / 10).toFixed(0) : 'N/A'}%
- Organic Carbon: ${soc ? (soc / 10).toFixed(1) : 'N/A'} g/kg

WEATHER:
- Temp: ${weather?.main?.temp?.toFixed(1) || 'N/A'}°C
- Humidity: ${weather?.main?.humidity || 'N/A'}%
- Conditions: ${weather?.weather?.[0]?.description || 'N/A'}
- Wind: ${weather?.wind?.speed || 'N/A'} m/s

RESPONSE FORMAT (JSON only, no markdown):
[{"title": "task name", "description": "organic method with Indian context", "priority": "high/medium/low", "category": "irrigation/fertilization/pest_control/harvesting/planting"}]

Generate 5 ORGANIC farming tasks based on current season, weather, and soil conditions.`;

    try {
        const text = await callBedrock(systemPrompt, prompt, 0.5);
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return ok({ tasks: JSON.parse(jsonMatch[0]) });
        throw new Error('Invalid format');
    } catch {
        return ok({
            tasks: [
                { title: 'Apply Organic Compost', description: 'Enrich soil with homemade compost or vermicompost (10 kg per acre)', priority: 'high', category: 'fertilization' },
                { title: 'Prepare Neem Spray', description: 'Make organic neem oil spray (30ml neem oil + 10ml soap in 1L water)', priority: 'high', category: 'pest_control' },
                { title: 'Mulch Field', description: 'Apply organic mulch (straw or leaves) to conserve water', priority: 'medium', category: 'irrigation' },
            ],
        });
    }
};

const handleGeminiTreatment = async (body) => {
    const { diseases, confidences, cropType, location } = body;
    if (!diseases?.length) return err(400, 'diseases array required');

    const diseaseContext = diseases.map((d, i) => {
        const conf = ((confidences?.[i] || 0) * 100).toFixed(1);
        return `- ${d} (${conf}% confidence)`;
    }).join('\n');

    const locCtx = location ? `\nLOCATION: Lat ${location.lat.toFixed(4)}, Lon ${location.lng.toFixed(4)}` : '';

    const prompt = `You are an expert agricultural pathologist specializing in ORGANIC FARMING for Indian farmers.

DETECTED DISEASES:
${diseaseContext}

CROP TYPE: ${cropType || 'Not specified'}${locCtx}

Provide comprehensive ORGANIC treatment recommendations including:
1. Disease Overview
2. Immediate Organic Actions (24-48 hours)
3. Short-term Treatment (1-2 weeks) with recipes and dosages
4. Long-term Prevention
5. Organic Treatment Options (neem, botanical extracts, biocontrol agents, traditional remedies)
6. Monitoring & Follow-up

ALL recommendations must be 100% organic and chemical-free.`;

    const text = await callGemini(prompt);
    return ok({ treatment: text });
};

const handleGeminiVideo = async (body) => {
    const { base64Data, mimeType, cropType, fieldName } = body;
    if (!base64Data) return err(400, 'base64Data required');

    const prompt = `You are an expert agricultural pathologist analyzing a crop video in India.
CROP TYPE: ${cropType || 'Unknown'}
FIELD: ${fieldName || 'Unknown'}

Analyze for: overall health (0-100), diseases, pests, nutrient deficiencies, and organic recommendations.

Respond in JSON:
{"overallHealth":<0-100>,"healthStatus":"<Excellent/Good/Fair/Poor/Critical>","diseases":[{"name":"","severity":"Low/Medium/High","confidence":<0-100>,"symptoms":[""],"organicTreatment":""}],"pests":[{"name":"","severity":"","confidence":<0-100>,"organicControl":""}],"nutrientDeficiencies":[{"nutrient":"","symptoms":"","organicSolution":""}],"recommendations":[""],"detailedAnalysis":""}`;

    const text = await callGeminiMultimodal(base64Data, mimeType || 'video/mp4', prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return ok(JSON.parse(jsonMatch[0]));

    return ok({
        overallHealth: 70, healthStatus: 'Good', diseases: [], pests: [],
        nutrientDeficiencies: [], recommendations: ['Continue monitoring crop health.'],
        detailedAnalysis: text,
    });
};

// ═══════════════════════════════════════════════════════════════
// BHASHINI — Translation (Govt of India API)
// ═══════════════════════════════════════════════════════════════

let cachedBhashiniToken = null;
let bhashiniTokenExpiry = 0;

const getBhashiniToken = async () => {
    if (cachedBhashiniToken && Date.now() < bhashiniTokenExpiry) return cachedBhashiniToken;

    const apiKey = env('BHASHINI_API_KEY');
    const userId = env('BHASHINI_USER_ID');
    const pipelineId = env('BHASHINI_PIPELINE_ID') || '64392f96daac500b55c543cd';

    if (!apiKey || !userId) throw new Error('BHASHINI credentials not configured');

    const res = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
        method: 'POST',
        headers: { 'ulcaApiKey': apiKey, 'userID': userId, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pipelineTasks: [{ taskType: 'asr' }, { taskType: 'translation' }, { taskType: 'tts' }],
            pipelineRequestConfig: { pipelineId },
        }),
    });

    if (!res.ok) throw new Error(`Bhashini auth failed (${res.status})`);

    const data = await res.json();
    const token = data.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;
    if (!token) throw new Error('No auth token in Bhashini response');

    cachedBhashiniToken = token;
    bhashiniTokenExpiry = Date.now() + 3500000;
    return token;
};

const handleTranslation = async (body) => {
    const { mode, audioBase64, language, text, sourceLanguage, targetLanguage } = body;

    // ─── ASR Mode: audio (base64 WAV) → transcript ────────────
    if (mode === 'asr') {
        if (!audioBase64) return err(400, 'audioBase64 required for ASR mode');
        try {
            const token = await getBhashiniToken();
            const langCode = language || 'hi';

            const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
                method: 'POST',
                headers: { 'Accept': '*/*', 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pipelineTasks: [{
                        taskType: 'asr',
                        config: { language: { sourceLanguage: langCode } },
                    }],
                    inputData: { audio: [{ audioContent: audioBase64 }] },
                }),
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => 'Unknown');
                throw new Error(`ASR API error (${res.status}): ${errText}`);
            }

            const data = await res.json();
            const transcript = data.pipelineResponse?.[0]?.output?.[0]?.source || '';
            console.log('Bhashini ASR transcript:', transcript);
            return ok({ transcript });
        } catch (error) {
            console.error('ASR failed:', error.message);
            // Return empty transcript so client can show keyboard fallback
            return ok({ transcript: '', error: error.message });
        }
    }

    // ─── Translation Mode: text → translatedText ──────────────
    if (!text) return err(400, 'text required');
    if (sourceLanguage === targetLanguage || !targetLanguage) return ok({ translatedText: text });

    try {
        const token = await getBhashiniToken();

        const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
            method: 'POST',
            headers: { 'Accept': '*/*', 'Authorization': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pipelineTasks: [{
                    taskType: 'translation',
                    config: { language: { sourceLanguage: sourceLanguage || 'en', targetLanguage }, serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4' },
                }],
                inputData: { input: [{ source: text }] },
            }),
        });

        if (!res.ok) throw new Error(`Translation API error (${res.status})`);

        const data = await res.json();
        const translated = data.pipelineResponse?.[0]?.output?.[0]?.target;
        return ok({ translatedText: translated || text });
    } catch (error) {
        console.error('Translation failed:', error);
        return ok({ translatedText: text, error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// WEATHER — OpenWeather Proxy
// ═══════════════════════════════════════════════════════════════

const handleWeather = async (query) => {
    const apiKey = env('OPENWEATHER_API_KEY');
    if (!apiKey) return err(500, 'OPENWEATHER_API_KEY not configured');

    const { lat, lon } = query;
    if (!lat || !lon) return err(400, 'lat and lon query params required');

    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown');
        return err(res.status, `Weather API error: ${errText}`);
    }

    return ok(await res.json());
};

const inferImageContentType = (buffer, fallback = 'image/jpeg') => {
    if (!buffer || buffer.length < 12) return fallback;

    // JPEG magic number: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    // PNG magic number: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
    // WEBP magic: RIFF....WEBP
    if (
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return 'image/webp';
    }

    return fallback;
};

const extractMultipartFile = (bodyBuffer, contentTypeHeader) => {
    const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];
    if (!boundary) return null;

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const separatorBuffer = Buffer.from('\r\n\r\n');
    const trailingCrlf = Buffer.from('\r\n');

    let cursor = bodyBuffer.indexOf(boundaryBuffer);
    while (cursor !== -1) {
        const nextBoundary = bodyBuffer.indexOf(boundaryBuffer, cursor + boundaryBuffer.length);
        if (nextBoundary === -1) break;

        let part = bodyBuffer.slice(cursor + boundaryBuffer.length, nextBoundary);

        if (part.length >= 2 && part[0] === 0x0d && part[1] === 0x0a) {
            part = part.slice(2); // Trim part-leading CRLF
        }

        const headerEnd = part.indexOf(separatorBuffer);
        if (headerEnd !== -1) {
            const headerText = part.slice(0, headerEnd).toString('utf-8');
            const hasFilename = /content-disposition:\s*form-data;[^\r\n]*filename=/i.test(headerText);

            if (hasFilename) {
                let fileBuffer = part.slice(headerEnd + separatorBuffer.length);
                if (fileBuffer.length >= 2 && fileBuffer.slice(-2).equals(trailingCrlf)) {
                    fileBuffer = fileBuffer.slice(0, -2);
                }

                const partTypeMatch = headerText.match(/content-type:\s*([^\r\n;]+)/i);
                const partContentType = partTypeMatch?.[1]?.trim() || inferImageContentType(fileBuffer);

                return {
                    fileBuffer,
                    contentType: partContentType,
                };
            }
        }

        cursor = nextBoundary;
    }

    return null;
};

// ═══════════════════════════════════════════════════════════════
// DISEASE DETECTION — AWS SageMaker Serverless Inference
// ═══════════════════════════════════════════════════════════════

const handleDiseaseDetection = async (event) => {
    const endpointName = env('SAGEMAKER_ENDPOINT_NAME') || 'kisanmitra-disease-endpoint';
    // AWS_REGION is automatically provided by Lambda runtime
    const region = process.env.AWS_REGION || 'us-east-1';

    const requestContentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';

    let bodyBuffer;
    if (event.isBase64Encoded) {
        bodyBuffer = Buffer.from(event.body, 'base64');
    } else {
        bodyBuffer = Buffer.from(event.body || '', 'utf-8');
    }

    // Frontend sends FormData, but SageMaker expects raw image bytes.
    let inferenceBuffer = bodyBuffer;
    let inferenceContentType = requestContentType || 'application/octet-stream';

    if (requestContentType.toLowerCase().includes('multipart/form-data')) {
        const extracted = extractMultipartFile(bodyBuffer, requestContentType);
        if (!extracted || !extracted.fileBuffer || extracted.fileBuffer.length === 0) {
            return err(400, 'No image file found in multipart request');
        }

        inferenceBuffer = extracted.fileBuffer;
        inferenceContentType = inferImageContentType(extracted.fileBuffer, extracted.contentType || 'image/jpeg');
    }

    try {
        // Import AWS SDK v3 SageMaker Runtime client (available in Lambda Node.js 20 runtime)
        const { SageMakerRuntimeClient, InvokeEndpointCommand } = await import('@aws-sdk/client-sagemaker-runtime');

        const client = new SageMakerRuntimeClient({ region });

        const command = new InvokeEndpointCommand({
            EndpointName: endpointName,
            ContentType: inferenceContentType,
            Body: inferenceBuffer,
            Accept: 'application/json',
        });

        const response = await client.send(command);

        // Parse SageMaker response
        const responseBody = Buffer.from(response.Body).toString('utf-8');
        const data = JSON.parse(responseBody);

        console.log('SageMaker inference successful:', { endpointName, predictionsCount: data.predictions?.length || 0 });

        return ok(data);
    } catch (error) {
        console.error('SageMaker inference error:', error);

        // Fallback to HuggingFace if SageMaker fails (for development/testing)
        const hfEndpoint = env('DISEASE_DETECTION_ENDPOINT');
        if (hfEndpoint) {
            console.log('Falling back to HuggingFace endpoint...');
            try {
                const hfApiKey = env('HUGGINGFACE_API_KEY');
                const res = await fetch(hfEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': inferenceContentType,
                        ...(hfApiKey && { 'Authorization': `Bearer ${hfApiKey}` }),
                    },
                    body: inferenceBuffer,
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => 'Unknown');
                    return err(res.status, `HuggingFace fallback error: ${errText}`);
                }

                const data = await res.json();
                return ok({ ...data, source: 'huggingface_fallback' });
            } catch (fallbackError) {
                console.error('HuggingFace fallback also failed:', fallbackError);
                return err(500, `Disease detection failed: ${fallbackError.message}`);
            }
        }

        return err(500, `SageMaker inference failed: ${error.message}`);
    }
};
