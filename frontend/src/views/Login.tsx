function Login() {
  

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    console.log(data);
  };

  return (
    <form onSubmit={login}>
      <label htmlFor="username">Username: </label>
      <input
        type="text"
        id="username"
        name="username"
      />
      <label htmlFor="password">Password: </label>
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