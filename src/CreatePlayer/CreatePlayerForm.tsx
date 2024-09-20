import { FormEvent, useState } from "react";

interface CreatePlayerFormProps {
    onCreatePlayer: (loggedInPlayer: string) => void;
}
interface Player {
    id: string;
    username: string;
    password: string;
    scoreList: []; 
} 

function CreatePlayerForm({ onCreatePlayer }: CreatePlayerFormProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleSubmit(e: FormEvent<HTMLFormElement>, username: string, password: string): void {
        e.preventDefault();
        // fetch("http://localhost:8080/player/create", {
            fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/create', {
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
                // const loggedInPlayer = JSON.stringify(data); 
                localStorage.setItem("loggedInPlayer", JSON.stringify(data));
                const CreateTtest = localStorage.getItem("loggedInPlayer");
                console.log("LoggedInPlayer:", CreateTtest);            
                onCreatePlayer(data.username);
                setUsername("");
                setPassword("");
                alert(`Welcome ${data.username}`);       
            })
    }

    return (
        <>
            <form className="createPlayerForm" onSubmit={(e) => handleSubmit(e, username, password)}>
                <input type="text" value={username} onChange={((e) => setUsername(e.target.value))} placeholder="Username"></input>
                <input type="password" value={password} onChange={((e) => setPassword(e.target.value))} placeholder="Password"></input>
                <button type="submit">Registrera</button>
            </form>
        </>
    )
}
export default CreatePlayerForm;