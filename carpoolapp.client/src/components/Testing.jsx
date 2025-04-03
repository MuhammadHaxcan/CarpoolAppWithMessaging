import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const SignalRTest = () => {
    const [status, setStatus] = useState("Not connected");
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Full URL to backend
        const hubUrl = "https://localhost:7172/chatHub";

        // Log the attempt
        console.log("Attempting to connect to SignalR at:", hubUrl);
        addLog(`Connecting to ${hubUrl}...`);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        connection.onclose((error) => {
            setStatus("Disconnected");
            addLog(`Connection closed: ${error ? error.message : "No error"}`);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                setStatus("Connected!");
                addLog("Connection successful!");
            } catch (err) {
                setStatus("Connection failed");
                addLog(`Connection failed: ${err.message}`);
                console.error("SignalR Connection Error:", err);
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        // Clean up
        return () => {
            connection.stop();
        };
    }, []);

    const addLog = (message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>SignalR Connection Test</h2>
            <div style={{ marginBottom: "20px" }}>
                <strong>Status:</strong> <span style={{ color: status === "Connected!" ? "green" : "red" }}>{status}</span>
            </div>
            <div>
                <h3>Connection Logs:</h3>
                <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", height: "200px", overflow: "auto" }}>
                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                </pre>
            </div>
        </div>
    );
};

export default SignalRTest;