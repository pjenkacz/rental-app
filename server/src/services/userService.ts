import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { NewUser } from '../db/schema/users';

export const userService = {

  async getById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async delete(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  },

  // Wywoływany przez webhook Clerk gdy użytkownik się rejestruje lub przez /sync
  async createOrUpdate(data: NewUser) {
    const [user] = await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          avatarUrl: data.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning()
      .catch(async () => {
        // Fallback: email already exists with different Clerk ID (e.g. after DB reset).
        // Update the existing record to use the current Clerk ID.
        const [user] = await db
          .update(users)
          .set({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.email, data.email))
          .returning();
        return [user];
      });
    return user;
  },
};