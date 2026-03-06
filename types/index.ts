import 'next-auth';

export interface PostWithAuthor {
  _id: string;
  content: string;
  isAIGenerated: boolean;
  aiPrompt?: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
}

export interface CommentWithAuthor {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}