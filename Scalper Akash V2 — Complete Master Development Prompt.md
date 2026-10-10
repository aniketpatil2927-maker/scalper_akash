# SCALPER AKASH V2 — COMPLETE MASTER DEVELOPMENT PROMPT

## 0. PROJECT INSTRUCTION

You are a senior SaaS product architect, UI/UX designer, full-stack engineer, database architect, security engineer, QA engineer, DevOps engineer, and product manager.

Your task is to **upgrade the existing Scalper Akash application into a complete Trading Ecosystem SaaS platform**.

The existing application must NOT be treated as a new project.

### CRITICAL RULE

**DO NOT DELETE, BREAK, REMOVE, HIDE, OR REPLACE ANY EXISTING FUNCTIONAL FEATURE unless explicitly required.**

First inspect the complete existing application and understand:

- Existing frontend
- Existing backend
- Existing database
- Existing APIs
- Existing authentication
- Existing user roles
- Existing subscription system
- Existing trading signal system
- Existing payment system
- Existing notification system
- Existing admin ERP
- Existing trader/analyst functionality
- Existing member/client portal
- Existing public portal
- Existing reports
- Existing integrations
- Existing UI/UX

Then extend the platform.

If an existing feature overlaps with a new requirement, **enhance the existing implementation rather than creating a duplicate system**.

---

# 1. PRODUCT VISION

Transform:

**Scalper Akash**

from:

> Trading Signals + Subscription Management Platform

into:

> **Trading Signals + Trading Academy + Courses + Community + Playbooks + Webinars + Mentorship + Trading Journal + Analytics + AI Trading Assistant + Strategy Lab + Backtesting + Marketplace + Affiliate System + SaaS ERP**

The final product should feel like a **professional financial/trading technology platform**, not a basic signal-selling website.

---

# 2. CORE PRODUCT ECOSYSTEM

Build the platform around these major systems:

1. Public Website
2. Authentication
3. User/Member Portal
4. Trader/Analyst Portal
5. Mentor Portal
6. Academy
7. Free Mini Courses
8. Paid Courses
9. Trading Playbooks
10. Trading Signals
11. Trading Journal
12. Trading Analytics
13. Trader Score
14. Webinars
15. Masterclasses
16. Video Library
17. eBooks
18. Digital Marketplace
19. Community
20. Mentorship
21. AI Trading Assistant
22. Strategy Lab
23. Strategy Builder
24. Backtesting
25. Strategy Validation
26. Affiliate/Referral System
27. Certificates
28. CMS
29. CRM
30. Notifications
31. Payments
32. Subscriptions
33. Coupons
34. Reports
35. Business Analytics
36. Admin ERP
37. RBAC
38. Audit Logs
39. Security
40. Compliance/Disclaimers
41. API layer
42. Integrations
43. System settings

---

# 3. USER ROLES

Implement a scalable Role-Based Access Control system.

Required roles:

### Platform Roles

- Super Admin
- Admin
- Operations Manager
- Finance Manager
- Content Manager
- Support Manager
- Marketing Manager

### Trading Roles

- Trader
- Analyst
- Senior Trader
- Mentor

### Commercial Roles

- Affiliate
- Partner

### Customer Roles

- Visitor
- Free User
- Basic Subscriber
- Premium Subscriber
- VIP Subscriber
- Elite Member

The permission system must support:

- View
- Create
- Edit
- Delete
- Publish
- Approve
- Export
- Manage
- Refund
- Suspend
- Assign
- Moderate

Permissions must be configurable from Admin.

---

# 4. PUBLIC WEBSITE

Create a professional, responsive, modern public portal.

## Main Navigation

### Home

Sections:

- Hero
- Trading Signals
- Why Scalper Akash
- Features
- Live Market/Signal preview
- Academy
- Courses
- Playbooks
- Tools
- Webinars
- Community
- AI Trading Assistant
- Strategy Lab
- Testimonials
- Success Stories
- Pricing
- FAQ
- CTA
- Footer

---

## About

Include:

- Company overview
- Mission
- Vision
- Team
- Traders
- Mentors
- Methodology
- Risk philosophy
- Contact

---

## Pricing

Plans:

### FREE

- Free account
- Free mini courses
- Limited tools
- Public content
- Free resources
- Community access where applicable

### BASIC / PRO

- Trading signals
- Signal history
- Premium content
- Courses according to entitlement
- Playbooks
- Journal
- Analytics
- Community
- Webinars

### PREMIUM

Include all PRO features plus:

- Advanced courses
- Advanced analytics
- Premium playbooks
- Advanced tools
- Premium community
- Additional educational resources

### VIP

Include:

- VIP signals
- AI Trading Assistant
- Strategy Lab
- Advanced analytics
- VIP community
- Mentorship access
- Premium webinars
- Advanced playbooks

### ELITE

Include:

- Everything in VIP
- 1-to-1 mentorship
- Strategy-development sessions
- Advanced research
- Strategy testing
- Private sessions
- Dedicated support

