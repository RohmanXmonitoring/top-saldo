import { create } from 'zustand';
import { User } from '@/types/user.types';

interface UserState {
  users: User[];
  loading: boolean;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (uid: string, data: Partial<User>) => void;
  removeUser: (uid: string) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),
  updateUser: (uid, data) => set((state) => ({
    users: state.users.map((user) =>
      user.uid === uid ? { ...user, ...data } : user
    ),
  })),
  removeUser: (uid) => set((state) => ({
    users: state.users.filter((user) => user.uid !== uid),
  })),
  clearUsers: () => set({ users: [] }),
}));
