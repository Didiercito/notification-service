import axios, { AxiosInstance } from 'axios';
import { IUserRepository, UserData } from '../../domain/interfaces/IUserRepository';

export class AuthServiceUserRepository implements IUserRepository {
  constructor(private readonly axiosClient: AxiosInstance) {}

  async getUserById(userId: number): Promise<UserData | null> {
    try {
      const response = await this.axiosClient.get(`/api/v1/users/${userId}`);

      const userData: UserData = {
        id: response.data.data.id,
        email: response.data.data.email,
        names: response.data.data.names,
        firstLastName: response.data.data.firstLastName,
      };

      return userData;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error(`❌ Error al consultar Auth Service para el usuario ${userId}:`, error.message);
      return null;
    }
  }
}