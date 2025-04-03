import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const ChatDashboard = () => {
    const { rideId } = useParams(); // Get rideId from URL
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [connection, setConnection] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    const navigate = useNavigate();

    const userToken = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userToken) {
            console.error("No user token found. Redirecting to login.");
            navigate("/");
            return;
        }

        if (!userId) {
            console.error("UserId is required.");
            return;
        }
    }, [userToken, userId, navigate]);

    useEffect(() => {
        if (!userId || !rideId) {
            console.warn("Waiting for userId or rideId to be set...");
            return;
        }

        console.log("Initializing chat for ride:", rideId);

        // Fetch the existing messages from the backend
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/messages/conversation/${rideId}`, {
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (response.status === 200) {
                    const loadedMessages = response.data;
                    console.log("Loaded messages:", loadedMessages);
                    setMessages(loadedMessages); // Set the loaded messages to the state
                } else {
                    console.error("Failed to load messages.");
                }
            } catch (error) {
                console.error("Error loading messages:", error);
            }
        };

        fetchMessages(); // Call the function to load messages

        const hubUrl = "https://localhost:7172/chatHub";
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => userToken,
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        newConnection.onclose((error) => {
            setConnectionStatus("Disconnected");
            console.error("SignalR connection closed", error);
        });

        newConnection.onreconnecting((error) => {
            setConnectionStatus("Reconnecting");
            console.warn("SignalR reconnecting", error);
        });

        newConnection.onreconnected((connectionId) => {
            setConnectionStatus("Connected");
            console.log("SignalR reconnected", connectionId);
        });

        const startConnection = async () => {
            try {
                console.log("Starting SignalR connection...");
                await newConnection.start();
                console.log("Connected to SignalR successfully!");
                setConnectionStatus("Connected");

                await newConnection.invoke("JoinConversation", rideId);
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                setConnectionStatus("Connection Failed");
                setTimeout(startConnection, 5000);
            }
        };

        newConnection.on("ReceiveMessage", (senderUserId, senderName, msg) => {
            console.log("Message received:", senderUserId, senderName, msg);

            // Ensure msg is a string or contains the content as expected
            const content = typeof msg === "object" ? msg.content : msg;  // Handle case if msg is an object

            // Update messages state with new message
            setMessages((prevMessages) => [
                ...prevMessages,
                { senderId: senderUserId, senderName, content }
            ]);
        });

        setConnection(newConnection);
        startConnection();

        return () => {
            if (newConnection) {
                console.log("Stopping connection...");
                newConnection.stop();
            }
        };
    }, [userId, userToken, rideId]);

    const sendMessage = async () => {
        if (!userId || !rideId) {
            console.warn("Cannot send message, missing userId or rideId.");
            return;
        }

        const parsedUserId = parseInt(userId, 10);
        const parsedRideId = parseInt(rideId, 10);

        if (isNaN(parsedUserId) || isNaN(parsedRideId)) {
            console.error("Invalid userId or rideId format.");
            return;
        }

        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            console.error("SignalR connection is not established.");
            return;
        }

        try {
            console.log("Sending message...");

            const response = await axios.post("/api/messages/send", {
                senderId: userId,
                content: message || null,
                rideId: rideId,  // Ensure rideId is properly included
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.status === 200 && response.data.success) {
                console.log("Message saved successfully!");

                // Broadcast the message to SignalR clients
                await connection.invoke("SendMessage", rideId, parsedUserId, message)
                    .catch(err => console.error("SignalR invoke error:", err));

                console.log("Message sent successfully to SignalR!");
                setMessage(""); // Clear the message input
            } else {
                console.error("Failed to send message to the backend.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div>
            <h1>Chat Dashboard</h1>
            <p>Status: {connectionStatus}</p>
            <p>Ride ID: {rideId}</p> {/* Show Ride ID for debugging */}
            <div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.senderName}:</strong> {msg.content}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default ChatDashboard;
