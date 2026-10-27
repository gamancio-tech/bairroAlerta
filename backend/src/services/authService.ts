import { userRepository, User } from '../repositories/userRepository';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import { AppError } from '../utils/AppError';
import { comparePassword, hashPassword } from '../utils/hash';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { signToken } from '../utils/jwt';

const EMAIL_IN_USE = 'E-mail já cadastrado.';
const INVALID_CREDENTIALS = 'Credenciais inválidas.';

const toPublicUser = ({ id, name, email, createdAt }: User) => ({ id, name, email, createdAt });

export class AuthService {
  async register({ name, email, password }: RegisterInput) {
    if (await userRepository.findByEmail(email)) {
      throw new AppError(EMAIL_IN_USE, HttpStatusCode.CONFLICT);
    }

    try {
      const user = await userRepository.create({
        name,
        email,
        password: await hashPassword(password),
      });
      return toPublicUser(user);
    } catch (error) {
      // P2002 = violação de unicidade (dois cadastros simultâneos com o mesmo e-mail).
      if ((error as { code?: string }).code === 'P2002') {
        throw new AppError(EMAIL_IN_USE, HttpStatusCode.CONFLICT);
      }
      throw error;
    }
  }

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);

    // A mesma mensagem para e-mail inexistente e senha errada evita revelar quais e-mails estão cadastrados.
    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError(INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
    }

    return { user: toPublicUser(user), token: signToken(user.id) };
  }
}

export const authService = new AuthService();