Plans must be configurable from Admin.

DO NOT hard-code plan features.

Use:

**Plans → Entitlements → Permissions → User Access**

---

# 5. AUTHENTICATION

Implement:

- Registration
- Login
- Logout
- Forgot password
- Reset password
- Email verification
- Mobile verification where required
- OTP
- Google login where supported
- Two-factor authentication
- Session management
- Device management
- Login history
- Account suspension
- Account deletion
- Profile management

---

# 6. MEMBER DASHBOARD

The member dashboard should provide:

- Welcome section
- Subscription status
- Expiry date
- Signal summary
- Today's signals
- Course progress
- Journal summary
- Trading performance
- Upcoming webinars
- Community activity
- AI Assistant
- Recommended courses
- Recommended playbooks
- Notifications
- Recent trades
- Trader Score

---

# 7. TRADING SIGNAL MODULE

Preserve all existing signal functionality and enhance it.

Signal fields:

- Signal ID
- Trader
- Analyst
- Instrument
- Exchange
- Segment
- BUY/SELL
- Entry
- Entry range
- Stop Loss
- Target 1
- Target 2
- Target 3
- Quantity
- Risk level
- Timeframe
- Strategy
- Market condition
- Signal status
- Created date/time
- Updated date/time
- Closed date/time
- Result
- P&L
- Notes
- Chart
- Attachments

Statuses:

- Draft
- Scheduled
- Published
- Active
- Target 1 hit
- Target 2 hit
- Target 3 hit
- SL hit
- Closed
- Cancelled
- Expired

Support:

- Manual signals
- Scheduled signals
- Signal templates
- Signal history
- Signal analytics
- Signal performance
- Subscriber entitlements
- Notifications
- Push notifications
- Email
- SMS/WhatsApp integrations where legally and technically appropriate

---

# 8. TRADING ACADEMY

Create a complete Academy.

Navigation:

```text
Academy
├── All Courses
├── Beginner
├── Intermediate
├── Advanced
├── Intraday
├── Scalping
├── Options
├── Technical Analysis
├── Risk Management
├── Trading Psychology
└── Strategy Development
```

---

# 9. COURSE MANAGEMENT

Admin must be able to create:

- Course
- Category
- Instructor
- Description
- Thumbnail
- Trailer
- Modules
- Lessons
- Videos
- PDFs
- Audio
- Quizzes
- Assignments
- Resources
- FAQs
- Certificate
- Pricing
- Subscription entitlement

Course access:

- Free
- Basic
- Premium
- VIP
- Elite
- One-time purchase

---

# 10. COURSE PLAYER

Build a professional course-learning interface.

Features:

- Video player
- Lesson navigation
- Previous/Next
- Mark complete
- Automatic progress
- Course percentage
- Resume from last position
- Notes
- Bookmarks
- Downloads
- Quiz
- Assignment
- Discussion
- Related resources

---

# 11. FREE MINI COURSES

Create a lead-generation system.

Free mini courses:

- Trading Basics
- Candlestick Basics
- Chart Reading
- Support & Resistance
- Intraday Basics
- Scalping Basics
- Options Basics
- Risk Management
- Trading Psychology
- Trading Plan

Flow:

```text
Visitor
↓
Free Course
↓
Registration
↓
Learning
↓
Completion
↓
Premium Recommendation
↓
Subscription
```

Track:

- Views
- Registrations
- Starts
- Completion
- Drop-off
- Conversion
- Revenue

---

# 12. TRADING PLAYBOOKS

Create:

```text
Playbooks
├── Scalping
├── Intraday
├── Breakout
├── Options
├── Trend Following
├── Reversal
├── Risk Management
├── Psychology
└── Strategy Development
```

Each playbook supports:

- Introduction
- Market conditions
- Setup
- Entry
- Stop Loss
- Target
- Risk/Reward
- Examples
- Charts
- Checklist
- PDF
- Video
- Resources
- Related signals
- Related courses

---

# 13. TRADING TOOLS

Create a Tools section.

Required:

1. Position Size Calculator
2. Risk/Reward Calculator
3. Stop Loss Calculator
4. Target Calculator
5. Brokerage Calculator
6. Profit/Loss Calculator
7. Drawdown Calculator
8. Capital Requirement Calculator
9. Compounding Calculator
10. Trading Income Calculator
11. Risk-per-Trade Calculator
12. Margin Calculator where applicable

Each calculator should have:

- Input validation
- Calculation result
- Explanation
- Save result
- Share result
- Login requirement if needed
- Free/Premium entitlement

---

# 14. TRADING JOURNAL

Create:

**My Trading Journal**

Trade fields:

- Date
- Time
- Instrument
- Exchange
- BUY/SELL
- Entry
- Exit
- Quantity
- Stop Loss
- Target
- P&L
- Strategy
- Setup
- Reason for entry
- Reason for exit
- Market condition
- Emotion
- Mistake
- Lesson
- Screenshot
- Chart
- Tags

Features:

