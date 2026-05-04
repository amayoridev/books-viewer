const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function login(username, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ username, password }),
    redirect: 'manual'
  });

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('Login failed, no session cookie received');
  }

  const cookie = setCookie.split(';')[0];
  return cookie;
}

async function uploadBook(cookie) {
  const formData = new FormData();
  formData.append('name', 'Sample Book Title');
  formData.append('author', 'Sample Author');
  formData.append('description', 'This is a sample description for the uploaded book.');
  formData.append('category', '');
  formData.append('pdf', fs.createReadStream(path.join(__dirname, 'sample.pdf')));
  formData.append('thumbnail', fs.createReadStream(path.join(__dirname, 'sample-thumbnail.jpg')));

  const response = await fetch(`${BASE_URL}/api/books/upload`, {
    method: 'POST',
    headers: {
      Cookie: cookie
    },
    body: formData
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${responseBody}`);
  }

  return JSON.parse(responseBody);
}

(async () => {
  try {
    const username = 'admin';
    const password = 'password';

    console.log('Logging in...');
    const cookie = await login(username, password);
    console.log('Login successful, session cookie acquired.');

    console.log('Uploading book...');
    const result = await uploadBook(cookie);
    console.log('Book upload succeeded:', result);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
