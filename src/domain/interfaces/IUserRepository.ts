export interface UserData {
  id: number;
  email: string;
  names: string;
  firstLastName: string;
}

export interface IUserRepository {
  getUserById(userId: number): Promise<UserData | null>;
}