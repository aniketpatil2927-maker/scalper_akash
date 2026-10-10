-- =========================================================================
-- Scalper Akash Trading, Education, Analytics & Monetization Platform
-- Clean Production Baseline Setup Script
-- =========================================================================

USE two_trade_db;

-- 1. Insert Default System Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'Overall system owner with full administrative and revenue control'),
(2, 'ADMIN', 'Administrator managing plans, users, courses, webinars, referrals, and payments'),
(3, 'TRADER', 'Trader managing trade signals, analysis, masterclasses, and courses'),
(4, 'SUPPORT', 'Support staff viewing user profiles, plans, enrollments, and issues'),
(5, 'USER', 'Client/Subscriber receiving trade signals, taking courses, and earning affiliate rewards')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 2. Insert Core Permissions
INSERT INTO permissions (id, name, description) VALUES
(1, 'manage_users', 'Search, view, suspend, or manually activate users'),
(2, 'manage_plans', 'Create, update, or deactivate trading plans'),
(3, 'manage_trades', 'Create, schedule, publish, or close trade signals'),
(4, 'view_audit_logs', 'Read system audit logs'),
(5, 'view_reports', 'Read analytics, revenue, and affiliate reports'),
(6, 'view_signals', 'Read active assigned trade signals'),
(7, 'manage_payments', 'Adjust credits, manually assign plans, process payouts, or refund'),
(8, 'manage_videos', 'Upload, update, and manage recorded video sessions'),
(9, 'manage_courses', 'Create, edit, and publish courses, modules, and lessons'),
(10, 'manage_webinars', 'Schedule, host, and manage live webinars and masterclasses'),
(11, 'manage_referrals', 'Configure affiliate programs, approve commissions, and handle payouts'),
(12, 'manage_coupons', 'Create and manage cross-product promotional coupon codes'),
(13, 'manage_ai', 'Configure AI models, view usage analytics, and set token quotas')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 3. Map Roles to Permissions
-- SUPER_ADMIN permissions (All)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
-- ADMIN permissions
(2, 1), (2, 2), (2, 4), (2, 5), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13),
-- TRADER permissions
(3, 3), (3, 5), (3, 6), (3, 8), (3, 9), (3, 10),
-- SUPPORT permissions
(4, 1), (4, 6),
-- USER permissions
(5, 6);

-- 4. Insert Administrative Accounts
-- Default password: 'Password123!' (bcrypt hash)
INSERT INTO users (id, full_name, email, mobile, password_hash, status, otp_verified, referral_code) VALUES
(1, 'System Admin', 'admin@tradingplatform.com', '9999999999', '$2a$10$5UMWwAWNf0r4PoMcXL7SM.dbWBSJGQTaY0Ocfpg3M2i8.O5lt.Pym', 'ACTIVE', 1, 'ADMINREF'),
(2, 'Scalper Akash', 'trader@tradingplatform.com', '8888888888', '$2a$10$5UMWwAWNf0r4PoMcXL7SM.dbWBSJGQTaY0Ocfpg3M2i8.O5lt.Pym', 'ACTIVE', 1, 'AKASHVIP')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash), status=VALUES(status), otp_verified=VALUES(otp_verified), referral_code=VALUES(referral_code);

-- 5. Map Administrative Accounts to Roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin maps to SUPER_ADMIN
(2, 3); -- Akash maps to TRADER

-- 6. Insert Default Trading Subscription Plans
INSERT INTO plans (id, name, price, promo_price, validity_days, allowed_trades, access_tier, features, risk_info, is_active, is_visible) VALUES
(1, 'Basic Plan', 499.00, NULL, 7, 2, 'BASIC', 
 '["Basic trade signals", "Entry price & Stop Loss", "Target 1 access", "In-app notifications", "5 AI Assistant queries"]', 
 'Trading involves financial risk. Ideas are for educational purposes. Win-rate is not guaranteed.', 1, 1),
(2, 'Premium Plan', 1499.00, 1199.00, 30, 2, 'PREMIUM', 
 '["Premium trade signals", "Stop Loss & Multi-targets", "In-depth market analysis", "Email & SMS updates", "50 AI Queries / mo", "All Basic & Intermediate Courses"]', 
 'Medium risk profile. Leverage and position sizing should be strictly managed.', 1, 1),
(3, 'VIP Plan', 4999.00, 3999.00, 30, 2, 'VIP', 
 '["Exclusive VIP signals", "Direct trader commentary", "Advanced market analysis", "Live risk adjustments", "250 AI Queries / mo", "All Masterclasses & Webinars Free", "Priority Payouts"]', 
 'High risk/reward profiles. Intended for experienced traders. Trade sizing recommended at < 2% of portfolio per trade.', 1, 1)
ON DUPLICATE KEY UPDATE 
    name=VALUES(name), 
    price=VALUES(price), 
    promo_price=VALUES(promo_price),
    validity_days=VALUES(validity_days), 
    allowed_trades=VALUES(allowed_trades), 
    access_tier=VALUES(access_tier), 
    features=VALUES(features), 
    risk_info=VALUES(risk_info),
    is_active=VALUES(is_active),
    is_visible=VALUES(is_visible);

-- 7. Insert Course Categories
INSERT INTO course_categories (id, name, slug, description, icon, order_index, is_active) VALUES
(1, 'Scalping Strategies', 'scalping', 'Fast-paced high probability intraday scalping methodologies', 'Zap', 1, 1),
(2, 'Price Action & Order Flow', 'price-action', 'Institutional footprint, volume profile, and liquidity analysis', 'TrendingUp', 2, 1),
(3, 'Options Trading', 'options-trading', 'Options Greeks, delta neutral strategies, and expiry day trading', 'Layers', 3, 1),
(4, 'Risk Management & Psychology', 'risk-psychology', 'Position sizing, emotional control, and draw-down management', 'ShieldCheck', 4, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug);

-- 8. Insert Referral Program Configuration
INSERT INTO referral_programs (id, name, commission_type, default_commission_rate, tier_rates, min_payout_amount, holding_period_days, is_active) VALUES
(1, 'Scalper Akash Elite Partner Program', 'PERCENTAGE', 15.00, '{"BASIC": 10.0, "PREMIUM": 15.0, "VIP": 20.0}', 1000.00, 7, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), default_commission_rate=VALUES(default_commission_rate);