- Add trade
- Edit trade
- Delete trade
- Import trades
- Export trades
- Filter
- Search
- Calendar view
- Strategy view
- Instrument view
- Win/loss view

---

# 15. TRADING ANALYTICS

Create a professional analytics dashboard.

Metrics:

- Total trades
- Winning trades
- Losing trades
- Win rate
- Loss rate
- Gross profit
- Gross loss
- Net P&L
- Average win
- Average loss
- Risk/Reward
- Profit factor
- Maximum drawdown
- Average holding time
- Best trade
- Worst trade
- Consecutive wins
- Consecutive losses

Charts:

- Equity curve
- Daily P&L
- Weekly P&L
- Monthly P&L
- Strategy performance
- Instrument performance
- Time-of-day performance
- Win/loss distribution
- Drawdown chart

---

# 16. AKASH TRADER SCORE

Create:

**Akash Trader Score**

Score from 0–100.

Components:

- Risk Management
- Discipline
- Strategy Consistency
- Win Rate
- Drawdown Control
- Trade Quality
- Risk/Reward
- Journal Discipline

Show:

- Current score
- Previous score
- Improvement
- Weak areas
- Recommendations

Do not present the score as a guarantee of profitability.

---

# 17. WEBINARS

Create:

```text
Webinars
├── Upcoming
├── Live
├── Recorded
├── Premium
└── VIP
```

Features:

- Create webinar
- Registration
- Calendar
- Reminder
- Meeting link
- Attendance
- Recording
- Replay
- Q&A
- Feedback
- Certificate
- Access control

Integrate with supported video/meeting providers.

---

# 18. MASTERCLASSES

Create premium long-form sessions.

Features:

- Masterclass landing page
- Instructor
- Description
- Curriculum
- Registration
- Payment
- Live session
- Recording
- Resources
- Q&A
- Certificate
- Reviews

---

# 19. VIDEO LIBRARY

Create:

- Free videos
- Premium videos
- VIP videos
- Market analysis
- Trading lessons
- Strategy videos
- Interviews
- Recorded webinars
- Recorded masterclasses

Support:

- Categories
- Tags
- Search
- Filters
- Watch history
- Continue watching
- Likes
- Comments
- Access control

---

# 20. EBOOKS / DIGITAL RESOURCES

Create:

**Akash Digital Library**

Content:

- eBooks
- PDFs
- Guides
- Checklists
- Templates
- Strategy documents
- Reports

Features:

- Preview
- Download
- Purchase
- Subscription access
- Search
- Categories
- Ratings
- Reviews

---

# 21. DIGITAL MARKETPLACE

Create:

**Akash Marketplace**

Products:

- Courses
- eBooks
- Playbooks
- Webinars
- Masterclasses
- Templates
- Digital guides
- Trading journals
- Educational resources
- Mentorship packages

Support:

- Product page
- Pricing
- Discount
- Coupon
- Cart
- Checkout
- Order
- Invoice
- Payment
- Download
- Access entitlement
- Refund

---

# 22. COMMUNITY

Build an internal community.

Sections:

- General
- Market Discussion
- Intraday
- Scalping
- Options
- Strategy
- Beginners
- Premium
- VIP

Features:

- Posts
- Comments
- Replies
- Likes
- Polls
- Images
- Charts
- Files
- Mentions
- Hashtags
- Notifications
- Pin
- Edit
- Delete
- Report
- Block
- Moderation

Admin must have moderation tools.

---

# 23. TRADER / ANALYST PORTAL

Trader dashboard:

- Today's signals
- Signal creation
- Signal history
- Signal performance
- Subscribers
- Revenue
- Content
- Courses
- Playbooks
- Webinars
- Community
- Analytics
- Notifications

Trader profile:

- Name
- Bio
- Experience
- Trading style
- Markets
- Strategies
- Courses
- Signals
- Content
- Reviews

---

# 24. MENTORSHIP

Create:

**Akash Mentorship**

Mentor profile:

- Name
- Bio
- Experience
- Expertise
- Markets
- Trading style
- Availability
- Pricing
- Reviews

Session types:

- 30 minutes
- 60 minutes
- Group session
- Weekly
- Monthly
- Custom

Features:

- Booking
- Calendar
- Payment
- Confirmation
- Reminder
- Meeting link
- Reschedule
- Cancellation
- Attendance
- Feedback
- Reviews

---

# 25. AI TRADING ASSISTANT

Create:

**Akash AI Trading Assistant**

AI can help users analyze:

- Trading journal
- Historical trades
- Performance
- Strategy performance
- Risk patterns
- Trading mistakes
- Discipline
- Drawdown
- Learning progress

Example questions:

- "Analyze my last 50 trades."
- "Which strategy is performing best?"
- "What are my biggest mistakes?"
- "Why is my drawdown increasing?"
- "Summarize this week's performance."
- "Show my strongest trading conditions."
- "Help me understand this trading concept."

AI must NOT:

- Guarantee profit
- Claim certainty about future prices
- Present speculative predictions as facts
- Misrepresent itself as a licensed financial adviser
- Override platform risk controls

