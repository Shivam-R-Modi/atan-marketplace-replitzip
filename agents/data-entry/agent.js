import { TokenService } from '../../server/services/tokenService.js';

const tokenService = new TokenService();

export class DataEntryAgent {
  constructor() {
    this.name = "Data Entry";
    this.type = "data-entry";
    this.version = "1.0.0";
    this.capabilities = {
      formats: ["Forms", "Tables", "Documents"],
      validation: true,
      accuracy: "98.1%"
    };
  }

  async process(input) {
    try {
      // Validate input
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: Expected object with fields array');
      }

      const { fields = [], validationRules = {}, outputFormat = 'json' } = input;
      
      if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error('Invalid input: fields array is required and must not be empty');
      }

      // Calculate input tokens
      const inputTokens = tokenService.countInputTokens(input);

      // Simulate AI processing
      await this.simulateProcessing();

      // Process each field
      const processedData = fields.map((field, index) => this.processField(field, index, validationRules));
      
      const output = {
        totalFields: fields.length,
        extractedData: processedData,
        validFields: processedData.filter(f => f.validation === 'valid').length,
        requiresReview: processedData.filter(f => f.validation === 'requires_review').length,
        invalidFields: processedData.filter(f => f.validation === 'invalid').length,
        summary: this.generateSummary(processedData),
        confidence: this.calculateAverageConfidence(processedData),
        processedAt: new Date().toISOString(),
        metadata: {
          processingTime: Math.round(Math.random() * 1200 + 400),
          validationRulesApplied: Object.keys(validationRules).length,
          outputFormat,
          dataTypes: this.analyzeDataTypes(processedData)
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
    const delay = Math.random() * 1500 + 400; // 0.4-1.9 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  processField(field, index, validationRules) {
    const { name, value, type, required = false } = field;
    
    // Clean and normalize the value
    const cleanedValue = this.cleanValue(value, type);
    
    // Validate the field
    const validation = this.validateField(name, cleanedValue, type, required, validationRules);
    
    // Generate confidence score
    const confidence = this.calculateFieldConfidence(cleanedValue, type, validation);
    
    // Detect data type if not provided
    const detectedType = type || this.detectDataType(cleanedValue);
    
    return {
      fieldId: index + 1,
      fieldName: name || `field_${index + 1}`,
      originalValue: value,
      cleanedValue,
      detectedType,
      validation: validation.status,
      validationErrors: validation.errors,
      confidence,
      suggestions: this.generateSuggestions(cleanedValue, detectedType, validation),
      metadata: {
        processingFlags: this.getProcessingFlags(value, cleanedValue),
        dataQuality: this.assessDataQuality(cleanedValue, detectedType)
      },
      processedAt: new Date().toISOString()
    };
  }

  cleanValue(value, type) {
    if (value === null || value === undefined) return '';
    
    let cleaned = String(value).trim();
    
    switch (type) {
      case 'email':
        return cleaned.toLowerCase();
      case 'phone':
        return cleaned.replace(/\D/g, ''); // Remove non-digits
      case 'number':
        return cleaned.replace(/[^\d.-]/g, '');
      case 'currency':
        return cleaned.replace(/[$,]/g, '');
      case 'date':
        return this.standardizeDate(cleaned);
      case 'text':
      default:
        return cleaned;
    }
  }

  validateField(name, value, type, required, validationRules) {
    const errors = [];
    
    // Required field validation
    if (required && (!value || value.trim() === '')) {
      errors.push('Field is required but empty');
    }
    
    if (!value || value.trim() === '') {
      return { status: required ? 'invalid' : 'valid', errors };
    }
    
    // Type-specific validation
    switch (type) {
      case 'email':
        if (!this.isValidEmail(value)) {
          errors.push('Invalid email format');
        }
        break;
      case 'phone':
        if (!this.isValidPhone(value)) {
          errors.push('Invalid phone number format');
        }
        break;
      case 'number':
        if (isNaN(parseFloat(value))) {
          errors.push('Invalid number format');
        }
        break;
      case 'date':
        if (!this.isValidDate(value)) {
          errors.push('Invalid date format');
        }
        break;
    }
    
    // Custom validation rules
    if (validationRules[name]) {
      const rule = validationRules[name];
      if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
        errors.push(`Value does not match required pattern: ${rule.pattern}`);
      }
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`Value too short (minimum ${rule.minLength} characters)`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`Value too long (maximum ${rule.maxLength} characters)`);
      }
    }
    
    if (errors.length === 0) {
      return { status: 'valid', errors: [] };
    } else if (errors.length === 1 && !errors[0].includes('required')) {
      return { status: 'requires_review', errors };
    } else {
      return { status: 'invalid', errors };
    }
  }

  calculateFieldConfidence(value, type, validation) {
    let baseConfidence = 0.95;
    
    if (validation.status === 'invalid') {
      baseConfidence = 0.3 + Math.random() * 0.2;
    } else if (validation.status === 'requires_review') {
      baseConfidence = 0.6 + Math.random() * 0.2;
    }
    
    // Adjust based on value characteristics
    if (value && value.length > 0) {
      if (type === 'email' && this.isValidEmail(value)) baseConfidence += 0.03;
      if (type === 'phone' && this.isValidPhone(value)) baseConfidence += 0.03;
      if (type === 'number' && !isNaN(parseFloat(value))) baseConfidence += 0.03;
    }
    
    return Math.min(0.99, Math.max(0.1, baseConfidence + (Math.random() * 0.1 - 0.05)));
  }

  detectDataType(value) {
    if (!value) return 'text';
    
    if (this.isValidEmail(value)) return 'email';
    if (this.isValidPhone(value)) return 'phone';
    if (!isNaN(parseFloat(value)) && isFinite(value)) return 'number';
    if (this.isValidDate(value)) return 'date';
    if (value.includes('$') || /^\d+\.\d{2}$/.test(value)) return 'currency';
    
    return 'text';
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  standardizeDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  generateSuggestions(value, type, validation) {
    const suggestions = [];
    
    if (validation.status === 'requires_review') {
      switch (type) {
        case 'email':
          if (value && !value.includes('@')) {
            suggestions.push('Consider adding @ symbol for email format');
          }
          break;
        case 'phone':
          if (value && value.length < 10) {
            suggestions.push('Phone number may be incomplete');
          }
          break;
        case 'date':
          suggestions.push('Consider using YYYY-MM-DD format');
          break;
      }
    }
    
    return suggestions;
  }

  getProcessingFlags(originalValue, cleanedValue) {
    const flags = [];
    
    if (originalValue !== cleanedValue) {
      flags.push('value_cleaned');
    }
    
    if (originalValue && originalValue.includes(' ')) {
      flags.push('whitespace_trimmed');
    }
    
    if (originalValue && originalValue !== originalValue.toLowerCase() && cleanedValue === originalValue.toLowerCase()) {
      flags.push('case_normalized');
    }
    
    return flags;
  }

  assessDataQuality(value, type) {
    if (!value) return 'empty';
    
    const length = value.length;
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (type === 'email' && this.isValidEmail(value)) return 'high';
    if (type === 'phone' && this.isValidPhone(value)) return 'high';
    if (type === 'number' && !isNaN(parseFloat(value))) return 'high';
    
    if (length < 2) return 'low';
    if (length < 5 && type === 'text') return 'medium';
    
    return 'high';
  }

  generateSummary(processedData) {
    const totalFields = processedData.length;
    const validFields = processedData.filter(f => f.validation === 'valid').length;
    const requiresReview = processedData.filter(f => f.validation === 'requires_review').length;
    const invalidFields = processedData.filter(f => f.validation === 'invalid').length;
    
    return {
      totalFields,
      validFields,
      requiresReview,
      invalidFields,
      successRate: totalFields > 0 ? (validFields / totalFields) * 100 : 0,
      reviewRate: totalFields > 0 ? (requiresReview / totalFields) * 100 : 0,
      qualityScore: this.calculateQualityScore(processedData)
    };
  }

  calculateQualityScore(processedData) {
    if (processedData.length === 0) return 0;
    
    const qualityScores = processedData.map(field => {
      switch (field.metadata.dataQuality) {
        case 'high': return 1.0;
        case 'medium': return 0.7;
        case 'low': return 0.3;
        default: return 0.0;
      }
    });
    
    const average = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    return Math.round(average * 100);
  }

  calculateAverageConfidence(processedData) {
    if (processedData.length === 0) return 0;
    const total = processedData.reduce((sum, field) => sum + field.confidence, 0);
    return total / processedData.length;
  }

  analyzeDataTypes(processedData) {
    const types = {};
    processedData.forEach(field => {
      types[field.detectedType] = (types[field.detectedType] || 0) + 1;
    });
    return types;
  }
}

export default DataEntryAgent;
