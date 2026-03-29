import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { NewUser } from '../db/schema/users';

export const userService = {

  async getById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  // Wywoływany przez webhook Clerk gdy użytkownik się rejestruje
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
      .returning();
    return user;
  },
};