Show appropriate financial-risk disclaimers.

---

# 26. STRATEGY LAB

Create a premium module:

**Akash Strategy Lab**

Navigation:

```text
Strategy Lab
├── My Strategies
├── Strategy Builder
├── Backtesting
├── Optimization
├── Validation
├── Performance
└── Strategy Library
```

---

# 27. STRATEGY BUILDER

Allow users to define:

### Market

- Instrument
- Exchange
- Timeframe

### Entry

- Breakout
- Moving Average
- Support/Resistance
- Momentum
- Indicator
- Price action

### Filters

- RSI
- ADX
- ATR
- Volume
- Trend
- Volatility

### Risk

- Fixed stop
- Percentage risk
- ATR-based stop
- Risk/reward

### Exit

- Fixed target
- RR target
- Trailing stop
- Time-based exit
- Indicator exit

Allow:

**Save Strategy**

**Duplicate Strategy**

**Version Strategy**

**Backtest Strategy**

---

# 28. BACKTESTING ENGINE

Build a scalable backtesting architecture.

Inputs:

- Instrument
- Exchange
- Timeframe
- Historical period
- Entry rules
- Exit rules
- Stop Loss
- Target
- Position size
- Brokerage
- Slippage

Results:

- Total trades
- Winning trades
- Losing trades
- Win rate
- Net P&L
- Profit factor
- Average trade
- Average win
- Average loss
- Maximum drawdown
- CAGR where applicable
- Sharpe ratio where applicable
- Equity curve
- Drawdown curve

Clearly distinguish historical backtests from live trading results.

---

# 29. STRATEGY VALIDATION

Advanced validation:

- In-sample testing
- Out-of-sample testing
- Walk-forward testing
- Parameter sensitivity
- Robustness analysis
- Cross-market testing
- Market-condition testing

Never rank strategies solely by historical profit.

Show warnings for:

- Overfitting
- Small sample size
- High drawdown
- Unrealistic assumptions
- Excessive parameter optimization

---

# 30. STRATEGY LIBRARY

Users can save:

- Strategy name
- Description
- Rules
- Version
- Backtest
- Results
- Notes
- Tags
- Status

Statuses:

- Draft
- Testing
- Validated
- Archived

---

# 31. AFFILIATE / REFERRAL ENGINE

Create:

**Affiliate Dashboard**

Metrics:

- Referral URL
- Clicks
- Leads
- Registrations
- Paid customers
- Revenue
- Commission
- Pending commission
- Approved commission
- Paid commission

Features:

- Unique referral code
- Coupon
- Tracking
- Attribution
- Commission rules
- Recurring commission
- Payout management
- Fraud detection
- Affiliate reports

Admin controls:

- Commission percentage
- Fixed commission
- Cookie/attribution rules
- Minimum payout
- Payout status

---

# 32. CERTIFICATE SYSTEM

Generate certificates for:

- Course completion
- Webinar
- Masterclass
- Training programs

Certificate:

- User name
- Course/program
- Instructor
- Issue date
- Certificate ID
- QR code
- Verification URL

Create:

**Public Certificate Verification**

---

# 33. BLOG / KNOWLEDGE CENTER

Create:

- Articles
- Market education
- Trading guides
- Strategy education
- Risk management
- Psychology
- Options education
- Technical analysis

Features:

- Categories
- Tags
- SEO metadata
- Featured image
- Author
- Publish schedule
- Draft
- Review
- Publish
- Related content

---

# 34. CMS

Admin must be able to manage:

- Homepage
- About
- Pricing
- FAQ
- Courses
- Playbooks
- Blogs
- Webinars
- Videos
- eBooks
- Testimonials
- Success stories
- Banners
- Landing pages
- Menus
- Footer
- SEO
- Legal pages

No unnecessary hard-coded marketing content.

---

# 35. SUCCESS STORIES

Create:

**Trader Success Stories**

Fields:

- Name
- Profile
- Trading journey
- Experience
- Program used
- Testimonial
- Video
- Images
- Approval status

All performance claims must be handled carefully and should not imply guaranteed future returns.

---

# 36. CRM

Create:

**Akash CRM**

Lead stages:

```text
New
↓
Contacted
↓
Interested
↓
Free User
↓
Trial
↓
Paid
↓
Premium
↓
VIP
↓
Renewal
```

Track:

- Leads
- Source
- Campaign
- Affiliate
- Assigned staff
- Notes
- Calls
- Follow-ups
- Conversion
- Revenue

---

# 37. MARKETING AUTOMATION

Support:

- Welcome email
- Course reminder
- Abandoned checkout
- Trial ending
- Subscription expiry
- Renewal reminder
- Webinar reminder
- Course completion
- New signal
- New content
- Re-engagement
- Referral notification

Respect consent and applicable communication laws.

---

# 38. NOTIFICATION CENTER

Create centralized notifications:

- In-app
- Email
- Push
- SMS/WhatsApp where appropriate

