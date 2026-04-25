const login = async () => {
  try {
    const response = await fetch('https://infralink-production.up.railway.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abhi@gmail.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Status code:', response.status);
    if (response.ok) {
        console.log('Login Success! User:', data.data.user.email);
        console.log('Token received successfully.');
    } else {
        console.log('Login Failed:', data);
    }
  } catch (err) {
    console.error('Error connecting to backend:', err.message);
  }
};

login();
