import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User, UserMessages } from "../types";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../contexts/AuthProvider";
import { ConversationBox } from "./components/ConversationBox";

function UserMessages() {
  const [messages, setMessages] = useState<UserMessages[]>([]);
  const [conversations, setConversations] = useState<UserMessages[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { userId, userName } = useAuth();
  const [user, setUser] = useState<User>();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("user_id");

  const conversationTitle = user?.username || "Select a conversation";
  const canSendMessage = Boolean(recipientId && newMessage.trim());

  const loadMessages = async () => {
    if (!recipientId || !userId) {
      setMessages([]);
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/user_message_by_ids?recipient_id=${recipientId}&sender_id=${userId}`,
    );
    const data = await res.json();
    setMessages(data);
  };

  const loadConversations = async () => {
    if (!userId) {
      setConversations([]);
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/user_message_by_id?user_id=${userId}`,
    );
    const data = await res.json();
    setConversations(data);
  };

  const loadUserData = async () => {
    if (!recipientId) {
      setUser(undefined);
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${recipientId}`,
    );
    const data = await res.json();
    setUser(data);
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSendMessage) return;

    await fetch(
      `${import.meta.env.VITE_API_URL}/user_messages?recipient_id=${recipientId}&sender_id=${userId}&message=${newMessage}&sender_username=${userName}&recipient_username=${user?.username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    setNewMessage("");
    if (conversations && conversations.length > 0 && conversations[0].recipient_id != recipientId && conversations[0].sender_id != recipientId){
      loadConversations();
    }
    loadMessages();
  };

  useEffect(() => {
    loadMessages();
    loadUserData();
  }, [recipientId, userId]);
   useEffect(() => {
    loadConversations();
  }, []);


  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep track of marketplace conversations in one place.
          </p>
        </header>

        <div className="grid min-h-[calc(100vh-13rem)] gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <ConversationBox
            conversations={conversations}
            userId={userId}
            activeRecipientId={recipientId}
          />

          <section className="flex min-h-136 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {conversationTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {recipientId
                    ? "Marketplace conversation"
                    : "Choose someone from your inbox"}
                </p>
              </div>
              {recipientId && (
                <a
                  href={`/profilepage/${recipientId}`}
                  className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                >
                  View profile
                </a>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/60 px-4 py-5 md:px-6">
              {!recipientId ? (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm leading-6 text-slate-500">
                  Select a conversation from the inbox to read and reply.
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => {
                  const isMyMessage = message.sender_id === userId;

                  return (
                    <div
                      key={`${message.sender_id}-${index}-${message.message}`}
                      className={`flex ${
                        isMyMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[65%] ${
                          isMyMessage
                            ? "rounded-br-md bg-orange-500 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {message.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm leading-6 text-slate-500">
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
                placeholder={
                  recipientId
                    ? "Write a message..."
                    : "Select a conversation first"
                }
                disabled={!recipientId}
                className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!canSendMessage}
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
              >
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default UserMessages;