Categories:

- Trading
- Subscription
- Course
- Webinar
- Community
- Payment
- Security
- System
- Marketing

Allow user notification preferences.

---

# 39. PAYMENT SYSTEM

Support the payment provider(s) already used by the application.

Architecture must support:

- One-time payments
- Recurring payments
- Subscriptions
- Coupons
- Discounts
- Refunds
- Failed payments
- Payment retry
- Invoices
- Tax/GST information where applicable
- Payment history
- Webhooks
- Reconciliation

Do not store raw card information.

---

# 40. SUBSCRIPTION MANAGEMENT

Support:

- Trial
- Active
- Paused
- Expired
- Cancelled
- Failed
- Grace period
- Renewed
- Upgraded
- Downgraded

Create subscription history.

---

# 41. ADMIN ERP

Admin sidebar:

```text
Dashboard

Users
├── All Users
├── Free Users
├── Subscribers
├── Suspended
└── User Activity

Traders
├── Traders
├── Analysts
├── Mentors
└── Performance

Trading
├── Signals
├── Signal Templates
├── Signal History
├── Performance
└── Analytics

Academy
├── Courses
├── Categories
├── Modules
├── Lessons
├── Quizzes
├── Assignments
└── Certificates

Content
├── Playbooks
├── Videos
├── eBooks
├── Blogs
├── Resources
└── Landing Pages

Webinars
├── Upcoming
├── Live
├── Recorded
└── Masterclasses

Community
├── Posts
├── Groups
├── Reports
└── Moderation

Marketplace
├── Products
├── Orders
├── Coupons
├── Downloads
└── Refunds

Mentorship
├── Mentors
├── Sessions
├── Bookings
└── Reviews

AI
├── Usage
├── Conversations
├── Limits
└── Settings

Strategy Lab
├── Strategies
├── Backtests
├── Validation
└── Analytics

Subscriptions
├── Plans
├── Entitlements
├── Active
├── Expired
└── Renewals

Payments
├── Transactions
├── Refunds
├── Invoices
└── Reconciliation

Affiliate
├── Affiliates
├── Referrals
├── Commissions
└── Payouts

CRM
├── Leads
├── Campaigns
├── Follow-ups
└── Conversion

Reports
├── Revenue
├── Users
├── Signals
├── Courses
├── Subscriptions
├── Affiliates
└── Business Analytics

CMS
├── Pages
├── Menus
├── Banners
├── FAQ
└── SEO

Settings
├── General
├── Roles
├── Permissions
├── Notifications
├── Payments
├── Integrations
├── Security
└── Audit Logs
```

---

# 42. ADMIN DASHBOARD

Show:

### Business

- Total users
- Active users
- Subscribers
- MRR
- ARR
- Revenue
- New subscriptions
- Renewals
- Churn

### Trading

- Signals today
- Active signals
- Signal success statistics
- Signal engagement

### Academy

- Course enrollments
- Completion
- Revenue
- Popular courses

### Community

- Active members
- Posts
- Engagement

### Marketplace

- Orders
- Revenue
- Top products

### Affiliate

- Leads
- Conversions
- Commission

### AI

- AI usage
- Users
- Queries
- Usage cost

---

# 43. BUSINESS ANALYTICS

Create:

- MRR
- ARR
- ARPU
- LTV
- CAC
- Churn
- Retention
- Conversion
- Trial conversion
- Course revenue
- Subscription revenue
- Marketplace revenue
- Mentorship revenue
- Affiliate revenue

Include date filters and export.

---

# 44. DATABASE ARCHITECTURE

Use a normalized, scalable database.

Major entities should include:

```text
users
roles
permissions
user_roles
role_permissions

profiles
traders
mentors

plans
plan_features
subscriptions
subscription_history

signals
signal_targets
signal_results
signal_attachments

courses
course_categories
course_modules
course_lessons
course_enrollments
lesson_progress
quizzes
quiz_questions
quiz_attempts
assignments

playbooks
videos
video_progress
ebooks
resources

webinars
webinar_registrations
webinar_attendance

community_groups
community_posts
community_comments
community_reactions
community_reports

trading_journals
trades
trade_attachments

trading_strategies
strategy_rules
backtests
backtest_trades
strategy_validations

mentors
mentor_sessions
mentor_bookings
mentor_reviews

products
orders
order_items
downloads
coupons

affiliates
referrals
commissions
payouts

leads
campaigns
followups

notifications
notification_preferences

ai_conversations
ai_messages
ai_usage

certificates
certificate_verifications

payments
invoices
refunds

audit_logs
system_settings
```

Reuse existing tables where appropriate.

Do NOT create duplicate tables simply because a new module is being added.

---

# 45. API ARCHITECTURE

Use clean REST or existing API architecture.

Organize APIs by domain:

```text
/auth
/users
/subscriptions
/signals
/courses
/playbooks
/videos
/webinars
/community
/journal
/analytics
/tools
/mentorship
/marketplace
/affiliate
/ai
/strategies
/backtests
/certificates
/crm
/admin
```

