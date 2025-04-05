import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

export default function ChatPage() {
    const { rideId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const hubConnectionRef = useRef(null);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/hubs/chat", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR Connected");

                // Ensure group join
                await connection.invoke("JoinRideGroup", rideId.toString());
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
                setTimeout(startConnection, 5000);
            }
        };

        // Clear previous handlers before adding new one
        connection.off("ReceiveMessage");
        connection.on("ReceiveMessage", (messageId, content, senderName, sentAt) => {
            console.log("Received via SignalR:", content);
            setMessages(prev => {
                // Prevent adding duplicate messageId
                if (prev.some(m => m.messageId === messageId)) return prev;
                return [...prev, { messageId, content, senderName, sentAt }];
            });
        });

        startConnection();
        hubConnectionRef.current = connection;

        return () => {
            if (connection) {
                connection.invoke("LeaveRideGroup", rideId.toString())
                    .then(() => connection.stop())
                    .catch(err => console.error("Error leaving chat: ", err));
            }
        };
    }, [rideId, token, navigate]);


    // Fetch messages when page loads
    useEffect(() => {
        if (!token) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/message/ride/${rideId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("Unable to load messages.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [rideId, token]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(
                `/api/message/ride/${rideId}/send`,
                { content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // No need to manually add message — will be pushed via SignalR
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message.");
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
            <h2>Ride Chat Room (Ride #{rideId})</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading ? (
                <p>Loading messages...</p>
            ) : (
                <div
                    ref={scrollRef}
                    style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        padding: "10px",
                        borderRadius: "6px",
                        backgroundColor: "#f4f4f4",
                        marginBottom: "20px"
                    }}
                >
                    {messages.length === 0 ? (
                        <p><i>No messages yet.</i></p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.messageId} style={{ marginBottom: "12px" }}>
                                <strong>{msg.senderName}:</strong> {msg.content}
                                <div style={{ fontSize: "12px", color: "#777" }}>
                                    {new Date(msg.sentAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}