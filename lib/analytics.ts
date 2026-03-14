/**
 * Analytics and derived metrics for comments
 */

export interface CommentAnalytics {
  comment_length: number;
  emoji_count: number;
  contains_question: boolean;
  contains_cta: boolean;
  content_type: 'short' | 'medium' | 'long';
  tone: 'conversational' | 'assertive';
  absolute_growth_likes: number;
  percentage_growth_likes: number;
  absolute_growth_replies: number;
  percentage_growth_replies: number;
}

/**
 * Calculate analytics for a comment
 */
export function calculateCommentAnalytics(
  commentText: string = '', 
  initialLikes: number = 0, 
  currentLikes: number = 0,
  initialReplies: number = 0,
  currentReplies: number = 0
): CommentAnalytics {
  // Calculate comment length
  const comment_length = commentText.length;

  // Count emojis (basic approach using common emoji patterns)
  const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  const emojiMatches = commentText.match(emojiRegex);
  const emoji_count = emojiMatches ? emojiMatches.length : 0;

  // Check if comment contains a question
  const contains_question = /[¿?]/.test(commentText);

  // Check for CTA indicators
  const ctaKeywords = [
    'sigue', 'follow', 'suscríbete', 'subscribe', 'comenta', 'comment', 
    'like', 'me gusta', 'dale like', 'dale me gusta', 'comparte', 'share',
    'mensaje', 'dm', 'contacta', 'contact', 'enlace', 'link', 'pin'
  ];
  const contains_cta = ctaKeywords.some(keyword => 
    commentText.toLowerCase().includes(keyword)
  );

  // Determine content type based on length
  let content_type: 'short' | 'medium' | 'long';
  if (comment_length < 50) {
    content_type = 'short';
  } else if (comment_length < 150) {
    content_type = 'medium';
  } else {
    content_type = 'long';
  }

  // Determine tone based on content characteristics
  let tone: 'conversational' | 'assertive';
  const conversationalIndicators = [
    'hola', 'hey', 'buenos días', 'buenas tardes', 'gracias', 'por favor',
    'please', 'thanks', 'hi', 'hello', '!', 'jaja', 'jeje', 'xd', ':)', ':D',
    'creo', 'pienso', 'opino', 'en mi opinión', 'me parece'
  ];
  const assertiveIndicators = [
    'debes', 'tienes que', 'necesitas', 'es importante', 'recuerda',
    'must', 'should', 'need to', 'remember', 'important', 'key', 'essential',
    'definitivamente', 'claramente', 'obviamente', 'siempre', 'nunca'
  ];

  const conversationalCount = conversationalIndicators.filter(indicator => 
    commentText.toLowerCase().includes(indicator)).length;
  const assertiveCount = assertiveIndicators.filter(indicator => 
    commentText.toLowerCase().includes(indicator)).length;

  tone = conversationalCount > assertiveCount ? 'conversational' : 'assertive';

  // Calculate growth metrics
  const absolute_growth_likes = currentLikes - initialLikes;
  const percentage_growth_likes = initialLikes > 0 
    ? (absolute_growth_likes / initialLikes) * 100 
    : initialLikes === currentLikes ? 0 : Infinity; // If both are 0, growth is 0, otherwise infinite if went from 0

  const absolute_growth_replies = currentReplies - initialReplies;
  const percentage_growth_replies = initialReplies > 0 
    ? (absolute_growth_replies / initialReplies) * 100 
    : initialReplies === currentReplies ? 0 : Infinity;

  return {
    comment_length,
    emoji_count,
    contains_question,
    contains_cta,
    content_type,
    tone,
    absolute_growth_likes,
    percentage_growth_likes,
    absolute_growth_replies,
    percentage_growth_replies
  };
}

/**
 * Get a summary of analytics for display
 */
export function getAnalyticsSummary(analytics: CommentAnalytics): string[] {
  const summary = [];
  
  if (analytics.contains_question) summary.push('Contains question');
  if (analytics.contains_cta) summary.push('Has CTA');
  if (analytics.emoji_count > 0) summary.push(`${analytics.emoji_count} emojis`);
  if (analytics.tone === 'conversational') summary.push('Conversational tone');
  if (analytics.tone === 'assertive') summary.push('Assertive tone');
  
  return summary;
}