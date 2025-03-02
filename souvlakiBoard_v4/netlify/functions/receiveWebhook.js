// netlify/functions/receiveWebhook.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the incoming JSON data
    const data = JSON.parse(event.body);

    // Log the received data (for debugging)
    console.log('Received data:', data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data received successfully!', data }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
}