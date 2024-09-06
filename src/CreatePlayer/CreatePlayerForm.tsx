import { FormEvent, useState } from "react";

interface CreatePlayerFormProps {
    onCreatePlayer: (loggedInPlayer: string) => void;
}

function CreatePlayerForm({ onCreatePlayer }: CreatePlayerFormProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleSubmit(e: FormEvent<HTMLFormElement>, username: string, password: string): void {
        e.preventDefault();

        fetch("http://localhost:8080/player/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "*"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(res => res.text()) 
            .then(data => {
                if (data === "User already exists") {
                    alert(data); 
                } else {
                    const loggedInPlayer = data; 
                    localStorage.setItem("loggedInPlayer", loggedInPlayer);
                    onCreatePlayer(loggedInPlayer);
                    setUsername("");
                    setPassword("");
                }
            })
    }

    return (
        <>
            <form className="createPlayerForm" onSubmit={(e) => handleSubmit(e, username, password)}>
                <input type="text" value={username} onChange={((e) => setUsername(e.target.value))}></input>
                <input type="password" value={password} onChange={((e) => setPassword(e.target.value))}></input>
                <button type="submit">Registrera</button>
            </form>
        </>
    )
}
export default CreatePlayerForm;