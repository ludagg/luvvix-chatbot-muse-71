
/**
 * Extraction des #hashtags et @mentions dans un texte.
 */
export function extractHashtags(text: string): string[] {
  const regex = /#(\w{1,40})/g;
  const hashtags = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  return Array.from(new Set(hashtags));
}

export function extractMentions(text: string): string[] {
  const regex = /@(\w{1,20})/g;
  const mentions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    mentions.push(m[1]);
  }
  return Array.from(new Set(mentions));
}
