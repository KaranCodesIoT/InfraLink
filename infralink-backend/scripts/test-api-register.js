const register = async () => {
  try {
    const response = await fetch('https://infralink-production.up.railway.app/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Abhi Test',
        email: 'abhi@gmail.com',
        password: 'password123',
        role: 'builder'
      })
    });
    
    const data = await response.json();
    console.log('Status code:', response.status);
    if (response.ok) {
        console.log('Register Success! User:', data.data.user.email);
    } else {
        console.log('Register Failed:', data);
    }
  } catch (err) {
    console.error('Error connecting to backend:', err.message);
  }
};

register();
