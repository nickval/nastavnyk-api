export interface User {
  id: number;
  email: string;
  username: string;
}

const SEED_USERS: User[] = [
  { id: 1, email: "john@example.com", username: "John_Doe" },
  { id: 2, email: "olena@example.com", username: "olena_m" },
];

let users: User[] = [];

export const userRepository = {
  findByEmail(email: string): User | undefined {
    return users.find((u) => u.email === email);
  },

  // Порівняння без урахування регістру; username зберігається як його ввели.
  findByUsername(username: string): User | undefined {
    const needle = username.toLowerCase();
    return users.find((u) => u.username.toLowerCase() === needle);
  },

  create(data: Omit<User, "id">): User {
    const user: User = { id: users.length + 1, ...data };
    users.push(user);
    return user;
  },

  // Повертає сховище до початкових даних. Використовується в тестах.
  reset(): void {
    users = SEED_USERS.map((u) => ({ ...u }));
  },
};

userRepository.reset();
