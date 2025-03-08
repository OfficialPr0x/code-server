const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

console.log('Checking if AI War Room server is running...');

const req = http.request(options, (res) => {
  console.log(`Server status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received successfully');
    console.log(`Response length: ${data.length} characters`);
    console.log('Server is up and running!');
  });
});

req.on('error', (error) => {
  console.error('Error connecting to the server:');
  console.error(error.message);
});

req.end(); 