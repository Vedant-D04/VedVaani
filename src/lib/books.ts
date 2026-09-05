export type BookSuggestion = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

export async function searchBooks(query: string): Promise<BookSuggestion[]> {
  if (query.trim().length < 3) {
    return [];
  }

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`);
  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((item: any) => ({
    id: item.id,
    title: item.volumeInfo?.title ?? 'Untitled',
    author: item.volumeInfo?.authors?.[0] ?? 'Unknown author',
    coverUrl: item.volumeInfo?.imageLinks?.thumbnail ?? null
  }));
}
