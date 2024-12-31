const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
    console.log('Function started');
    console.log('Environment check:', {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        stripeKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0
    });

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        console.log('Request body:', event.body);
        const data = JSON.parse(event.body);
        // Get the site URL from the request headers or environment variable
        const siteUrl = process.env.URL || event.headers.origin || 'https://677408f--classy-biscochitos-e1a7a1.netlify.app';
        
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw new Error('No items provided');
        }

        console.log('Creating session with items:', data.items);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: data.items.map(item => ({
                price_data: {
                    currency: 'ron',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents and ensure it's an integer
                },
                quantity: item.quantity,
            })),
            success_url: `${siteUrl}/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}&order_number=${data.orderNumber}`,
            cancel_url: `${siteUrl}/checkout.html`,
            customer_email: data.customerEmail,
            metadata: {
                order_number: data.orderNumber,
                delivery_method: data.orderData.delivery.deliveryMethod,
                customer_name: `${data.orderData.delivery.firstName} ${data.orderData.delivery.lastName}`,
                shipping_address: data.orderData.delivery.address,
                county: data.orderData.delivery.county,
                phone: data.orderData.delivery.phone
            }
        });

        console.log('Session created:', session.id);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ 
                id: session.id,
                url: session.url 
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ 
                error: error.message 
            })
        };
    }
}
