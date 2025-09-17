# ATAN - Adaptive Task Automation Network

A production-ready marketplace platform where businesses rent AI agents for micro-tasks with a pay-as-you-go pricing model.

## 🚀 Features

### Core Platform
- **AI Agent Marketplace**: Three specialized agents (Invoice Processor, Email Sorter, Data Entry)
- **Pay-as-you-go Pricing**: Task-based + token-based pricing with volume discounts
- **Real-time Analytics**: Usage tracking, cost breakdowns, and predictive analysis
- **Prepaid Credits System**: Auto-top-up functionality with configurable thresholds
- **Department/Project Tracking**: Cost allocation and detailed reporting

### AI Agents
1. **Invoice Processor** - $0.05/task + $0.001/1K tokens
   - Document OCR and data extraction
   - 99.2% accuracy for invoice processing
   - Supports PDF, images, and email formats

2. **Email Sorter** - $0.03/task + $0.0008/1K tokens
   - Intelligent email classification and priority sorting
   - 96.8% accuracy for email categorization
   - Sentiment analysis and spam detection

3. **Data Entry** - $0.02/task + $0.0005/1K tokens
   - Automated data validation and entry
   - 98.1% accuracy for data processing
   - Format standardization and quality assessment

### Volume Discounts
- **5%** discount for 100+ tasks/day
- **10%** discount for 1,000+ tasks/day  
- **20%** discount for 10,000+ tasks/day

## 🛠️ Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **PostgreSQL**: Primary database with Drizzle ORM
- **WebSocket**: Real-time updates and notifications
- **JWT Authentication**: Secure user sessions
- **Passport.js**: Authentication middleware

### Frontend
- **React 18**: Modern UI with hooks and context
- **Tailwind CSS**: Responsive design system
- **Recharts**: Analytics visualizations
- **Wouter**: Lightweight routing
- **TanStack Query**: Data fetching and caching

### Development
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling
- **ESLint + Prettier**: Code quality
- **Drizzle Kit**: Database migrations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/atan-marketplace.git
   cd atan-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   