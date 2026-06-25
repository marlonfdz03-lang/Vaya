export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "signup", ...data }),
  });
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "signin", email, password }),
  });
  return res.json();
}
