function Login() {
  const API_URL = "http://localhost:8000";

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`${API_URL}/token`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.access_token) {
        localStorage.setItem('jwtToken', data.access_token);
    }
    console.log(data);
  };

  return (
    <form onSubmit={login}>
      <input
        type="text"
        id="username"
        name="username"
      />
      <input
        type="password"
        id="password"
        name="password"
      />
      <input type="submit" />
    </form>
  );
}

export default Login;