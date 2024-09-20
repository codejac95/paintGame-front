import { FormEvent, useState } from "react";

interface LoginFormProps {
    onLogin: (loggedInPlayer: string) => void;
}

interface Player {
    id: string;
    username: string;
    password: string;
    scoreList: [];
}

function LoginForm({ onLogin }: LoginFormProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleSubmit(e: FormEvent<HTMLFormElement>, username: string, password: string): void {
        e.preventDefault();
        fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/login', {
            //fetch("http://localhost:8080/player/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                "username": username,
                "password": password
            })
        })
            .then(res => res.json())
            .then((data: Player) => {

                if (!data.id) {
                    alert("Failed to login");
                    setUsername("")
                    setPassword("")
                } else {

                    localStorage.setItem("loggedInPlayer", JSON.stringify(data));

                    onLogin(data.username);
                    setUsername("");
                    setPassword("");
                    alert(`Welcome ${data.username}`);
                }
            })
            .catch(err => {
                console.error("Error during login:", err);
            });
    }

    return (
        <>
            <form className="loginForm" onSubmit={(e) => handleSubmit(e, username, password)}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button type="submit">Logga in</button>
            </form>
        </>
    );
}

export default LoginForm;
