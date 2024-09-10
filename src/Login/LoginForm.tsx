import { FormEvent, useState } from "react";

interface LoginFormProps {
    onLogin: (loggedInPlayer: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleSubmit(e: FormEvent<HTMLFormElement>, username: string, password: string): void {
        e.preventDefault();
        fetch("https://plankton-app-dtvpj.ondigitalocean.app/player/login",{
        // fetch("http://localhost:8080/player/login", {
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
            .then(res => res.text())
            .then(data => {

                if (data.length === 60) {
                    alert("Wrong username or password")
                } else {
                    const loggedInPlayer = data;
                    console.log(data);
                    localStorage.setItem("loggedInPlayer", loggedInPlayer);
                    onLogin(loggedInPlayer);
                    setUsername("");
                    setPassword("");
                    alert(data)
                }
            })
    }
    return (
        <>
            <form className="loginForm" onSubmit={(e) => handleSubmit(e, username, password)}>
                <input type="text" value={username} onChange={((e) => setUsername(e.target.value))}></input>
                <input type="password" value={password} onChange={((e) => setPassword(e.target.value))}></input>
                <button type="submit">Logga in</button>
            </form>
        </>
    )
}
export default LoginForm;