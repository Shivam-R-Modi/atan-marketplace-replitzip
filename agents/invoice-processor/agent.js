import { TokenService } from '../../server/services/tokenService.js';

const tokenService = new TokenService();

export class InvoiceProcessorAgent {
  constructor() {
    this.name = "Invoice Processor";
    this.type = "invoice-processor";
    this.version = "1.0.0";
    this.capabilities = {
      formats: ["PDF", "Image", "Email"],
      languages: ["English", "Spanish", "French"],
      accuracy: "99.2%"
    };
  }

  async process(input) {
    try {
      // Validate input
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: Expected object with document data');
      }

      const { document, extractFields = [] } = input;
      
      if (!document) {
        throw new Error('Invalid input: Document is required');
      }

      // Calculate input tokens
      const inputTokens = tokenService.countInputTokens(input);

      // Simulate AI processing with realistic delay
      await this.simulateProcessing();

      // Generate realistic invoice data
      const output = {
        invoiceNumber: this.generateInvoiceNumber(),
        amount: this.generateAmount(),
        currency: "USD",
        dueDate: this.generateDueDate(),
        vendor: this.generateVendorName(),
        customerInfo: this.generateCustomerInfo(),
        lineItems: this.generateLineItems(),
        taxAmount: this.calculateTax(),
        subtotal: 0,
        confidence: 0.98 + Math.random() * 0.02,
        extractedFields: extractFields.length > 0 ? this.extractSpecificFields(extractFields) : null,
        extractedAt: new Date().toISOString(),
        metadata: {
          processingTime: Math.round(Math.random() * 2000 + 500),
          documentType: "invoice",
          pageCount: Math.floor(Math.random() * 3) + 1
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
    // Simulate realistic processing time for document analysis
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  generateInvoiceNumber() {
    const prefixes = ['INV', 'BILL', 'DOC', 'REF'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}-${number}`;
  }

  generateAmount() {
    return Math.round((Math.random() * 5000 + 100) * 100) / 100;
  }

  generateDueDate() {
    const days = Math.floor(Math.random() * 60) + 15; // 15-75 days from now
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  generateVendorName() {
    const companies = [
      'Acme Corp', 'Global Solutions Inc', 'TechFlow Systems', 
      'Premier Services LLC', 'DataTech Solutions', 'CloudVision Ltd',
      'NextGen Technologies', 'Elite Business Services'
    ];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  generateCustomerInfo() {
    return {
      name: 'Your Company Name',
      address: '123 Business St, Suite 100',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      email: 'billing@yourcompany.com'
    };
  }

  generateLineItems() {
    const services = [
      'Professional Services', 'Consulting Hours', 'Software License',
      'Technical Support', 'Implementation Services', 'Training Services',
      'Maintenance Contract', 'Development Work'
    ];

    const itemCount = Math.floor(Math.random() * 4) + 1;
    return Array.from({ length: itemCount }, (_, i) => ({
      id: i + 1,
      description: services[Math.floor(Math.random() * services.length)],
      quantity: Math.floor(Math.random() * 10) + 1,
      unitPrice: Math.round((Math.random() * 200 + 50) * 100) / 100,
      total: 0 // Will be calculated
    })).map(item => ({
      ...item,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100
    }));
  }

  calculateTax() {
    return Math.round(this.generateAmount() * 0.08 * 100) / 100; // 8% tax
  }

  extractSpecificFields(fields) {
    const fieldMap = {
      amount: this.generateAmount(),
      vendor: this.generateVendorName(),
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: this.generateInvoiceNumber(),
      dueDate: this.generateDueDate()
    };

    return fields.reduce((acc, field) => {
      if (fieldMap[field]) {
        acc[field] = fieldMap[field];
      }
      return acc;
    }, {});
  }
}

export default InvoiceProcessorAgent;
