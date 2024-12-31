const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static('./'));

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Function to send WhatsApp notification
async function sendWhatsAppNotification(orderData) {
    try {
        console.log('\n=== Starting WhatsApp Notification ===');
        console.log('Order Number:', orderData.orderNumber);
        
        // Validate API credentials
        if (!process.env.WHATSAPP_PHONE || !process.env.WHATSAPP_API_KEY) {
            throw new Error('Missing WhatsApp API credentials');
        }
        
        console.log('Using WhatsApp Phone:', process.env.WHATSAPP_PHONE);
        console.log('Using API Key:', process.env.WHATSAPP_API_KEY);
        
        // Format cart items
        const cartItems = orderData.cart.map(item => 
            `• ${item.name} - ${item.quantity} x ${item.price} lei = ${item.price * item.quantity} lei`
        ).join('\n');

        // Calculate total
        const subtotal = orderData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = orderData.delivery.deliveryMethod === 'pickup' ? 0 : 15;
        const total = subtotal + shipping;

        // Format delivery info
        const deliveryMethod = orderData.delivery.deliveryMethod === 'pickup' ? 'Ridicare din Magazin' : 'Curier';
        const address = orderData.delivery.deliveryMethod === 'pickup' ? 'Ridicare din magazin' : 
            `${orderData.delivery.address}, ${orderData.delivery.county}`;

        // Create message in smaller chunks
        const message = [
            `🌸 *Comandă Nouă Bloomery* 🌸`,
            ``,
            `*Număr Comandă:* ${orderData.orderNumber}`,
            `*Data:* ${new Date(orderData.date).toLocaleString('ro-RO')}`,
            ``,
            `*Client:*`,
            `${orderData.delivery.firstName} ${orderData.delivery.lastName}`,
            `📱 ${orderData.delivery.phone}`,
            `📧 ${orderData.delivery.email}`,
            ``,
            `*Livrare:*`,
            `Metoda: ${deliveryMethod}`,
            `Adresa: ${address}`,
            ``,
            `*Produse:*`,
            cartItems,
            ``,
            `*Subtotal:* ${subtotal} lei`,
            `*Transport:* ${shipping} lei`,
            `*Total:* ${total} lei`,
            ``,
            `*Status:* ${orderData.status}`,
            `*Plată:* ${orderData.payment.method} - ${orderData.payment.status}`
        ].join('\n');

        console.log('Message to send:', message);

        // Construct API URL
        const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_PHONE}&text=${encodeURIComponent(message)}&apikey=${process.env.WHATSAPP_API_KEY}`;
        console.log('API URL:', apiUrl);
        
        // Send request with timeout
        console.log('Sending WhatsApp request...');
        const response = await axios.get(apiUrl, { 
            timeout: 10000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('WhatsApp API Response:', response.data);
        
        if (response.data.includes('Message queued') || response.data.includes('Message Queued')) {
            console.log('WhatsApp notification sent successfully');
            return { success: true, message: 'WhatsApp notification sent successfully' };
        } else {
            throw new Error('Unexpected API response: ' + response.data);
        }
    } catch (error) {
        console.error('=== WhatsApp Notification Error ===');
        console.error('Error details:', error);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
        return { 
            success: false, 
            error: error.message,
            details: error.response ? error.response.data : null,
            code: error.code
        };
    }
}

// Endpoint to create checkout session
app.post('/create-checkout', async (req, res) => {
    console.log('=== Starting Checkout Creation ===');
    try {
        const { items, customerEmail, orderData } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('No items provided');
        }

        // Calculate total
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = orderData.delivery.deliveryMethod === 'pickup' ? 0 : 15;
        const total = subtotal + shipping;

        // Store minimal order data
        const minimalOrderData = {
            orderNumber: orderData.orderNumber,
            customerName: `${orderData.delivery.firstName} ${orderData.delivery.lastName}`,
            phone: orderData.delivery.phone,
            email: orderData.delivery.email,
            total: total
        };

        // Create success URL with order number
        const success_url = `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderData.orderNumber}`;

        // Store full order data in memory (temporary storage)
        global.pendingOrders = global.pendingOrders || {};
        global.pendingOrders[orderData.orderNumber] = orderData;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'ron',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: success_url,
            cancel_url: 'http://localhost:3000/checkout.html',
            customer_email: customerEmail,
            metadata: {
                orderNumber: orderData.orderNumber,
                customerName: minimalOrderData.customerName,
                phone: minimalOrderData.phone
            }
        });

        console.log('Created Stripe session:', session.id);
        res.json({ id: session.id });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test WhatsApp endpoint
app.get('/test-whatsapp', async (req, res) => {
    try {
        console.log('\n=== Testing WhatsApp API ===');
        
        // Validate API credentials
        if (!process.env.WHATSAPP_PHONE || !process.env.WHATSAPP_API_KEY) {
            throw new Error('Missing WhatsApp API credentials');
        }

        const testMessage = 'Test message from Bloomery 🌸';
        const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_PHONE}&text=${encodeURIComponent(testMessage)}&apikey=${process.env.WHATSAPP_API_KEY}`;
        
        console.log('Sending test message...');
        const response = await axios.get(apiUrl, { timeout: 10000 });
        console.log('API Response:', response.data);

        if (response.data.includes('Message queued') || response.data.includes('Message Queued')) {
            res.json({ success: true, message: 'Test message sent successfully' });
        } else {
            throw new Error('Unexpected API response: ' + response.data);
        }
    } catch (error) {
        console.error('Test WhatsApp Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response ? error.response.data : null 
        });
    }
});