Use:

- Authentication
- Authorization
- Validation
- Rate limiting
- Pagination
- Filtering
- Sorting
- Logging
- Error handling

---

# 46. SECURITY

Implement:

- RBAC
- CSRF protection where applicable
- XSS protection
- SQL injection protection
- Input validation
- Rate limiting
- Secure password hashing
- 2FA
- Secure sessions
- API authentication
- File upload validation
- Malware-safe upload practices
- Audit logs
- Admin activity logging
- Payment webhook verification
- Secret management
- Backup strategy

Never expose:

- Password hashes
- API secrets
- Payment secrets
- Internal tokens
- Sensitive user information

---

# 47. FILE MANAGEMENT

Support:

- Course files
- PDFs
- Videos
- Images
- Certificates
- User trade screenshots
- Community attachments

Use:

- File type validation
- Size limits
- Secure storage
- Access-controlled downloads
- Signed URLs where appropriate

---

# 48. SEARCH

Implement global search.

Search:

- Courses
- Lessons
- Playbooks
- Videos
- eBooks
- Blogs
- Webinars
- Community
- Traders
- Mentors
- Strategies

Add filters.

---

# 49. RESPONSIVE UI/UX

The application must be:

- Desktop-first
- Tablet responsive
- Mobile responsive

Use a consistent design system.

### Design principles

- Premium fintech aesthetic
- Clean dashboard
- Strong typography
- Clear hierarchy
- Professional charts
- Minimal clutter
- Fast navigation
- Accessible controls
- Consistent spacing
- Consistent cards
- Consistent forms
- Consistent tables
- Consistent modals

Do not create every page with a different visual style.

---

# 50. DESIGN SYSTEM

Create reusable:

- Buttons
- Inputs
- Selects
- Tables
- Cards
- Tabs
- Modals
- Drawers
- Dropdowns
- Badges
- Alerts
- Toasts
- Charts
- Empty states
- Loading states
- Skeletons
- Error states

---

# 51. MOBILE EXPERIENCE

Mobile users must be able to:

- View signals
- Receive alerts
- Watch courses
- Read playbooks
- Use calculators
- Add journal trades
- View analytics
- Participate in community
- Join webinars
- Access AI Assistant
- Manage subscription

---

# 52. SEO

Public website must include:

- SEO title
- Meta description
- Open Graph
- Canonical URLs
- Sitemap
- Robots
- Structured data where appropriate
- SEO-friendly URLs
- Course schema where appropriate
- Article schema where appropriate
- Breadcrumbs

---

# 53. PERFORMANCE

Optimize:

- API queries
- Database indexes
- Images
- Video delivery
- Lazy loading
- Caching
- Pagination
- Background jobs
- Queue processing

Do not load huge datasets on initial page load.

---

# 54. AUDIT LOG

Track:

- Login
- Logout
- Password change
- User creation
- User update
- User suspension
- Subscription changes
- Payment changes
- Refunds
- Signal creation
- Signal modification
- Signal closure
- Content publishing
- Admin actions
- Permission changes

Audit log must contain:

- User
- Action
- Entity
- Entity ID
- Timestamp
- IP where appropriate
- Metadata

---

# 55. REPORTING

Admin reports:

### User Reports

- Registration
- Active users
- Churn
- Retention

### Revenue Reports

- Revenue
- Subscription revenue
- Marketplace revenue
- Mentorship revenue
- Affiliate commissions

### Trading Reports

- Signals
- Signal performance
- Trader performance

### Academy Reports

- Enrollments
- Completion
- Revenue
- Drop-off

Allow:

- Date filter
- Export CSV
- Export Excel/PDF where supported

---

# 56. COMPLIANCE & RISK DISCLOSURE

The platform must clearly distinguish:

- Education
- Historical performance
- Signals
- Analytics
- Backtests
- Simulated results
- Live results
- AI-generated analysis

Include appropriate:

- Risk disclaimer
- Terms
- Privacy Policy
- Refund Policy
- Subscription terms
- Trading-risk disclosures

Do not make guaranteed-profit claims.

Do not represent simulated/backtested results as live results.

Do not fabricate performance data.

Include appropriate regulatory/legal review requirements for the jurisdictions in which the service operates.

---

# 57. ADMIN CONTENT WORKFLOW

Content workflow:

```text
Draft
↓
Review
↓
Approved
↓
Published
↓
Archived
```

Apply to:

- Courses
- Playbooks
- Videos
- Blogs
- eBooks
- Webinars
- Landing pages

---

# 58. COUPON ENGINE

Support:

- Percentage discount
- Fixed discount
- First purchase
- Course-specific
- Plan-specific
- User-specific
- Affiliate coupon
- Expiry
- Usage limit
- Minimum amount
- Maximum discount

---

# 59. USER ENTITLEMENT ENGINE

Every premium feature must be controlled centrally.

Example:

```text
User
 ↓
Subscription
 ↓
Plan
 ↓
Entitlements
 ↓
Feature Access
```

