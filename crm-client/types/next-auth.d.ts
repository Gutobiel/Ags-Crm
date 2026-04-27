import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      cpf: string;
      funcao: string;
      fotoPerfil?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    accessToken?: string;
    cpf: string;
    funcao: string;
    fotoPerfil?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    cpf?: string;
    funcao?: string;
    fotoPerfil?: string;
  }
}
