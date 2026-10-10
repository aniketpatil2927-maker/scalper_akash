import { 
  Playbook, 
  Mentor, 
  Product, 
  BlogPost, 
  CommunityPost, 
  CourseCertificate, 
  Course,
  User 
} from '../src/models/index.js';
import { sequelize } from '../src/config/db.js';

async function seedV2() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database.');

    // Fetch an admin user id for associations
    let admin = await User.findOne();
    const adminId = admin ? admin.id : 1;

    // 1. Check & Seed Playbooks
    const playbookCount = await Playbook.count();
    if (playbookCount === 0) {
      console.log('Seeding initial Playbooks...');
      await Playbook.bulkCreate([
        {
          title: 'Bank Nifty 5-Min Opening Range Breakout (ORB)',
          slug: 'bank-nifty-5min-orb',
          category: 'SCALPING',
          description: 'High-momentum opening drive capture focusing on the first 5-minute candle break with volume surge and 9 EMA alignment.',
          marketConditions: 'High volatility, first 30 minutes of Indian market session (09:15 - 09:45 AM).',
          setupRules: 'First 5m candle forms clean range without long wicks on both sides. Heavyweight banks in unison.',
          entryRules: 'Enter on 1m breakout above High (Call) or below Low (Put) with volume expansion.',
          stopLossRules: 'Midpoint of the 5m opening range or swing pivot (max 30-40 pts on index).',
          targetRules: '1:2 minimum, scale out 70% at 1:2 and trail remainder with 9 EMA.',
          riskRewardRatio: '1:2.5',
          checklist: [
            'Is opening candle clean without major wicks?',
            'Are HDFC Bank and ICICI Bank moving in same direction?',
            'Is India VIX between 11 and 18?',
            'Risk strictly capped at 1% of total capital.'
          ],
          tierRequired: 'FREE',
          status: 'PUBLISHED',
          viewsCount: 1420,
          likesCount: 142
        },
        {
          title: 'Nifty 9:20 AM Delta Scalp & Straddle Framework',
          slug: 'nifty-920-straddle-scalp',
          category: 'OPTIONS',
          description: 'Systematic 9:20 AM ATM straddle decay capture and directional momentum rider on ATM strike options.',
          marketConditions: 'Trending opening session or initial consolidation with expanding delta.',
          setupRules: 'Observe 9:20 AM ATM strikes for Call and Put. Track premium momentum velocity.',
          entryRules: 'Enter ATM Call or Put when 3-min Delta RSI breaks out with VWAP support.',
          stopLossRules: '10 points on option premium or previous 3m candle low.',
          targetRules: '20-30 points on index option premium.',
          riskRewardRatio: '1:2',
          checklist: [
            'Option Greeks verified: Theta decay balanced?',
            'VWAP sloping in the direction of the trade?',
            'No high-impact macroeconomic event in next 30 minutes.'
          ],
          tierRequired: 'PREMIUM',
          status: 'PUBLISHED',
          viewsCount: 980,
          likesCount: 98
        },
        {
          title: 'Institutional Supply & Demand Reversal (SMC)',
          slug: 'institutional-supply-demand-smc',
          category: 'REVERSAL',
          description: 'Catching institutional liquidity sweeps and Order Block mitigation zones in key index futures and equities.',
          marketConditions: 'Market reaching major Daily/Weekly liquidity extreme or Previous Day High/Low.',
          setupRules: 'Mark liquidity pool. Wait for liquidity sweep followed by rapid displacement (FVG).',
          entryRules: 'Enter on FVG tap on the 3-minute execution chart with confirmational rejection wick.',
          stopLossRules: '5 points beyond the liquidity sweep extreme.',
          targetRules: 'Opposite liquidity pool or 1:3.5 R:R.',
          riskRewardRatio: '1:3.5',
          checklist: [
            'Clear Change of Character (CHoCH) on 1m/3m timeframe?',
            'FVG mitigation occurred without closing through the order block?',
            'Risk-to-Reward ratio is at least 1:3 before entry.'
          ],
          tierRequired: 'VIP',
          status: 'PUBLISHED',
          viewsCount: 2150,
          likesCount: 215
        }
      ]);
      console.log('Playbooks seeded successfully.');
    }

    // 2. Check & Seed Mentors
    const mentorCount = await Mentor.count();
    if (mentorCount === 0) {
      console.log('Seeding initial Mentors...');
      await Mentor.bulkCreate([
        {
          userId: adminId,
          name: 'Akash Verma',
          bio: '8+ years of dedicated intraday scalping experience in Indian Derivatives (Nifty & Bank Nifty). Specializes in order flow, price action, and psychological discipline.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          experienceYears: 8,
          expertise: ['Index Scalping', 'Price Action', 'Order Flow Analysis', 'Risk Management'],
          tradingStyle: 'High-Frequency Intraday Scalping',
          hourlyRate: 2999.00,
          rating: 4.95,
          reviewCount: 340,
          isActive: true
        },
        {
          userId: adminId,
          name: 'Rohan Sharma',
          bio: 'Former institutional prop desk options trader with expertise in non-directional strategies, delta hedging, and systematic automated execution.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          experienceYears: 6,
          expertise: ['Options Selling', 'Delta Neutral', 'Backtesting & Automation', 'Hedging'],
          tradingStyle: 'Non-Directional Derivatives & Quant',
          hourlyRate: 1999.00,
          rating: 4.88,
          reviewCount: 195,
          isActive: true
        }
      ]);
      console.log('Mentors seeded successfully.');
    }

    // 3. Check & Seed Digital Marketplace Products
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding initial Marketplace Products...');
      await Product.bulkCreate([
        {
          title: 'The Ultimate Bank Nifty Scalping Blueprint (PDF eBook)',
          slug: 'bank-nifty-scalping-blueprint-ebook',
          type: 'EBOOK',
          price: 999.00,
          discountPrice: 2499.00,
          description: 'A 140-page definitive master manual detailing high-probability setup recognition, precise entries, risk sizing matrices, and execution psychology.',
          features: [
            '140+ Illustrated Color Pages with Real Chart Examples',
            'Pre-market Routine & Watchlist Construction Sheet',
            'Full 12-Formula Risk Sizing Quick Reference Cheat Sheet',
            'Instant High-Resolution PDF Download with Lifetime Updates'
          ],
          thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
          downloadUrl: 'https://scalperakash.com/downloads/scalping-blueprint.pdf',
          rating: 4.92,
          salesCount: 412,
          isActive: true
        },
        {
          title: 'Institutional Order Flow & FVG Indicator Suite (TradingView)',
          slug: 'order-flow-fvg-indicator-suite',
          type: 'INDICATOR_TOOL',
          price: 1499.00,
          discountPrice: 3999.00,
          description: 'Custom PineScript indicator suite that automatically identifies institutional Fair Value Gaps, Liquidity Sweeps, and dynamic VWAP bands.',
          features: [
            'Auto FVG (Fair Value Gap) Highlighter on any timeframe',
            'Previous Day High/Low & Opening Range breakout scanner',
            'Custom Scalper Akash Momentum Alerts on Telegram/Discord',
            'Full Setup Guide and Video Tutorial Included'
          ],
          thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
          downloadUrl: 'https://scalperakash.com/downloads/pinescript-suite.zip',
          rating: 4.96,
          salesCount: 289,
          isActive: true
        },
        {
          title: 'Complete 10-Strategy Playbook Bundle (Pro Collection)',
          slug: 'pro-playbook-bundle-pack',
          type: 'PLAYBOOK',
          price: 1999.00,
          discountPrice: 4999.00,
          description: 'The master collection of 10 battle-tested trading playbooks with verified backtests, execution rules, and printable desk cheatsheets.',
          features: [
            '10 Complete Step-by-Step Playbooks (Scalp, Swing, Options)',
            'Interactive Excel Risk & Position Size Calculator',
            'Daily Trade Journal Notion / Google Sheets Template',
            'Access to Monthly Strategy Update Q&A Recordings'
          ],
          thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
          downloadUrl: 'https://scalperakash.com/downloads/playbook-bundle.zip',
          rating: 4.98,
          salesCount: 560,
          isActive: true
        }
      ]);
      console.log('Marketplace Products seeded successfully.');
    }

    // 4. Check & Seed Blog Posts
    const blogCount = await BlogPost.count();
    if (blogCount === 0) {
      console.log('Seeding initial Blog Posts...');
      await BlogPost.bulkCreate([
        {
          title: 'Mastering the First 15 Minutes of Bank Nifty: The Institutional Playbook',
          slug: 'mastering-first-15-minutes-bank-nifty',
          category: 'Market Strategy',
          summary: 'Why 90% of retail traders get chopped up at 9:15 AM and how smart money utilizes the opening liquidity to trap impatient participants.',
          content: `### The 9:15 AM Liquidity Battle\nThe opening 15 minutes of the Indian market session (09:15 – 09:30 AM IST) are characterized by the highest volume velocity and volatility of the entire trading day.\n\n#### The 3 Core Rules for Morning Scalping\n1. **Never FOMO Market Orders at 09:15:01**: The opening spread between bid and ask is at its widest.\n2. **Respect the 5-Minute ORB**: Wait for the first 5-minute candle to print.\n3. **Confirm with Heavyweight Component Alignment**: In Bank Nifty, HDFC Bank (28% weightage) and ICICI Bank (23% weightage) must agree with the directional break.\n\n#### Conclusion\nPatience in the first 5 minutes will save more capital than any indicator on your chart.`,
          author: 'Akash Verma',
          thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
          tags: ['BankNifty', 'MorningStrategy', 'Psychology', 'RiskManagement'],
          readTimeMins: 5,
          status: 'PUBLISHED'
        },
        {
          title: 'Risk-to-Reward vs Win Rate: The Mathematical Edge in Scalping',
          slug: 'risk-to-reward-vs-win-rate-mathematical-edge',
          category: 'Risk Management',
          summary: 'You do not need an 80% win rate to become a consistently profitable trader. Understand the expectancy formula that institutional funds trade by.',
          content: `### The Expectancy Equation\nIn professional trading, edge is defined mathematically through the Expectancy Formula:\n\nExpectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)\n\n#### Practical Rules for Scalpers\n- Fix maximum loss per trade at 1% to 1.5% of capital.\n- Set hard daily stop loss at 3R.\n- Never average down on a losing intraday position.`,
          author: 'Akash Verma',
          thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
          tags: ['RiskManagement', 'Math', 'Expectancy', 'Discipline'],
          readTimeMins: 6,
          status: 'PUBLISHED'
        }
      ]);
      console.log('Blog Posts seeded successfully.');
    }

    // 5. Check & Seed Certificate
    const certCount = await CourseCertificate.count();
    if (certCount === 0) {
      console.log('Seeding initial verification Certificate...');
      const { Course, CourseCategory } = await import('../src/models/index.js');
      
      let category = await CourseCategory.findOne();
      if (!category) {
        category = await CourseCategory.create({
          name: 'Derivatives & Options',
          slug: 'derivatives-options',
          description: 'Master Indian Derivatives, Futures & Options'
        });
      }

      let course = await Course.findOne();
      if (!course) {
        course = await Course.create({
          categoryId: category.id,
          title: 'Master Scalper Price Action & Derivatives Certification',
          slug: 'master-scalper-certification-course',
          shortDescription: 'The comprehensive professional certification in Indian markets scalping.',
          description: 'Complete hands-on institutional curriculum.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
          instructor: 'Scalper Akash',
          difficulty: 'ADVANCED',
          durationMinutes: 720,
          price: 4999.00,
          discountPrice: 12999.00,
          accessType: 'PAID',
          requiredTier: 'BASIC',
          status: 'PUBLISHED'
        });
      }

      await CourseCertificate.create({
        certificateId: 'CERT-SA-2025-8849',
        userId: adminId,
        courseId: course.id,
        studentName: 'Rahul Deshmukh',
        courseTitle: 'Master Scalper Price Action & Derivatives Certification',
        instructor: 'Scalper Akash',
        issueDate: new Date('2025-01-15')
      });
      console.log('Certificate seeded successfully.');
    }

    console.log('=== V2 Database Seeding Complete! ===');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding V2 database:', err);
    process.exit(1);
  }
}

seedV2();
