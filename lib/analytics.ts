/**
 * Analytics functions for calculating derived metrics from comments
 */

/**
 * Calculate comment length categories
 */
export function getCommentLengthCategory(text: string): 'short' | 'medium' | 'long' {
  if (!text) return 'short';
  
  const length = text.length;
  if (length < 50) return 'short';
  if (length < 150) return 'medium';
  return 'long';
}

/**
 * Count emojis in text
 */
export function countEmojis(text: string): number {
  if (!text) return 0;
  
  // Simple approach: look for common emoji patterns (without unicode flag)
  const emojiRegex = /([\u263a\u2639\u2699\u269b\u269c\u2700\u2701\u2702\u2703\u2704\u2705\u2708\u2709\u270a\u270b\u270c\u270d\u270e\u270f\u2710\u2711\u2712\u2713\u2714\u2715\u2716\u2717\u2718\u2719\u271a\u271b\u271c\u271d\u271e\u271f\u2720\u2721\u2722\u2723\u2724\u2725\u2726\u2727\u2728\u2729\u272a\u272b\u272c\u272d\u272e\u272f\u2730\u2731\u2732\u2733\u2734\u2735\u2736\u2737\u2738\u2739\u273a\u273b\u273c\u273d\u273e\u273f\u2740\u2741\u2742\u2743\u2744\u2745\u2746\u2747\u2748\u2749\u274a\u274b\u274c\u274d\u274e\u274f\u2750\u2751\u2752\u2753\u2754\u2755\u2756\u2757\u2758\u2759\u275a\u275b\u275c\u275d\u275e\u275f\u2760\u2761\u2762\u2763\u2764\u2765\u2766\u2767\u2795\u2796\u2797\u2798\u2799\u279a\u279b\u279c\u279d\u279e\u279f\u27a0\u27a1\u27a2\u27a3\u27a4\u27a5\u27a6\u27a7\u27a8\u27a9\u27aa\u27ab\u27ac\u27ad\u27ae\u27af\u27b0\u27b1\u27b2\u27b3\u27b4\u27b5\u27b6\u27b7\u27b8\u27b9\u27ba\u27bb\u27bc\u27bd\u27be\u27bf\u2b00\u2b01\u2b02\u2b03\u2b04\u2b05\u2b06\u2b07\u2b08\u2b09\u2b0a\u2b0b\u2b0c\u2b0d\u2b0e\u2b0f\u2b10\u2b11\u2b12\u2b13\u2b14\u2b15\u2b16\u2b17\u2b18\u2b19\u2b1a\u2b1b\u2b1c\u2b1d\u2b1e\u2b1f\u2b20\u2b21\u2b22\u2b23\u2b24\u2b25\u2b26\u2b27\u2b28\u2b29\u2b2a\u2b2b\u2b2c\u2b2d\u2b2e\u2b2f\u2b30\u2b31\u2b32\u2b33\u2b34\u2b35\u2b36\u2b37\u2b38\u2b39\u2b3a\u2b3b\u2b3c\u2b3d\u2b3e\u2b3f\u2b40\u2b41\u2b42\u2b43\u2b44\u2b45\u2b46\u2b47\u2b48\u2b49\u2b4a\u2b4b\u2b4c\u2b4d\u2b4e\u2b4f\u2b50\u2b51\u2b52\u2b53\u2b54\u2b55\u2b56\u2b57\u2b58\u2b59\u2b5a\u2b5b\u2b5c\u2b5d\u2b5e\u2b5f\u2b60\u2b61\u2b62\u2b63\u2b64\u2b65\u2b66\u2b67\u2b68\u2b69\u2b6a\u2b6b\u2b6c\u2b6d\u2b6e\u2b6f\u2b70\u2b71\u2b72\u2b73\u2b74\u2b75\u2b76\u2b77\u2b78\u2b79\u2b7a\u2b7b\u2b7c\u2b7d\u2b7e\u2b7f\u2b80\u2b81\u2b82\u2b83\u2b84\u2b85\u2b86\u2b87\u2b88\u2b89\u2b8a\u2b8b\u2b8c\u2b8d\u2b8e\u2b8f\u2b90\u2b91\u2b92\u2b93\u2b94\u2b95\u2b96\u2b97\u2b98\u2b99\u2b9a\u2b9b\u2b9c\u2b9d\u2b9e\u2b9f\u2ba0\u2ba1\u2ba2\u2ba3\u2ba4\u2ba5\u2ba6\u2ba7\u2ba8\u2ba9\u2baa\u2bab\u2bac\u2bad\u2bae\u2baf\u2bb0\u2bb1\u2bb2\u2bb3\u2bb4\u2bb5\u2bb6\u2bb7\u2bb8\u2bb9\u2bba\u2bbb\u2bbc\u2bbd\u2bbe\u2bbf\u2bc0\u2bc1\u2bc2\u2bc3\u2bc4\u2bc5\u2bc6\u2bc7\u2bc8\u2bc9\u2bca\u2bcb\u2bcc\u2bcd\u2bce\u2bcf\u2bd0\u2bd1\u2bd2\u2bd3\u2bd4\u2bd5\u2bd6\u2bd7\u2bd8\u2bd9\u2bda\u2bdb\u2bdc\u2bdd\u2bde\u2bdf\u2be0\u2be1\u2be2\u2be3\u2be4\u2be5\u2be6\u2be7\u2be8\u2be9\u2bea\u2beb\u2bec\u2bed\u2bee\u2bef\u2bf0\u2bf1\u2bf2\u2bf3\u2bf4\u2bf5\u2bf6\u2bf7\u2bf8\u2bf9\u2bfa\u2bfb\u2bfc\u2bfd\u2bfe\u2bff\ud83c[\udf00-\udfff]|\ud83d[\ude00-\ude4f\ude80-\udeff])/g;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

/**
 * Check if comment contains a question
 */
export function containsQuestion(text: string): boolean {
  if (!text) return false;
  return /\?$/.test(text.trim());
}

/**
 * Check if comment contains common CTAs
 */
export function containsCTA(text: string): boolean {
  if (!text) return false;
  
  const ctaKeywords = [
    'sigue', 'follow', 'like', 'comenta', 'comparte', 'tag', 'dm', 'mensaje',
    'contacta', 'link', 'abajo', 'arriba', 'ahora', 'hoy', 'pronto'
  ];
  
  const lowerText = text.toLowerCase();
  return ctaKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Determine if comment is conversational or assertive
 */
export function getCommunicationStyle(text: string): 'conversational' | 'assertive' {
  if (!text) return 'assertive';
  
  // Check for conversational elements
  const conversationalIndicators = [
    'hola', 'buenos días', 'gracias', 'por favor', 'usted', 'tú', 'me gusta',
    'yo pienso', 'en mi opinión', 'creo que', 'pienso que', '¿qué opinan?',
    '¿qué les parece?', '¿ustedes qué piensan?'
  ];
  
  const lowerText = text.toLowerCase();
  const conversationalCount = conversationalIndicators.filter(indicator => 
    lowerText.includes(indicator)
  ).length;
  
  // If more than 10% of sentence-like segments contain conversational indicators
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return conversationalCount / Math.max(sentences.length, 1) > 0.1 ? 'conversational' : 'assertive';
}

/**
 * Calculate engagement metrics
 */
export function calculateEngagement(likes: number, replies: number): number {
  return likes + replies;
}

/**
 * Calculate growth metrics
 */
export function calculateGrowth(oldValue: number, newValue: number): { absolute: number; percentage: number } {
  const absolute = newValue - oldValue;
  const percentage = oldValue !== 0 ? (absolute / oldValue) * 100 : newValue !== 0 ? 100 : 0;
  
  return {
    absolute,
    percentage
  };
}

/**
 * Calculate engagement velocity (growth rate over time)
 */
export function calculateEngagementVelocity(
  initialLikes: number, 
  initialReplies: number, 
  finalLikes: number, 
  finalReplies: number, 
  timeDiffMs: number
): number {
  if (timeDiffMs <= 0) return 0;
  
  const initialEngagement = initialLikes + initialReplies;
  const finalEngagement = finalLikes + finalReplies;
  const engagementGrowth = finalEngagement - initialEngagement;
  
  // Calculate velocity as engagement growth per hour
  const timeInHours = timeDiffMs / (1000 * 60 * 60);
  return timeInHours > 0 ? engagementGrowth / timeInHours : 0;
}