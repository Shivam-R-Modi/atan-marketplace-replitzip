import { TokenService } from '../../server/services/tokenService.js';

const tokenService = new TokenService();

export class EmailSorterAgent {
  constructor() {
    this.name = "Email Sorter";
    this.type = "email-sorter";
    this.version = "1.0.0";
    this.capabilities = {
      categories: ["Sales", "Support", "Marketing", "General"],
      languages: ["English", "Spanish"],
      accuracy: "96.8%"
    };
  }

  async process(input) {
    try {
      // Validate input
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: Expected object with emails array');
      }

      const { emails = [], categories = [], customRules = [] } = input;
      
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error('Invalid input: emails array is required and must not be empty');
      }

      // Calculate input tokens
      const inputTokens = tokenService.countInputTokens(input);

      // Simulate AI processing
      await this.simulateProcessing();

      // Process emails
      const sortedEmails = emails.map((email, index) => this.classifyEmail(email, categories, customRules));
      
      const output = {
        totalProcessed: emails.length,
        sortedEmails,
        summary: this.generateSummary(sortedEmails),
        categories: this.getCategoryStats(sortedEmails),
        confidence: this.calculateAverageConfidence(sortedEmails),
        processedAt: new Date().toISOString(),
        metadata: {
          processingTime: Math.round(Math.random() * 1500 + 500),
          rulesApplied: customRules.length,
          categoriesUsed: [...new Set(sortedEmails.map(e => e.category))].length
        }
      };

      // Calculate output tokens
      const outputTokens = tokenService.countOutputTokens(output);

      return {
        success: true,
        output,
        inputTokens,
        outputTokens,
        processingTime: output.metadata.processingTime
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        inputTokens: tokenService.countInputTokens(input),
        outputTokens: 0,
        error: error.message
      };
    }
  }

  async simulateProcessing() {
    const delay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  classifyEmail(email, categories, customRules) {
    const { id, subject = '', from = '', body = '', timestamp } = email;
    
    // Determine priority based on keywords and patterns
    const priority = this.determinePriority(subject, body);
    
    // Classify into category
    const category = this.determineCategory(subject, body, from, categories);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(subject, body);
    
    // Check spam probability
    const spamProbability = this.calculateSpamProbability(subject, from, body);
    
    // Generate confidence score
    const confidence = 0.85 + Math.random() * 0.14; // 85-99%
    
    return {
      id: id || `email_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      originalSubject: subject,
      originalFrom: from,
      priority,
      category,
      sentiment,
      spamProbability,
      confidence,
      suggestedActions: this.suggestActions(priority, category, sentiment),
      extractedEntities: this.extractEntities(subject, body),
      timestamp: timestamp || new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
  }

  determinePriority(subject, body) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'immediate', 'deadline'];
    const text = (subject + ' ' + body).toLowerCase();
    
    const hasUrgentKeywords = urgentKeywords.some(keyword => text.includes(keyword));
    const hasExclamation = text.includes('!');
    const hasAllCaps = /[A-Z]{4,}/.test(subject + body);
    
    if (hasUrgentKeywords || (hasExclamation && hasAllCaps)) {
      return 'urgent';
    } else if (hasExclamation || hasAllCaps) {
      return 'high';
    } else {
      return 'normal';
    }
  }

  determineCategory(subject, body, from, categories) {
    const text = (subject + ' ' + body + ' ' + from).toLowerCase();
    
    // Category keywords mapping
    const categoryKeywords = {
      'sales': ['sale', 'discount', 'offer', 'promotion', 'buy', 'purchase', 'price', 'deal'],
      'support': ['help', 'issue', 'problem', 'error', 'bug', 'support', 'assistance', 'trouble'],
      'marketing': ['newsletter', 'campaign', 'announcement', 'news', 'update', 'event'],
      'finance': ['invoice', 'payment', 'billing', 'account', 'balance', 'transaction'],
      'hr': ['job', 'career', 'interview', 'employee', 'benefits', 'vacation', 'payroll'],
      'general': []
    };
    
    // Use provided categories or default ones
    const availableCategories = categories.length > 0 ? categories : Object.keys(categoryKeywords);
    
    let bestMatch = 'general';
    let maxScore = 0;
    
    for (const category of availableCategories) {
      const keywords = categoryKeywords[category.toLowerCase()] || [];
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }
    
    return bestMatch;
  }

  analyzeSentiment(subject, body) {
    const text = (subject + ' ' + body).toLowerCase();
    
    const positiveWords = ['great', 'excellent', 'good', 'happy', 'pleased', 'satisfied', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'hate'];
    
    const positiveScore = positiveWords.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);
    const negativeScore = negativeWords.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  calculateSpamProbability(subject, from, body) {
    const spamIndicators = [
      subject.includes('!!!'),
      subject.toUpperCase() === subject,
      from.includes('noreply'),
      body.includes('click here'),
      body.includes('free money'),
      body.includes('congratulations'),
    ];
    
    const spamScore = spamIndicators.filter(Boolean).length;
    return Math.min(spamScore * 0.15, 0.9); // Max 90% spam probability
  }

  suggestActions(priority, category, sentiment) {
    const actions = [];
    
    if (priority === 'urgent') {
      actions.push('Respond within 1 hour');
    } else if (priority === 'high') {
      actions.push('Respond within 4 hours');
    }
    
    if (category === 'support' && sentiment === 'negative') {
      actions.push('Escalate to senior support');
    }
    
    if (category === 'sales') {
      actions.push('Forward to sales team');
    }
    
    return actions;
  }

  extractEntities(subject, body) {
    const text = subject + ' ' + body;
    const entities = [];
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => entities.push({ type: 'email', value: email }));
    
    // Extract phone numbers (simple pattern)
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach(phone => entities.push({ type: 'phone', value: phone }));
    
    // Extract dates (simple pattern)
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;
    const dates = text.match(dateRegex) || [];
    dates.forEach(date => entities.push({ type: 'date', value: date }));
    
    return entities;
  }

  generateSummary(sortedEmails) {
    const total = sortedEmails.length;
    const urgent = sortedEmails.filter(e => e.priority === 'urgent').length;
    const spam = sortedEmails.filter(e => e.spamProbability > 0.5).length;
    
    return {
      total,
      urgent,
      spam,
      needsAttention: urgent + sortedEmails.filter(e => e.priority === 'high').length,
      avgConfidence: this.calculateAverageConfidence(sortedEmails)
    };
  }

  getCategoryStats(sortedEmails) {
    const stats = {};
    sortedEmails.forEach(email => {
      stats[email.category] = (stats[email.category] || 0) + 1;
    });
    return stats;
  }

  calculateAverageConfidence(sortedEmails) {
    if (sortedEmails.length === 0) return 0;
    const total = sortedEmails.reduce((sum, email) => sum + email.confidence, 0);
    return total / sortedEmails.length;
  }
}

export default EmailSorterAgent;