// Handle successful payment
app.get('/payment-success', async (req, res) => {
    console.log('\n=== Payment Success Handler Started ===');
    console.log('Query parameters:', req.query);
    
    try {
        const { session_id, order_number } = req.query;
        
        if (!session_id || !order_number) {
            console.error('Missing required parameters');
            return res.redirect('/checkout.html?error=missing_params');
        }

        // Verify the session was paid
        console.log('Retrieving Stripe session:', session_id);
        const session = await stripe.checkout.sessions.retrieve(session_id);
        console.log('Session retrieved:', session.id);
        console.log('Payment status:', session.payment_status);

        // Get full order data from memory
        const orderData = global.pendingOrders[order_number];
        if (!orderData) {
            console.error('Order data not found for order number:', order_number);
            return res.redirect('/checkout.html?error=order_not_found');
        }

        try {
            // Update payment status
            orderData.payment.status = session.payment_status;
            orderData.status = session.payment_status === 'paid' ? 'confirmed' : 'pending';
            console.log('Updated order status:', orderData.status);

            // Send WhatsApp notification
            console.log('\n=== Sending WhatsApp Notification ===');
            const notificationResult = await sendWhatsAppNotification(orderData);
            console.log('WhatsApp notification result:', notificationResult);

            if (!notificationResult.success) {
                console.error('Failed to send WhatsApp notification:', notificationResult);
                // Try sending again with a simpler message
                console.log('Attempting to send simplified notification...');
                const simpleMessage = `🌸 Comandă Nouă Bloomery 🌸\n\nComanda #${orderData.orderNumber}\nClient: ${orderData.delivery.firstName} ${orderData.delivery.lastName}\nTelefon: ${orderData.delivery.phone}`;
                const simpleNotification = await sendWhatsAppNotification({
                    ...orderData,
                    cart: orderData.cart.map(item => ({
                        ...item,
                        name: item.name.substring(0, 30) // Truncate long names
                    }))
                });
                console.log('Simple notification result:', simpleNotification);
            }

            // Clean up order data from memory
            delete global.pendingOrders[order_number];
            
            // Redirect to success page
            console.log('Redirecting to success page...');
            return res.redirect(`/success.html?session_id=${session_id}&order_number=${order_number}`);

        } catch (error) {
            console.error('Error processing order:', error);
            console.error('Stack trace:', error.stack);
            return res.redirect('/checkout.html?error=processing_failed');
        }
    } catch (error) {
        console.error('=== Payment Success Handler Error ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        return res.redirect('/checkout.html?error=payment_verification_failed');
    }
});

// Check payment status
app.get('/check-payment/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Checking payment status for session:', sessionId);

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const payment = await stripe.paymentIntents.retrieve(session.payment_intent);

        console.log('Payment details:', {
            id: payment.id,
            amount: payment.amount / 100, // Convert from cents to whole currency
            status: payment.status,
            created: new Date(payment.created * 1000).toLocaleString(),
            currency: payment.currency,
            paymentMethod: payment.payment_method_types[0]
        });

        res.json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100,
                status: payment.status,
                created: new Date(payment.created * 1000).toLocaleString(),
                currency: payment.currency,
                paymentMethod: payment.payment_method_types[0]
            }
        });
    } catch (error) {
        console.error('Error checking payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get WhatsApp credentials endpoint
app.get('/api/whatsapp-credentials', (req, res) => {
    if (!process.env.WHATSAPP_PHONE || !process.env.WHATSAPP_API_KEY) {
        return res.status(500).json({ error: 'WhatsApp credentials not configured' });
    }
    res.json({
        phone: process.env.WHATSAPP_PHONE,
        apiKey: process.env.WHATSAPP_API_KEY
    });
});

// Add this near your other routes
app.get('/payment-details', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .payment-details {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
                .error {
                    color: red;
                    margin-top: 10px;
                }
                button {
                    background: #E8B4B8;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                }
                button:hover {
                    background: #D49FA3;
                }
                input {
                    padding: 8px;
                    margin-right: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    width: 300px;
                }
            </style>
        </head>
        <body>
            <h1>Verifică Status Plată</h1>
            <div>
                <input type="text" id="sessionId" placeholder="Introdu Session ID">
                <button onclick="checkPayment()">Verifică</button>
            </div>
            <div id="result" class="payment-details"></div>

            <script>
                async function checkPayment() {
                    const sessionId = document.getElementById('sessionId').value;
                    if (!sessionId) {
                        document.getElementById('result').innerHTML = '<div class="error">Te rog introdu Session ID</div>';
                        return;
                    }

                    try {
                        const response = await fetch(\`/check-payment/\${sessionId}\`);
                        const data = await response.json();

                        if (data.success) {
                            const payment = data.payment;
                            document.getElementById('result').innerHTML = \`
                                <h2>Detalii Plată</h2>
                                <p><strong>ID:</strong> \${payment.id}</p>
                                <p><strong>Sumă:</strong> \${payment.amount} \${payment.currency.toUpperCase()}</p>
                                <p><strong>Status:</strong> \${payment.status}</p>
                                <p><strong>Data:</strong> \${payment.created}</p>
                                <p><strong>Metodă:</strong> \${payment.paymentMethod}</p>
                            \`;
                        } else {
                            document.getElementById('result').innerHTML = \`
                                <div class="error">Error: \${data.error}</div>
                            \`;
                        }
                    } catch (error) {
                        document.getElementById('result').innerHTML = \`
                            <div class="error">Error: \${error.message}</div>
                        \`;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

const port = 3000;
app.listen(port, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`=== Ready for Requests ===\n`);
});
