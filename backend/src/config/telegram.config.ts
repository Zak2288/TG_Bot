export const telegramConfig = {
  // Токен бота
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  
  // ID группы для уведомлений
  groupChatId: process.env.TELEGRAM_GROUP_CHAT_ID || '',
  
  // ID администратора
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
}; 