export const API_ENDPOINT = {
  USER: {
    GET_ME: "/users/me",
    LOGIN: "/users/login",
    GET_ALL: "/users/",
    REGISTER: "/users/",
    LOGOUT: "/users/logout",
    UPDATE(id: number) {
      return `/users/${id}`;
    },
    GET_CUSTOMER: "/users/customers",
    REFRESH_TOKEN: "/users/refresh",
  },
  COMPANIES: {
    GET_ALL: "/companies/",
    CREATE: "/companies/",
    UPDATE(company_id: number) {
      return `/companies/${company_id}`;
    },
    DELETE(company_id: number) {
      return `/companies/${company_id}`;
    },
    GET_BY_ID(company_id: number) {
      return `/companies/${company_id}`;
    },
    UPLOAD_LOGO: "/companies/upload-logo",
  },
  CHAT: {
    CREATE_SESSION: "/chat/session",
    CHECK_SESSION(sessionId: string) {
      return `/chat/session/${sessionId}`;
    },
    UPDATE_SESSION_STATUS(session_id: string) {
      return `/chat/session/${session_id}`;
    },
    GET_HISTORY(chat_session_id: string) {
      return `/chat/history/${chat_session_id}`;
    },
    GET_ADMIN_HISTORY: "/chat/admin/history",
    COUNT_MESSAGES_BY_CHANNEL: "/chat/admin/count_by_channel",
    GET_MESSAGE_STATISTICS: "/chat/statistics/messages/time",
    GET_PLATFORM_STATISTICS: "/chat/statistics/messages/platform",
    GET_RATING_STATISTICS: "/chat/statistics/ratings/time",
    GET_STAR_STATISTICS: "/chat/statistics/ratings/star",
    GET_CUSTOMER_CHAT: "/chat/admin/customers",
    UPDATE_TAG(id: number) {
      return `/chat/tag/${id}`;
    },
    UPDATE_CONFIG(id: number) {
      return `/chat/${id}`;
    },
    DELETE_CHAT_SESSIONS: "/chat/chat_sessions",
    DELETE_MESSAGES(chatId: number) {
      return `/chat/messages/${chatId}`;
    },
    VERIFY_FB_WEBHOOK: "/chat/webhook/fb",
    RECEIVE_FB_MESSAGE: "/chat/webhook/fb",
    RECEIVE_TELE_MESSAGE: "/chat/webhook/telegram",
    RECEIVE_ZALO_MESSAGE: "/chat/zalo/webhook",
  },
  KNOWLEDGE_BASE: {
    GET_ALL: "/knowledge-base/",
    SEARCH: "/knowledge-base/search",
    GET_CATEGORIES: "/knowledge-base/categories",
    CREATE_CATEGORY: "/knowledge-base/categories",
    UPDATE_CATEGORY(category_id: number) {
      return `/knowledge-base/categories/${category_id}`;
    },
    DELETE_CATEGORY(category_id: number) {
      return `/knowledge-base/categories/${category_id}`;
    },
    CREATE_FILES: "/knowledge-base/upload-files",
    UPDATE_RICH_TEXT(detail_id: number) {
      return `/knowledge-base/rich-text/${detail_id}`;
    },
    DELETE_DETAIL(detail_id: number) {
      return `/knowledge-base/detail/${detail_id}`;
    },
    ADD_RICH_TEXT(kb_id: number) {
      return `/knowledge-base/rich-text/${kb_id}`;
    },
  },
  FACEBOOK: {
    GET_PAGES: "/facebook-pages/",
    CREATE_PAGE: "/facebook-pages/",
    UPDATE_PAGE(page_id: number) {
      return `/facebook-pages/${page_id}`;
    },
    DELETE_PAGE(page_id: number) {
      return `/facebook-pages/${page_id}`;
    },
    TOGGLE_PAGE_STATUS(page_id: number) {
      return `/facebook-pages/${page_id}/toggle-status`;
    },
    FB_CALLBACK: "/facebook-pages/callback",
  },
  LLM: {
    GET_ALL: "/llms/",
    CREATE: "/llms/",
    UPDATE(llm_id: number) {
      return `/llms/${llm_id}`;
    },
    DELETE(llm_id: number) {
      return `/llms/${llm_id}`;
    },
    GET_BY_ID(llm_id: number) {
      return `/llms/${llm_id}`;
    },
    CREATE_KEY(llm_id: number) {
      return `/llms/details/${llm_id}/keys`;
    },
    GET_KEYS(llm_id: number) {
      return `/llms/details/${llm_id}/keys`;
    },
    UPDATE_KEY(llm_id: number, key_id: number) {
      return `/llms/details/${llm_id}/keys/${key_id}`;
    },
    DELETE_KEY(llm_id: number, key_id: number) {
      return `/llms/details/${llm_id}/keys/${key_id}`;
    },
  },
  TELEGRAM: {
    GET_BOTS: "/telegram-pages/",
    CREATE_BOT: "/telegram-pages/",
    UPDATE_BOT(bot_id: number) {
      return `/telegram-pages/${bot_id}`;
    },
    DELETE_BOT(bot_id: number) {
      return `/telegram-pages/${bot_id}`;
    },
    TOGGLE_BOT_STATUS(bot_id: number) {
      return `/telegram-pages/${bot_id}/toggle-status`;
    },
  },
  ZALO: {
    GET_BOTS: "/zalo/",
    CREATE_BOT: "/zalo/",
    UPDATE_BOT(bot_id: number) {
      return `/zalo/${bot_id}`;
    },
    DELETE_BOT(bot_id: number) {
      return `/zalo/${bot_id}`;
    },
    TOGGLE_BOT_STATUS(bot_id: number) {
      return `/zalo/${bot_id}/toggle-status`;
    },
  },
};