This applies to:

- Signals
- Courses
- Playbooks
- Videos
- Webinars
- Community
- AI
- Strategy Lab
- Backtesting
- Mentorship
- Downloads

---

# 60. NOTIFICATION RULE ENGINE

Allow Admin to configure:

```text
EVENT
↓
CONDITION
↓
CHANNEL
↓
MESSAGE
```

Example:

```text
New Signal
→ Premium users
→ Push + Email
```

```text
Subscription expires in 3 days
→ Subscriber
→ Email + In-app
```

---

# 61. USER PROFILE

Profile should include:

- Personal details
- Avatar
- Trading preferences
- Preferred markets
- Preferred timeframe
- Risk settings
- Subscription
- Courses
- Certificates
- Journal
- Analytics
- Community
- Notifications
- Security

---

# 62. ADMIN SETTINGS

Create configurable settings for:

- Platform name
- Logo
- Favicon
- Email
- SMS
- Push
- Payment
- Tax
- Currency
- Timezone
- Notifications
- Subscription
- Affiliate
- AI
- Storage
- Security
- Maintenance
- SEO

---

# 63. INTEGRATIONS

Design integration-ready architecture for:

- Payment gateway
- Email provider
- SMS
- WhatsApp
- Push notification
- Video hosting
- Webinar platform
- Market-data provider
- Analytics
- AI provider
- Cloud storage

Never hard-code provider-specific logic throughout the application.

Use service/provider abstraction.

---

# 64. DEVELOPMENT METHODOLOGY

Before coding:

### STEP 1

Inspect the existing application.

### STEP 2

Create an inventory of all existing:

- Pages
- Modules
- Components
- APIs
- Tables
- Roles
- Permissions
- Integrations

### STEP 3

Map existing functionality to the new architecture.

### STEP 4

Identify:

- Reusable modules
- Duplicate functionality
- Missing functionality
- Technical debt
- Security risks

### STEP 5

Create migration plan.

### STEP 6

Implement incrementally.

### STEP 7

Run regression tests after every major module.

---

# 65. DEVELOPMENT PHASES

## PHASE 1

Foundation:

- RBAC
- Entitlement system
- Subscription engine
- UI design system
- API structure
- Database foundation

## PHASE 2

Academy:

- Courses
- Lessons
- Course player
- Free mini courses
- Certificates

## PHASE 3

Content:

- Playbooks
- Videos
- eBooks
- Blog
- CMS

## PHASE 4

Trading:

- Signals
- Journal
- Analytics
- Trader Score
- Calculators

## PHASE 5

Engagement:

- Community
- Webinars
- Masterclasses
- Notifications

## PHASE 6

Revenue:

- Marketplace
- Mentorship
- Affiliate
- Coupons
- CRM

## PHASE 7

AI:

- AI Assistant
- Journal analysis
- Performance analysis
- Educational assistant

## PHASE 8

Advanced Trading:

- Strategy Builder
- Strategy Library
- Backtesting
- Optimization
- Validation

---

# 66. PRIORITY SYSTEM

Every feature must receive:

### P0 — Critical

Required for platform operation.

### P1 — High

Required for V2 launch.

### P2 — Medium

Important growth features.

### P3 — Advanced

Premium/differentiation features.

---

# 67. DO NOT MISS THESE FEATURES

Before declaring the project complete, verify all of the following:

```text
[ ] Public Website
[ ] Authentication
[ ] RBAC
[ ] Subscription
[ ] Entitlements
[ ] Trading Signals
[ ] Trader Portal
[ ] Member Portal
[ ] Admin ERP
[ ] Academy
[ ] Free Mini Courses
[ ] Paid Courses
[ ] Course Player
[ ] Course Progress
[ ] Quizzes
[ ] Assignments
[ ] Certificates
[ ] Playbooks
[ ] Video Library
[ ] eBooks
[ ] Blog
[ ] Webinars
[ ] Masterclasses
[ ] Community
[ ] Trading Journal
[ ] Trading Analytics
[ ] Trader Score
[ ] Trading Calculators
[ ] Marketplace
[ ] Mentorship
[ ] AI Assistant
[ ] Strategy Builder
[ ] Strategy Library
[ ] Backtesting
[ ] Strategy Validation
[ ] Affiliate
[ ] Referral Tracking
[ ] CRM
[ ] Coupons
[ ] Payments
[ ] Invoices
[ ] Refunds
[ ] Notifications
[ ] CMS
[ ] SEO
[ ] Reports
[ ] Business Analytics
[ ] Audit Logs
[ ] Security
[ ] Compliance
[ ] Mobile Responsive
[ ] API Architecture
[ ] Database Architecture
[ ] File Management
[ ] Search
[ ] Integrations
[ ] Backup
[ ] Error Handling
[ ] Monitoring
[ ] Testing
```

---

# 68. QUALITY REQUIREMENTS

Do not consider a feature complete merely because its UI exists.

Every module must include:

