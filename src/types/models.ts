export type GenreName =
  | 'Fiction'
  | 'Non-fiction'
  | 'Poetry'
  | 'Sci-Fi'
  | 'Fantasy'
  | 'Romance'
  | 'Mystery'
  | 'Biography'
  | 'Philosophy'
  | 'Classics';

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  audio_url: string;
  book_title: string;
  author_name: string;
  genre: string;
  caption: string | null;
  duration_seconds: number;
  created_at: string;
  profiles?: Pick<Profile, 'username' | 'avatar_url'> | null;
  likes?: { count: number }[];
  comments?: { count: number }[];
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: Pick<Profile, 'username' | 'avatar_url'> | null;
};
