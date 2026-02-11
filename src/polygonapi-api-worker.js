/**
* Welcome to Cloudflare Workers! This is your first worker.
*
* - Run `npm run dev` in your terminal to start a development server
* - Open a browser tab at http://localhost:8787/ to see your worker in action
* - Run `npm run deploy` to publish your worker
*
* Learn more at https://developers.cloudflare.com/workers/
*/

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}


export default {
	async fetch(request, env, ctx) {
		//handle CORS preflight request	
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}
		
		// only process GET requests
		if (request.method !== 'GET') {
			return new Response(JSON.stringify({error: 'Only GET requests are allowed'}), { status: 405, headers: corsHeaders });
		}
		
		// Parse the URL from the incoming request
		const url = new URL(request.url);
		
		// Extract ticker and dates from the request URL
		const ticker = url.searchParams.get('ticker');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');
		
		// Ensure necessary parameters are present
		if (!ticker || !startDate || !endDate) {
			return new Response(JSON.stringify({error: 'Missing required parameters'}), { status: 400, headers: corsHeaders });
		}
		
		// Construct the Polygon API URL
		const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}`;
		
		try {
			const response = await fetch(
				`${polygonUrl}?apiKey=${env.POLYGONAPI_API_KEY}`
			);
			
			if (!response.ok) {
				throw new Error('Failed to fetch stock data from API');
			}
			
			const data = await response.json();
			delete data.request_id;
			return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
		} catch (err) {
			return new Response(JSON.stringify({error: err.message}), { status: 500, headers: corsHeaders });
		}
	},
};