export function validateGameForm(game: { 
  title: string;
  description: string;
  thumbnail: string;
  iframe_url: string;
}): string[] {
  const errors: string[] = [];
  
  if (!game.title.trim()) errors.push('Title is required');
  if (game.title.length > 100) errors.push('Title must be less than 100 characters');
  if (!game.description.trim()) errors.push('Description is required');
  if (game.description.length > 500) errors.push('Description must be less than 500 characters');
  if (!game.thumbnail.trim()) errors.push('Thumbnail URL is required');
  if (!game.iframe_url.trim()) errors.push('Game URL is required');
  
  try {
    new URL(game.thumbnail);
  } catch {
    errors.push('Invalid thumbnail URL format');
  }
  
  try {
    new URL(game.iframe_url);
  } catch {
    errors.push('Invalid game URL format');
  }

  return errors;
}
