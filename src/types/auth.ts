// ua: User - модель даних користувача
import { User } from './user';

// ua: interface AuthResponse - модель відповіді від API при авторизації
export interface AuthResponse {
  user: User;
  message: string;
}

// ua: interface MessageResponse - модель відповіді від API при простих повідомленнях
export interface MessageResponse {
  message: string;
}
