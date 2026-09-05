import { Audio } from 'expo-av';
import { supabase } from './supabase';
import { Comment, Post, Profile } from '../types/models';

const POST_SELECT = `
  *,
  profiles:users(username, avatar_url),
  likes(count),
  comments(count)
`;

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  const { error } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
  if (error) throw error;
}

export async function listPosts(search?: string): Promise<Post[]> {
  let query = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false });
  if (search?.trim()) {
    const value = `%${search.trim()}%`;
    query = query.or(`book_title.ilike.${value},author_name.ilike.${value},genre.ilike.${value}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listPostComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles:users(username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addComment(postId: string, userId: string, text: string) {
  const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, text });
  if (error) throw error;
}

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase.from('likes').upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
  if (error) throw error;
}

export async function reportPost(postId: string, userId: string, reason = 'flagged_from_post') {
  const { error } = await supabase.from('reports').insert({ post_id: postId, user_id: userId, reason });
  if (error) throw error;
}

export async function listAuthors(): Promise<{ author_name: string; count: number }[]> {
  const { data, error } = await supabase.from('posts').select('author_name');
  if (error) throw error;
  const counts = new Map<string, number>();
  (data ?? []).forEach(({ author_name }) => counts.set(author_name, (counts.get(author_name) ?? 0) + 1));
  return [...counts.entries()].map(([author_name, count]) => ({ author_name, count })).sort((a, b) => b.count - a.count);
}

export async function listAuthorSuggestions(prefix: string): Promise<string[]> {
  if (prefix.trim().length < 2) return [];
  const { data, error } = await supabase.from('posts').select('author_name').ilike('author_name', `${prefix.trim()}%`).limit(8);
  if (error) throw error;
  return [...new Set((data ?? []).map((item) => item.author_name))];
}

export async function uploadReading(uri: string, userId: string) {
  const extension = uri.split('.').pop() || 'm4a';
  const path = `${userId}/${Date.now()}.${extension}`;
  const blob = await (await fetch(uri)).blob();
  const { error } = await supabase.storage.from('post-audio').upload(path, blob, {
    contentType: 'audio/m4a',
    upsert: false
  });
  if (error) throw error;
  const { data } = supabase.storage.from('post-audio').getPublicUrl(path);
  return data.publicUrl;
}

export async function createPost(input: {
  userId: string;
  audioUri: string;
  bookTitle: string;
  authorName: string;
  genre: string;
  caption?: string;
  durationSeconds: number;
}) {
  const audioUrl = await uploadReading(input.audioUri, input.userId);
  const { error } = await supabase.from('posts').insert({
    user_id: input.userId,
    audio_url: audioUrl,
    book_title: input.bookTitle.trim(),
    author_name: input.authorName.trim(),
    genre: input.genre,
    caption: input.caption?.trim() || null,
    duration_seconds: input.durationSeconds
  });
  if (error) throw error;
}

export async function unloadSound(sound: Audio.Sound | null) {
  if (sound) {
    await sound.unloadAsync();
  }
}
