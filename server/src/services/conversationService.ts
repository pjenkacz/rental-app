import { db } from '../db';
import { conversations, messages } from '../db/schema/conversations';
import { users } from '../db/schema/users';
import { listings } from '../db/schema/listings';
import { eq, and, or, ne, desc, asc, inArray, count } from 'drizzle-orm';

export const conversationService = {

  /**
   * Pobiera wszystkie konwersacje użytkownika (jako buyer lub seller).
   * Dołącza: dane drugiej strony (z tabeli users), ostatnią wiadomość, tytuł ogłoszenia.
   * 4 zapytania zamiast N+1.
   */
  async getAll(userId: string) {
    // 1. Konwersacje tego użytkownika
    const convs = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)))
      .orderBy(desc(conversations.lastMessageAt));

    if (convs.length === 0) return [];

    // 2. IDs drugiej strony rozmowy
    const otherUserIds = [...new Set(
      convs.map(c => c.buyerId === userId ? c.sellerId : c.buyerId)
    )];

    // 3. Dane użytkowników (druga strona)
    const otherUsersRows = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(inArray(users.id, otherUserIds));

    const usersMap = Object.fromEntries(otherUsersRows.map(u => [u.id, u]));

    // 4. Tytuły ogłoszeń
    const listingIds = [...new Set(convs.map(c => c.listingId))];
    const listingRows = await db
      .select({ id: listings.id, title: listings.title })
      .from(listings)
      .where(inArray(listings.id, listingIds));

    const listingsMap = Object.fromEntries(listingRows.map(l => [l.id, l]));

    // 5. Ostatnie wiadomości — wszystkie, grupowane po stronie serwisu
    const convIds = convs.map(c => c.id);
    const allLastMessages = await db
      .select()
      .from(messages)
      .where(inArray(messages.conversationId, convIds))
      .orderBy(desc(messages.createdAt));

    // Pierwsza wystąpienie dla każdej konwersacji = najnowsza
    const lastMessageMap: Record<string, typeof allLastMessages[0]> = {};
    for (const msg of allLastMessages) {
      if (!lastMessageMap[msg.conversationId]) {
        lastMessageMap[msg.conversationId] = msg;
      }
    }

    // 6. Złożenie odpowiedzi
    return convs.map(conv => {
      const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
      const otherUser = usersMap[otherUserId];
      const lastMsg = lastMessageMap[conv.id];
      const listing = listingsMap[conv.listingId];

      return {
        id: conv.id,
        listingId: conv.listingId,
        buyerId: conv.buyerId,
        sellerId: conv.sellerId,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        otherUser: otherUser ?? { id: otherUserId, firstName: null, lastName: null, avatarUrl: null },
        lastMessage: lastMsg
          ? { content: lastMsg.content, senderId: lastMsg.senderId }
          : null,
        listing: listing ? { title: listing.title } : { title: '' },
      };
    });
  },

  /**
   * Tworzy konwersację lub zwraca istniejącą (idempotentne).
   * Waliduje że buyer !== seller.
   */
  async createOrGet({ listingId, buyerId, sellerId }: {
    listingId: string;
    buyerId: string;
    sellerId: string;
  }) {
    if (buyerId === sellerId) {
      throw Object.assign(new Error('Nie możesz pisać do siebie'), { status: 400 });
    }

    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.listingId, listingId),
          eq(conversations.buyerId, buyerId),
          eq(conversations.sellerId, sellerId),
        )
      )
      .limit(1);

    if (existing.length > 0) return existing[0];

    const [newConv] = await db
      .insert(conversations)
      .values({ listingId, buyerId, sellerId })
      .returning();

    return newConv;
  },

  /**
   * Pobiera wiadomości konwersacji. Weryfikuje że userId jest uczestnikiem.
   */
  async getMessages(conversationId: string, userId: string) {
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conv.length === 0) {
      throw Object.assign(new Error('Konwersacja nie znaleziona'), { status: 404 });
    }

    const c = conv[0];
    if (c.buyerId !== userId && c.sellerId !== userId) {
      throw Object.assign(new Error('Brak dostępu'), { status: 403 });
    }

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  },

  /**
   * Wysyła wiadomość i aktualizuje lastMessageAt w konwersacji.
   */
  async sendMessage({ conversationId, senderId, content }: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    const [newMsg] = await db
      .insert(messages)
      .values({ conversationId, senderId, content })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return newMsg;
  },

  /**
   * Liczy nieprzeczytane wiadomości (wysłane przez kogoś innego) dla danego użytkownika.
   */
  async getUnreadCount(userId: string) {
    const userConvs = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)));

    if (userConvs.length === 0) return 0;

    const convIds = userConvs.map(c => c.id);

    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationId, convIds),
          ne(messages.senderId, userId),
          eq(messages.isRead, false),
        )
      );

    return Number(result[0]?.count ?? 0);
  },

  /**
   * Oznacza jako przeczytane wszystkie wiadomości w konwersacji wysłane przez drugą stronę.
   */
  async markAsRead(conversationId: string, userId: string) {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId),
          eq(messages.isRead, false),
        )
      );
  },
};