1. UI
2. Backend
3. Database
4. API
5. Validation
6. Permissions
7. Error handling
8. Loading state
9. Empty state
10. Mobile responsiveness
11. Security
12. Audit logging where relevant
13. Analytics where relevant
14. Testing
15. Documentation

---

# 69. TESTING REQUIREMENTS

Perform:

### Unit Testing

- Business logic
- Calculations
- Permissions

### Integration Testing

- APIs
- Payments
- Subscriptions
- Notifications

### End-to-End Testing

Test complete flows:

```text
Visitor
→ Registration
→ Free Course
→ Subscription
→ Payment
→ Signal
→ Notification
→ Journal
→ Analytics
```

Also:

```text
Admin
→ Create Course
→ Publish
→ User Enrollment
→ Learning
→ Completion
→ Certificate
```

And:

```text
User
→ Strategy Builder
→ Backtest
→ Validation
→ Save Strategy
```

---

# 70. FINAL ACCEPTANCE CRITERIA

The project is NOT complete until:

- Existing features still work.
- No existing user data is lost.
- No existing subscription is broken.
- Existing signals continue working.
- Existing payments continue working.
- Existing authentication continues working.
- Existing admin functions continue working.
- All new modules are permission controlled.
- Free/Premium/VIP access works correctly.
- Mobile UI works.
- APIs are documented.
- Database migrations are tested.
- Security testing is completed.
- Payment webhooks are verified.
- Notification flows work.
- Course progress works.
- Certificates work.
- Marketplace purchases work.
- Affiliate attribution works.
- Journal calculations work.
- Analytics calculations are validated.
- Backtesting clearly separates historical/simulated results from live results.
- AI features respect configured access limits.
- Admin can control content without developer intervention.
- Admin can configure subscription entitlements.
- Error states are handled.
- Loading states are handled.
- Empty states are handled.
- Audit logs work.
- Backups are configured.
- Production deployment documentation exists.

---

# 71. IMPORTANT IMPLEMENTATION RULE

Do not blindly build everything in one pass.

Use this workflow:

```text
ANALYZE
↓
ARCHITECT
↓
DATABASE
↓
API
↓
UI/UX
↓
IMPLEMENT
↓
TEST
↓
SECURITY REVIEW
↓
REGRESSION TEST
↓
DOCUMENT
↓
NEXT MODULE
```

After each phase:

1. Verify existing functionality.
2. Verify new functionality.
3. Verify permissions.
4. Verify database integrity.
5. Verify mobile responsiveness.
6. Verify performance.
7. Verify security.

---

# 72. FINAL PRODUCT STRUCTURE

The finished Scalper Akash ecosystem should be:

```text
                         SCALPER AKASH
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
 PUBLIC PLATFORM         MEMBER PLATFORM          BUSINESS ERP
     │                        │                        │
 ├─ Home                ├─ Dashboard             ├─ Users
 ├─ Courses             ├─ Signals               ├─ Traders
 ├─ Mini Courses        ├─ Journal               ├─ Mentors
 ├─ Playbooks           ├─ Analytics             ├─ Signals
 ├─ Webinars            ├─ Courses               ├─ Academy
 ├─ eBooks              ├─ Playbooks             ├─ Content
 ├─ Tools               ├─ Community             ├─ Webinars
 ├─ Blog                ├─ AI Assistant          ├─ Community
 ├─ Marketplace         ├─ Strategy Lab          ├─ Marketplace
 ├─ Mentorship          ├─ Certificates          ├─ Payments
 ├─ Community           └─ Profile               ├─ Subscriptions
 └─ Pricing                                      ├─ Affiliate
                                                  ├─ CRM
                                                  ├─ Analytics
                                                  ├─ CMS
                                                  ├─ Reports
                                                  ├─ AI
                                                  ├─ Security
                                                  └─ Settings
```

---

# 73. FINAL OBJECTIVE

The final application must position Scalper Akash as a:

## **Complete Trading Technology & Education Ecosystem**

with four major value pillars:

### 1. TRADE

- Signals
- Market analysis
- Trading tools

### 2. LEARN

- Academy
- Courses
- Playbooks
- Webinars
- eBooks
- Masterclasses

### 3. ANALYZE

- Journal
- Analytics
- Trader Score
- AI Assistant
- Strategy Builder
- Backtesting
- Validation

### 4. CONNECT

- Community
- Traders
- Mentors
- Affiliates
- Marketplace

The platform should be designed for **long-term SaaS scalability**, allowing additional traders, courses, strategies, mentors, plans, products, communities, integrations, and AI capabilities to be added without redesigning the core architecture.

## NON-NEGOTIABLE

**Do not skip any module listed in this specification.**

**Do not remove existing Scalper Akash functionality.**

**Do not create duplicate systems where an existing system can be extended.**

**Do not hard-code subscription access.**

**Do not fabricate trading performance.**

**Do not represent backtested results as live results.**

**Do not present AI output as guaranteed financial advice or guaranteed returns.**

**Build the platform as a production-grade SaaS product, not a prototype.**