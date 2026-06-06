import type { UserMessages } from "../../types";
import { ConversationCard } from "./ConversationCard";

type ConversationBoxProps = {
  conversations: UserMessages[];
  userId: string;
  activeRecipientId?: string | null;
};

export const ConversationBox = ({
  conversations,
  userId,
  activeRecipientId,
}: ConversationBoxProps) => {
  const hasConversations = conversations.length > 0;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Inbox</h2>
        <p className="mt-1 text-sm text-slate-500">
          {hasConversations
            ? `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
            : "No conversations yet"}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {hasConversations ? (
          conversations.map((conversation, index) => {
            const converserId =
              conversation.sender_id === userId
                ? conversation.recipient_id
                : conversation.sender_id;
            const converserName =
              conversation.sender_id === userId
                ? conversation.recipient_username
                : conversation.sender_username;

            return (
              <ConversationCard
                key={`${converserId}-${index}-${conversation.message}`}
                conversation={conversation}
                converserName={converserName}
                converserId={converserId}
                isActive={activeRecipientId === converserId}
              />
            );
          })
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm leading-6 text-slate-500">
            Your marketplace chats will show up here.
          </div>
        )}
      </div>
    </aside>
  );
};