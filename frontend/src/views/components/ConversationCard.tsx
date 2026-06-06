import type { UserMessages } from "../../types";

type ConversationCardProps = {
  conversation: UserMessages;
  converserName: string;
  converserId: string;
  isActive?: boolean;
};

export const ConversationCard = ({
  conversation,
  converserName,
  converserId,
  isActive = false,
}: ConversationCardProps) => {
  const preview = conversation.message?.trim() || "No message text.";
  const initial = converserName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <a
      href={`/messages?user_id=${converserId}`}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 ${
        isActive
          ? "border-orange-200 bg-orange-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isActive
            ? "bg-orange-500 text-white"
            : "bg-slate-100 text-slate-700 group-hover:bg-orange-500 group-hover:text-white"
        }`}
      >
        {initial}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold text-slate-900">
            {converserName || "Marketplace user"}
          </span>
          {isActive && (
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-orange-600 shadow-sm">
              Open
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-sm leading-6 text-slate-500">
          {preview}
        </span>
      </span>
    </a>
  );
};