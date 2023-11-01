import React, { useState, useEffect } from "react";
import socketIO from "socket.io-client";


const socket = socketIO("http://localhost:3000");

function ChatApp() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("online");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    socket.on("user-login", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.username} joined the chat.`,
      ]);
      setUserList((prevList) => [...prevList, data.username]);
    });

    socket.on("status-updated", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.username} is ${data.status}.`,
      ]);
    });

    socket.on("user-logout", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.username} left the chat.`,
      ]);
      setUserList((prevList) =>
        prevList.filter((user) => user !== data.username)
      );
    });

    socket.on("receive-image", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.username} sent an image:`,
        <img
          key={data.socketId}
          src={data.image}
          style={{ maxWidth: "300px" }}
        />,
      ]);
    });
  }, []);

  const handleLogin = () => {
    console.log("the username is :", username)
    socket.emit("login", {username});
  };

  const handleUpdateStatus = () => {
    socket.emit("update-status", status);
  };

  const handleSendImage = () => {
    const fileInput = document.getElementById("image-upload");
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        socket.emit("send-image", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="col-9">
      <div className="d-flex flex-column p-5">
        <h1>Socket.io Chat</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <button onClick={handleLogin}>Login</button>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        <button onClick={handleUpdateStatus}>Update Status</button>
        <br />
        <input type="file" id="image-upload" accept="image/*" />
        <button onClick={handleSendImage}>Send Image</button>
        <ul id="messages">
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <ul id="user-list">
          {userList.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ChatApp;
