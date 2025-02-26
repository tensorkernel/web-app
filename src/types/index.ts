export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  iframe_url: string;
  category: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
