interface IUser {
  name: string;
  type: 'ADMIN' | 'USER';
  avatar: string | null;
  email: string;
  active: boolean;
  id: number | string;
}
