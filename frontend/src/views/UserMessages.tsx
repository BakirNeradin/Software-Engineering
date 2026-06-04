import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User, UserMessages } from "../types";
import { useParams } from "react-router-dom";

import { useAuth } from "../contexts/AuthProvider";

function ProfilePage() {
  const [messages, setMessages] = useState<UserMessages[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { userId } = useAuth();
  const { recipientId } = useParams();
  const [user, setUser] = useState<User>();

  const loadMessages = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user_message_by_ids?recipient_id=${recipientId}&sender_id=${userId}`);
    const data = await res.json();
    setMessages(data);
  };
  const loadUserData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${recipientId}`);
    const data = await res.json();
    setUser(data);
  };
  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/user_messages?recipient_id=${recipientId}&sender_id=${userId}&message=${newMessage}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    setNewMessage("");
    loadMessages();
  };

  useEffect(() => {
    loadMessages();
    loadUserData();
  }, [recipientId, userId]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep the conversation going with this marketplace user.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Conversation</p>
            <p className="mt-1 text-xs text-slate-500">Recipient {user?.username}</p>
          </div>

          <div className="flex min-h-105 flex-col gap-3 px-4 py-5 md:px-6">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isMyMessage = message.sender_id === userId;

                return (
                  <div
                    key={`${message.sender_id}-${index}-${message.message}`}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                  >
                    <p
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[65%] ${
                        isMyMessage
                          ? "rounded-br-md bg-orange-500 text-white"
                          : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      {message.message}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No messages yet. Send the first one below.
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;