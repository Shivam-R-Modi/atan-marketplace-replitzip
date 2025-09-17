export class TokenService {
  // Simple token counting approximation
  // In a real implementation, you would use tiktoken or similar
  countTokens(text: string): number {
    if (!text) return 0;
    
    // Rough approximation: ~4 characters per token for English text
    // This is a simplified version - use tiktoken for production
    return Math.ceil(text.length / 4);
  }

  countInputTokens(input: any): number {
    if (typeof input === 'string') {
      return this.countTokens(input);
    }
    
    if (typeof input === 'object') {
      const jsonString = JSON.stringify(input);
      return this.countTokens(jsonString);
    }
    
    return 0;
  }

  countOutputTokens(output: any): number {
    if (typeof output === 'string') {
      return this.countTokens(output);
    }
    
    if (typeof output === 'object') {
      const jsonString = JSON.stringify(output);
      return this.countTokens(jsonString);
    }
    
    return 0;
  }
}

export const tokenService = new TokenService();
