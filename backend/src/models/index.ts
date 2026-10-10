import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

// ============================================================================
// 1. Role Model
// ============================================================================
export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
}
Role.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, { sequelize, tableName: 'roles' });

// ============================================================================
// 1.5 UserRole Through Model
// ============================================================================
export class UserRole extends Model {
  declare userId: number;
  declare roleId: number;
}
UserRole.init({
  userId: { type: DataTypes.INTEGER, primaryKey: true, field: 'user_id' },
  roleId: { type: DataTypes.INTEGER, primaryKey: true, field: 'role_id' }
}, { sequelize, tableName: 'user_roles', timestamps: false });

// ============================================================================
// 2. Permission Model
// ============================================================================
export class Permission extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
}
Permission.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, { sequelize, tableName: 'permissions' });

// ============================================================================
// 2.5 RolePermission Through Model
// ============================================================================
export class RolePermission extends Model {
  declare roleId: number;
  declare permissionId: number;
}
RolePermission.init({
  roleId: { type: DataTypes.INTEGER, primaryKey: true, field: 'role_id' },
  permissionId: { type: DataTypes.INTEGER, primaryKey: true, field: 'permission_id' }
}, { sequelize, tableName: 'role_permissions', timestamps: false });

// ============================================================================
// 3. User Model
// ============================================================================
export class User extends Model {
  declare id: number;
  declare fullName: string;
  declare mobile: string;
  declare email: string;
  declare passwordHash: string;
  declare status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_OTP';
  declare referralCode: string | null;
  declare otpSecret: string | null;
  declare otpExpiresAt: Date | null;
  declare otpVerified: boolean;
}
User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING(100), allowNull: false, field: 'full_name' },
  mobile: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  status: { type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'PENDING_OTP'), defaultValue: 'PENDING_OTP' },
  referralCode: { type: DataTypes.STRING(50), allowNull: true, field: 'referral_code' },
  otpSecret: { type: DataTypes.STRING(10), allowNull: true, field: 'otp_secret' },
  otpExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'otp_expires_at' },
  otpVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'otp_verified' },
}, { sequelize, tableName: 'users' });

// ============================================================================
// 4. Plan Model (Trading Signals Subscriptions)
// ============================================================================
export class Plan extends Model {
  declare id: number;
  declare name: string;
  declare price: number;
  declare promoPrice: number | null;
  declare validityDays: number;
  declare allowedTrades: number;
  declare accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  declare features: string[];
  declare riskInfo: string;
  declare isActive: boolean;
  declare isVisible: boolean;
}
Plan.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  promoPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'promo_price' },
  validityDays: { type: DataTypes.INTEGER, allowNull: false, field: 'validity_days' },
  allowedTrades: { type: DataTypes.INTEGER, allowNull: false, field: 'allowed_trades' },
  accessTier: { type: DataTypes.ENUM('BASIC', 'PREMIUM', 'VIP'), defaultValue: 'BASIC', field: 'access_tier' },
  features: { 
    type: DataTypes.JSON, 
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('features');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
    }
  },
  riskInfo: { type: DataTypes.TEXT, allowNull: false, field: 'risk_info' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_visible' },
}, { sequelize, tableName: 'plans' });

// ============================================================================
// 5. Subscription Model
// ============================================================================
export class Subscription extends Model {
  declare id: number;
  declare userId: number;
  declare planId: number;
  declare status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  declare allowedTrades: number;
  declare usedTrades: number;
  declare remainingTrades: number;
  declare startDate: Date;
  declare expiryDate: Date;
  declare User: User;
  declare Plan: Plan;
}
Subscription.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  planId: { type: DataTypes.INTEGER, allowNull: false, field: 'plan_id' },
  status: { type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED'), defaultValue: 'ACTIVE' },
  allowedTrades: { type: DataTypes.INTEGER, allowNull: false, field: 'allowed_trades' },
  usedTrades: { type: DataTypes.INTEGER, defaultValue: 0, field: 'used_trades' },
  remainingTrades: { type: DataTypes.INTEGER, allowNull: false, field: 'remaining_trades' },
  startDate: { type: DataTypes.DATE, allowNull: false, field: 'start_date' },
  expiryDate: { type: DataTypes.DATE, allowNull: false, field: 'expiry_date' },
}, { sequelize, tableName: 'subscriptions' });

// ============================================================================
// 6. Trade Model
// ============================================================================
export class Trade extends Model {
  declare id: number;
  declare asset: string;
  declare direction: 'BUY' | 'SELL';
  declare entryPrice: number;
  declare stopLoss: number;
  declare target1: number;
  declare target2: number | null;
  declare target3: number | null;
  declare riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  declare status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ACTIVE' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CLOSED' | 'CANCELLED' | 'EXPIRED';
  declare accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  declare analysis: string | null;
  declare commentary: string | null;
  declare publishedAt: Date | null;
  declare expiresAt: Date | null;
}
Trade.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  asset: { type: DataTypes.STRING(50), allowNull: false },
  direction: { type: DataTypes.ENUM('BUY', 'SELL'), allowNull: false },
  entryPrice: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'entry_price' },
  stopLoss: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'stop_loss' },
  target1: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'target_1' },
  target2: { type: DataTypes.DECIMAL(18, 4), allowNull: true, field: 'target_2' },
  target3: { type: DataTypes.DECIMAL(18, 4), allowNull: true, field: 'target_3' },
  riskLevel: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'MEDIUM', field: 'risk_level' },
  status: { 
    type: DataTypes.ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ACTIVE', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED', 'CANCELLED', 'EXPIRED'), 
    defaultValue: 'DRAFT' 
  },
  accessTier: { type: DataTypes.ENUM('BASIC', 'PREMIUM', 'VIP'), defaultValue: 'BASIC', field: 'access_tier' },
  analysis: { type: DataTypes.TEXT, allowNull: true },
  commentary: { type: DataTypes.TEXT, allowNull: true },
  publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' },
  expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
}, { sequelize, tableName: 'trades' });

// ============================================================================
// 7. SubscriptionTrade Model
// ============================================================================
export class SubscriptionTrade extends Model {
  declare id: number;
  declare subscriptionId: number;
  declare tradeId: number;
  declare allocatedAt: Date;
  declare Trade: Trade;
  declare Subscription: Subscription;
}
SubscriptionTrade.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  subscriptionId: { type: DataTypes.INTEGER, allowNull: false, field: 'subscription_id' },
  tradeId: { type: DataTypes.INTEGER, allowNull: false, field: 'trade_id' },
  allocatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'allocated_at' },
}, { 
  sequelize, 
  tableName: 'subscription_trades',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['subscription_id', 'trade_id'], name: 'uq_sub_trade' }
  ]
});

// ============================================================================
// 8. TradeUpdate Model
// ============================================================================
export class TradeUpdate extends Model {
  declare id: number;
  declare tradeId: number;
  declare updateType: 'STOP_LOSS_UPDATE' | 'TARGET_HIT' | 'CLOSED' | 'COMMENTARY';
  declare oldValue: string | null;
  declare newValue: string | null;
  declare commentary: string | null;
  declare createdAt: Date;
}
TradeUpdate.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tradeId: { type: DataTypes.INTEGER, allowNull: false, field: 'trade_id' },
  updateType: { type: DataTypes.ENUM('STOP_LOSS_UPDATE', 'TARGET_HIT', 'CLOSED', 'COMMENTARY'), allowNull: false, field: 'update_type' },
  oldValue: { type: DataTypes.STRING(255), allowNull: true, field: 'old_value' },
  newValue: { type: DataTypes.STRING(255), allowNull: true, field: 'new_value' },
  commentary: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, tableName: 'trade_updates', updatedAt: false });

// ============================================================================
// 9. Coupon Model (Unified Cross-Product Discount Engine)
// ============================================================================
export class Coupon extends Model {
  declare id: number;
  declare code: string;
  declare discountType: 'PERCENTAGE' | 'FIXED';
  declare discountValue: number;
  declare minOrderAmount: number;
  declare maxDiscount: number | null;
  declare appliesTo: 'ALL' | 'SUBSCRIPTION' | 'COURSE' | 'WEBINAR';
  declare usageLimit: number;
  declare usedCount: number;
  declare validFrom: Date;
  declare validUntil: Date;
  declare isActive: boolean;
}
Coupon.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  discountType: { type: DataTypes.ENUM('PERCENTAGE', 'FIXED'), defaultValue: 'PERCENTAGE', field: 'discount_type' },
  discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'discount_value' },
  minOrderAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, field: 'min_order_amount' },
  maxDiscount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'max_discount' },
  appliesTo: { type: DataTypes.ENUM('ALL', 'SUBSCRIPTION', 'COURSE', 'WEBINAR'), defaultValue: 'ALL', field: 'applies_to' },
  usageLimit: { type: DataTypes.INTEGER, defaultValue: 1000, field: 'usage_limit' },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'used_count' },
  validFrom: { type: DataTypes.DATE, allowNull: false, field: 'valid_from' },
  validUntil: { type: DataTypes.DATE, allowNull: false, field: 'valid_until' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, { sequelize, tableName: 'coupons' });

// ============================================================================
// 10. Order Model (Unified Monetization Engine)
// ============================================================================
export class Order extends Model {
  declare id: number;
  declare userId: number;
  declare orderType: 'SUBSCRIPTION' | 'COURSE' | 'WEBINAR';
  declare planId: number | null;
  declare itemId: number | null;
  declare couponId: number | null;
  declare amount: number;
  declare discountAmount: number;
  declare finalAmount: number;
  declare status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  declare createdAt: Date;
  declare updatedAt: Date;
  declare User?: User;
  declare Plan?: Plan;
  declare Coupon?: Coupon;
}
Order.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  orderType: { type: DataTypes.ENUM('SUBSCRIPTION', 'COURSE', 'WEBINAR'), defaultValue: 'SUBSCRIPTION', field: 'order_type' },
  planId: { type: DataTypes.INTEGER, allowNull: true, field: 'plan_id' },
  itemId: { type: DataTypes.INTEGER, allowNull: true, field: 'item_id' },
  couponId: { type: DataTypes.INTEGER, allowNull: true, field: 'coupon_id' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, field: 'discount_amount' },
  finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'final_amount' },
  status: { type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED'), defaultValue: 'PENDING' },
}, { sequelize, tableName: 'orders' });

// ============================================================================
// 11. CouponRedemption Model
// ============================================================================
export class CouponRedemption extends Model {
  declare id: number;
  declare couponId: number;
  declare userId: number;
  declare orderId: number;
  declare discountApplied: number;
  declare redeemedAt: Date;
}
CouponRedemption.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  couponId: { type: DataTypes.INTEGER, allowNull: false, field: 'coupon_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  discountApplied: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'discount_applied' },
  redeemedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'redeemed_at' },
}, { sequelize, tableName: 'coupon_redemptions', timestamps: false });

// ============================================================================
// 12. Payment Model
// ============================================================================
export class Payment extends Model {
  declare id: number;
  declare orderId: number;
  declare paymentGatewayId: string;
  declare gatewayName: string;
  declare amount: number;
  declare status: 'SUCCESS' | 'FAILED';
  declare gatewayResponse: string | null;
}
Payment.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  paymentGatewayId: { type: DataTypes.STRING(100), allowNull: false, field: 'payment_gateway_id' },
  gatewayName: { type: DataTypes.STRING(50), defaultValue: 'RAZORPAY', field: 'gateway_name' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('SUCCESS', 'FAILED'), allowNull: false },
  gatewayResponse: { type: DataTypes.TEXT, allowNull: true, field: 'gateway_response' },
}, { sequelize, tableName: 'payments', updatedAt: false });

// ============================================================================
// 13. Refund Model
// ============================================================================
export class Refund extends Model {
  declare id: number;
  declare paymentId: number;
  declare amount: number;
  declare status: 'PENDING' | 'SUCCESS' | 'FAILED';
  declare reason: string | null;
}
Refund.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  paymentId: { type: DataTypes.INTEGER, allowNull: false, field: 'payment_id' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'), defaultValue: 'PENDING' },
  reason: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, tableName: 'refunds' });

// ============================================================================
// 14. Invoice Model
// ============================================================================
export class Invoice extends Model {
  declare id: number;
  declare userId: number;
  declare orderId: number;
  declare invoiceNumber: string;
  declare amount: number;
}
Invoice.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  invoiceNumber: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'invoice_number' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { sequelize, tableName: 'invoices', updatedAt: false });

// ============================================================================
// 15. Notification Model
// ============================================================================
export class Notification extends Model {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare message: string;
  declare isRead: boolean;
  declare type: string;
}
Notification.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  type: { type: DataTypes.STRING(50), allowNull: false },
}, { sequelize, tableName: 'notifications', updatedAt: false });

// ============================================================================
// 16. AuditLog Model
// ============================================================================
export class AuditLog extends Model {
  declare id: number;
  declare userId: number | null;
  declare action: string;
  declare resource: string;
  declare previousValue: string | null;
  declare newValue: string | null;
  declare ipAddress: string;
  declare timestamp: Date;
}
AuditLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  resource: { type: DataTypes.STRING(100), allowNull: false },
  previousValue: { type: DataTypes.TEXT, allowNull: true, field: 'previous_value' },
  newValue: { type: DataTypes.TEXT, allowNull: true, field: 'new_value' },
  ipAddress: { type: DataTypes.STRING(45), defaultValue: '127.0.0.1', field: 'ip_address' },
}, { sequelize, tableName: 'audit_logs', timestamps: false });

// ============================================================================
// 17. VideoSession Model
// ============================================================================
export class VideoSession extends Model {
  declare id: number;
  declare title: string;
  declare description: string | null;
  declare videoUrl: string;
  declare thumbnailUrl: string | null;
  declare duration: string | null;
  declare category: string;
  declare accessType: 'ALL_MEMBERS' | 'PLAN_MEMBERS';
  declare requiredTier: 'BASIC' | 'PREMIUM' | 'VIP';
  declare allowedPlanIds: number[] | null;
  declare instructor: string;
  declare sessionDate: Date | null;
  declare isPublished: boolean;
  declare viewsCount: number;
  declare resourceUrls: Array<{ title: string; url: string }> | null;
}
VideoSession.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  videoUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'video_url' },
  thumbnailUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'thumbnail_url' },
  duration: { type: DataTypes.STRING(50), allowNull: true },
  category: { type: DataTypes.STRING(100), defaultValue: 'Live Trading' },
  accessType: { type: DataTypes.ENUM('ALL_MEMBERS', 'PLAN_MEMBERS'), defaultValue: 'ALL_MEMBERS', field: 'access_type' },
  requiredTier: { type: DataTypes.ENUM('BASIC', 'PREMIUM', 'VIP'), defaultValue: 'BASIC', field: 'required_tier' },
  allowedPlanIds: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    field: 'allowed_plan_ids',
    get() {
      const rawValue = this.getDataValue('allowedPlanIds');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
    }
  },
  instructor: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash' },
  sessionDate: { type: DataTypes.DATE, allowNull: true, field: 'session_date' },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_published' },
  viewsCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'views_count' },
  resourceUrls: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    field: 'resource_urls',
    get() {
      const rawValue = this.getDataValue('resourceUrls');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
    }
  },
}, { sequelize, tableName: 'video_sessions' });

// ============================================================================
// MODULE A: AI Trading Assistant, Analytics & Journal
// ============================================================================
export class AiConversation extends Model {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare AiMessages?: AiMessage[];
}
AiConversation.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  title: { type: DataTypes.STRING(255), defaultValue: 'New Trading Analysis' },
}, { sequelize, tableName: 'ai_conversations' });

export class AiMessage extends Model {
  declare id: number;
  declare conversationId: number;
  declare sender: 'USER' | 'AI';
  declare message: string;
  declare contextData: any;
  declare createdAt: Date;
}
AiMessage.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false, field: 'conversation_id' },
  sender: { type: DataTypes.ENUM('USER', 'AI'), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  contextData: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    field: 'context_data',
    get() {
      const rawValue = this.getDataValue('contextData');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : null;
    }
  },
}, { sequelize, tableName: 'ai_messages', updatedAt: false });

export class AiUsageLog extends Model {
  declare id: number;
  declare userId: number;
  declare subscriptionId: number | null;
  declare feature: string;
  declare queryCount: number;
  declare tokensUsed: number;
  declare createdAt: Date;
}
AiUsageLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  subscriptionId: { type: DataTypes.INTEGER, allowNull: true, field: 'subscription_id' },
  feature: { type: DataTypes.STRING(50), defaultValue: 'CHAT_ASSISTANT' },
  queryCount: { type: DataTypes.INTEGER, defaultValue: 1, field: 'query_count' },
  tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0, field: 'tokens_used' },
}, { sequelize, tableName: 'ai_usage_logs', updatedAt: false });

export class TradingJournalEntry extends Model {
  declare id: number;
  declare userId: number;
  declare tradeId: number | null;
  declare asset: string;
  declare direction: 'BUY' | 'SELL';
  declare entryPrice: number;
  declare exitPrice: number;
  declare quantity: number;
  declare pnl: number;
  declare pnlPercentage: number;
  declare strategy: string;
  declare emotion: 'DISCIPLINED' | 'GREEDY' | 'FOMO' | 'ANXIOUS' | 'REVENGE' | 'CALM';
  declare mistake: 'NONE' | 'EARLY_EXIT' | 'CHASED_ENTRY' | 'OVER_LEVERAGED' | 'IGNORED_SL' | 'OVER_TRADED' | 'LATE_ENTRY';
  declare notes: string | null;
  declare screenshotUrl: string | null;
  declare entryDate: Date;
  declare exitDate: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}
TradingJournalEntry.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  tradeId: { type: DataTypes.INTEGER, allowNull: true, field: 'trade_id' },
  asset: { type: DataTypes.STRING(50), allowNull: false },
  direction: { type: DataTypes.ENUM('BUY', 'SELL'), allowNull: false },
  entryPrice: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'entry_price' },
  exitPrice: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'exit_price' },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  pnl: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  pnlPercentage: { type: DataTypes.DECIMAL(8, 2), allowNull: false, field: 'pnl_percentage' },
  strategy: { type: DataTypes.STRING(100), defaultValue: 'Breakout' },
  emotion: { type: DataTypes.ENUM('DISCIPLINED', 'GREEDY', 'FOMO', 'ANXIOUS', 'REVENGE', 'CALM'), defaultValue: 'DISCIPLINED' },
  mistake: { type: DataTypes.ENUM('NONE', 'EARLY_EXIT', 'CHASED_ENTRY', 'OVER_LEVERAGED', 'IGNORED_SL', 'OVER_TRADED', 'LATE_ENTRY'), defaultValue: 'NONE' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  screenshotUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'screenshot_url' },
  entryDate: { type: DataTypes.DATE, allowNull: false, field: 'entry_date' },
  exitDate: { type: DataTypes.DATE, allowNull: false, field: 'exit_date' },
}, { sequelize, tableName: 'trading_journal_entries' });

// ============================================================================
// MODULE B: Referral / Affiliate Engine
// ============================================================================
export class ReferralProgram extends Model {
  declare id: number;
  declare name: string;
  declare commissionType: 'PERCENTAGE' | 'FIXED';
  declare defaultCommissionRate: number;
  declare tierRates: any;
  declare minPayoutAmount: number;
  declare holdingPeriodDays: number;
  declare isActive: boolean;
}
ReferralProgram.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash Partner Program' },
  commissionType: { type: DataTypes.ENUM('PERCENTAGE', 'FIXED'), defaultValue: 'PERCENTAGE', field: 'commission_type' },
  defaultCommissionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 15.00, field: 'default_commission_rate' },
  tierRates: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    field: 'tier_rates',
    get() {
      const rawValue = this.getDataValue('tierRates');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : { BASIC: 10, PREMIUM: 15, VIP: 20 };
    }
  },
  minPayoutAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1000.00, field: 'min_payout_amount' },
  holdingPeriodDays: { type: DataTypes.INTEGER, defaultValue: 7, field: 'holding_period_days' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, { sequelize, tableName: 'referral_programs' });

export class Referral extends Model {
  declare id: number;
  declare referrerId: number;
  declare referredUserId: number;
  declare referralCode: string;
  declare status: 'REGISTERED' | 'CONVERTED';
  declare ipAddress: string | null;
  declare deviceFingerprint: string | null;
  declare createdAt: Date;
  declare Referrer?: User;
  declare ReferredUser?: User;
}
Referral.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  referrerId: { type: DataTypes.INTEGER, allowNull: false, field: 'referrer_id' },
  referredUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'referred_user_id' },
  referralCode: { type: DataTypes.STRING(50), allowNull: false, field: 'referral_code' },
  status: { type: DataTypes.ENUM('REGISTERED', 'CONVERTED'), defaultValue: 'REGISTERED' },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true, field: 'ip_address' },
  deviceFingerprint: { type: DataTypes.STRING(255), allowNull: true, field: 'device_fingerprint' },
}, { sequelize, tableName: 'referrals', updatedAt: false });

export class ReferralCommission extends Model {
  declare id: number;
  declare referralId: number;
  declare referrerId: number;
  declare orderId: number;
  declare orderAmount: number;
  declare commissionRate: number;
  declare commissionAmount: number;
  declare status: 'PENDING' | 'APPROVED' | 'PAID' | 'REVERSED' | 'CANCELLED';
  declare holdUntil: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare Order?: Order;
  declare Referrer?: User;
}
ReferralCommission.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  referralId: { type: DataTypes.INTEGER, allowNull: false, field: 'referral_id' },
  referrerId: { type: DataTypes.INTEGER, allowNull: false, field: 'referrer_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  orderAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'order_amount' },
  commissionRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'commission_rate' },
  commissionAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'commission_amount' },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'PAID', 'REVERSED', 'CANCELLED'), defaultValue: 'PENDING' },
  holdUntil: { type: DataTypes.DATE, allowNull: false, field: 'hold_until' },
}, { sequelize, tableName: 'referral_commissions' });

export class ReferralPayout extends Model {
  declare id: number;
  declare referrerId: number;
  declare amount: number;
  declare paymentMethod: 'UPI' | 'BANK_TRANSFER' | 'CRYPTO';
  declare accountDetails: any;
  declare status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID' | 'REJECTED';
  declare transactionRef: string | null;
  declare adminNotes: string | null;
  declare requestedAt: Date;
  declare processedAt: Date | null;
  declare Referrer?: User;
}
ReferralPayout.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  referrerId: { type: DataTypes.INTEGER, allowNull: false, field: 'referrer_id' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('UPI', 'BANK_TRANSFER', 'CRYPTO'), defaultValue: 'UPI', field: 'payment_method' },
  accountDetails: { 
    type: DataTypes.JSON, 
    allowNull: false, 
    field: 'account_details',
    get() {
      const rawValue = this.getDataValue('accountDetails');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : {};
    }
  },
  status: { type: DataTypes.ENUM('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'REJECTED'), defaultValue: 'REQUESTED' },
  transactionRef: { type: DataTypes.STRING(100), allowNull: true, field: 'transaction_ref' },
  adminNotes: { type: DataTypes.TEXT, allowNull: true, field: 'admin_notes' },
  requestedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'requested_at' },
  processedAt: { type: DataTypes.DATE, allowNull: true, field: 'processed_at' },
}, { sequelize, tableName: 'referral_payouts', timestamps: false });

// ============================================================================
// MODULE C: Paid Courses / Marketplace
// ============================================================================
export class CourseCategory extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare icon: string;
  declare orderIndex: number;
  declare isActive: boolean;
}
CourseCategory.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  icon: { type: DataTypes.STRING(50), defaultValue: 'BookOpen' },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0, field: 'order_index' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, { sequelize, tableName: 'course_categories', timestamps: false });

export class Course extends Model {
  declare id: number;
  declare categoryId: number | null;
  declare title: string;
  declare slug: string;
  declare shortDescription: string;
  declare description: string;
  declare thumbnailUrl: string;
  declare instructor: string;
  declare difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  declare durationMinutes: number;
  declare price: number;
  declare discountPrice: number | null;
  declare accessType: 'FREE' | 'PAID' | 'SUBSCRIPTION_ONLY' | 'TIER_RESTRICTED';
  declare requiredTier: 'BASIC' | 'PREMIUM' | 'VIP';
  declare status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  declare CourseCategory?: CourseCategory;
  declare CourseModules?: CourseModule[];
}
Course.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  categoryId: { type: DataTypes.INTEGER, allowNull: true, field: 'category_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  shortDescription: { type: DataTypes.STRING(500), allowNull: false, field: 'short_description' },
  description: { type: DataTypes.TEXT, allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'thumbnail_url' },
  instructor: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash' },
  difficulty: { type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'), defaultValue: 'ALL_LEVELS' },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 120, field: 'duration_minutes' },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  discountPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'discount_price' },
  accessType: { type: DataTypes.ENUM('FREE', 'PAID', 'SUBSCRIPTION_ONLY', 'TIER_RESTRICTED'), defaultValue: 'PAID', field: 'access_type' },
  requiredTier: { type: DataTypes.ENUM('BASIC', 'PREMIUM', 'VIP'), defaultValue: 'BASIC', field: 'required_tier' },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'), defaultValue: 'PUBLISHED' },
}, { sequelize, tableName: 'courses' });

export class CourseModule extends Model {
  declare id: number;
  declare courseId: number;
  declare title: string;
  declare description: string | null;
  declare orderIndex: number;
  declare CourseLessons?: CourseLesson[];
}
CourseModule.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0, field: 'order_index' },
}, { sequelize, tableName: 'course_modules', updatedAt: false });

export class CourseLesson extends Model {
  declare id: number;
  declare moduleId: number;
  declare title: string;
  declare slug: string;
  declare description: string | null;
  declare videoUrl: string;
  declare durationMinutes: number;
  declare isPreview: boolean;
  declare orderIndex: number;
  declare resources: Array<{ title: string; url: string }> | null;
  declare quizData: Array<{ question: string; options: string[]; answerIndex: number }> | null;
}
CourseLesson.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  moduleId: { type: DataTypes.INTEGER, allowNull: false, field: 'module_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  videoUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'video_url' },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 15, field: 'duration_minutes' },
  isPreview: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_preview' },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0, field: 'order_index' },
  resources: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('resources');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
    }
  },
  quizData: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    field: 'quiz_data',
    get() {
      const rawValue = this.getDataValue('quizData');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
    }
  },
}, { sequelize, tableName: 'course_lessons', updatedAt: false });

export class CourseEnrollment extends Model {
  declare id: number;
  declare userId: number;
  declare courseId: number;
  declare orderId: number | null;
  declare enrolledAt: Date;
  declare completedAt: Date | null;
  declare progressPercentage: number;
  declare certificateId: string | null;
  declare Course?: Course;
  declare User?: User;
}
CourseEnrollment.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: true, field: 'order_id' },
  enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'enrolled_at' },
  completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
  progressPercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'progress_percentage' },
  certificateId: { type: DataTypes.STRING(100), allowNull: true, field: 'certificate_id' },
}, { sequelize, tableName: 'course_enrollments', timestamps: false });

export class CourseLessonProgress extends Model {
  declare id: number;
  declare userId: number;
  declare lessonId: number;
  declare isCompleted: boolean;
  declare watchTimeSeconds: number;
  declare completedAt: Date | null;
}
CourseLessonProgress.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  lessonId: { type: DataTypes.INTEGER, allowNull: false, field: 'lesson_id' },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_completed' },
  watchTimeSeconds: { type: DataTypes.INTEGER, defaultValue: 0, field: 'watch_time_seconds' },
  completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
}, { sequelize, tableName: 'course_lesson_progress', timestamps: false });

export class CourseCertificate extends Model {
  declare id: number;
  declare certificateId: string;
  declare userId: number;
  declare courseId: number;
  declare studentName: string;
  declare courseTitle: string;
  declare instructor: string;
  declare issueDate: Date;
}
CourseCertificate.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  certificateId: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'certificate_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
  studentName: { type: DataTypes.STRING(150), allowNull: false, field: 'student_name' },
  courseTitle: { type: DataTypes.STRING(255), allowNull: false, field: 'course_title' },
  instructor: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash' },
  issueDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'issue_date' },
}, { sequelize, tableName: 'course_certificates', updatedAt: false });

// ============================================================================
// MODULE D: Paid Webinars / Live Masterclasses
// ============================================================================
export class Webinar extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare shortDescription: string;
  declare description: string;
  declare speaker: string;
  declare thumbnailUrl: string;
  declare scheduledAt: Date;
  declare endTime: Date;
  declare timezone: string;
  declare price: number;
  declare discountPrice: number | null;
  declare capacity: number;
  declare meetingUrl: string | null;
  declare accessType: 'PUBLIC' | 'PAID' | 'SUBSCRIBER_ONLY' | 'VIP_ONLY';
  declare status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  declare recordingUrl: string | null;
  declare recordingAccessDays: number;
  declare WebinarRegistrations?: WebinarRegistration[];
}
Webinar.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  shortDescription: { type: DataTypes.STRING(500), allowNull: false, field: 'short_description' },
  description: { type: DataTypes.TEXT, allowNull: false },
  speaker: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash' },
  thumbnailUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'thumbnail_url' },
  scheduledAt: { type: DataTypes.DATE, allowNull: false, field: 'scheduled_at' },
  endTime: { type: DataTypes.DATE, allowNull: false, field: 'end_time' },
  timezone: { type: DataTypes.STRING(50), defaultValue: 'IST (UTC+5:30)' },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  discountPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'discount_price' },
  capacity: { type: DataTypes.INTEGER, defaultValue: 250 },
  meetingUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'meeting_url' },
  accessType: { type: DataTypes.ENUM('PUBLIC', 'PAID', 'SUBSCRIBER_ONLY', 'VIP_ONLY'), defaultValue: 'PAID', field: 'access_type' },
  status: { type: DataTypes.ENUM('DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'), defaultValue: 'SCHEDULED' },
  recordingUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'recording_url' },
  recordingAccessDays: { type: DataTypes.INTEGER, defaultValue: 30, field: 'recording_access_days' },
}, { sequelize, tableName: 'webinars' });

export class WebinarRegistration extends Model {
  declare id: number;
  declare webinarId: number;
  declare userId: number;
  declare orderId: number | null;
  declare status: 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
  declare reminderSent: boolean;
  declare registeredAt: Date;
  declare Webinar?: Webinar;
  declare User?: User;
}
WebinarRegistration.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  webinarId: { type: DataTypes.INTEGER, allowNull: false, field: 'webinar_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: true, field: 'order_id' },
  status: { type: DataTypes.ENUM('CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELLED'), defaultValue: 'CONFIRMED' },
  reminderSent: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'reminder_sent' },
  registeredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'registered_at' },
}, { sequelize, tableName: 'webinar_registrations', timestamps: false });

// ============================================================================
// MODULE E: Trading Playbooks
// ============================================================================
export class Playbook extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare category: 'SCALPING' | 'INTRADAY' | 'BREAKOUT' | 'OPTIONS' | 'TREND' | 'REVERSAL' | 'RISK_MANAGEMENT' | 'PSYCHOLOGY' | 'STRATEGY_DEV';
  declare description: string;
  declare marketConditions: string;
  declare setupRules: string;
  declare entryRules: string;
  declare stopLossRules: string;
  declare targetRules: string;
  declare riskRewardRatio: string;
  declare checklist: any;
  declare chartUrl: string | null;
  declare pdfUrl: string | null;
  declare videoUrl: string | null;
  declare tierRequired: 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP' | 'ELITE';
  declare status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  declare viewsCount: number;
  declare likesCount: number;
}
Playbook.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  category: { 
    type: DataTypes.ENUM('SCALPING', 'INTRADAY', 'BREAKOUT', 'OPTIONS', 'TREND', 'REVERSAL', 'RISK_MANAGEMENT', 'PSYCHOLOGY', 'STRATEGY_DEV'), 
    defaultValue: 'SCALPING' 
  },
  description: { type: DataTypes.TEXT, allowNull: false },
  marketConditions: { type: DataTypes.TEXT, allowNull: false, field: 'market_conditions' },
  setupRules: { type: DataTypes.TEXT, allowNull: false, field: 'setup_rules' },
  entryRules: { type: DataTypes.TEXT, allowNull: false, field: 'entry_rules' },
  stopLossRules: { type: DataTypes.TEXT, allowNull: false, field: 'stop_loss_rules' },
  targetRules: { type: DataTypes.TEXT, allowNull: false, field: 'target_rules' },
  riskRewardRatio: { type: DataTypes.STRING(50), defaultValue: '1:2', field: 'risk_reward_ratio' },
  checklist: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const raw = this.getDataValue('checklist');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  chartUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'chart_url' },
  pdfUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'pdf_url' },
  videoUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'video_url' },
  tierRequired: { 
    type: DataTypes.ENUM('FREE', 'BASIC', 'PREMIUM', 'VIP', 'ELITE'), 
    defaultValue: 'BASIC', 
    field: 'tier_required' 
  },
  status: { 
    type: DataTypes.ENUM('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'), 
    defaultValue: 'PUBLISHED' 
  },
  viewsCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'views_count' },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'likes_count' },
}, { sequelize, tableName: 'playbooks' });

// ============================================================================
// MODULE F: Community Feed & Discussions
// ============================================================================
export class CommunityPost extends Model {
  declare id: number;
  declare userId: number;
  declare channel: 'GENERAL' | 'MARKET_DISCUSSION' | 'INTRADAY' | 'SCALPING' | 'OPTIONS' | 'STRATEGY' | 'BEGINNERS' | 'PREMIUM' | 'VIP';
  declare title: string;
  declare content: string;
  declare chartData: any;
  declare imageUrl: string | null;
  declare likesCount: number;
  declare commentsCount: number;
  declare isPinned: boolean;
  declare isLocked: boolean;
  declare status: 'ACTIVE' | 'FLAGGED' | 'REMOVED';
  declare User?: User;
  declare CommunityComments?: CommunityComment[];
}
CommunityPost.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  channel: { 
    type: DataTypes.ENUM('GENERAL', 'MARKET_DISCUSSION', 'INTRADAY', 'SCALPING', 'OPTIONS', 'STRATEGY', 'BEGINNERS', 'PREMIUM', 'VIP'), 
    defaultValue: 'GENERAL' 
  },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  chartData: { type: DataTypes.JSON, allowNull: true, field: 'chart_data' },
  imageUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'image_url' },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'likes_count' },
  commentsCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'comments_count' },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_pinned' },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_locked' },
  status: { type: DataTypes.ENUM('ACTIVE', 'FLAGGED', 'REMOVED'), defaultValue: 'ACTIVE' },
}, { sequelize, tableName: 'community_posts' });

export class CommunityComment extends Model {
  declare id: number;
  declare postId: number;
  declare userId: number;
  declare parentId: number | null;
  declare content: string;
  declare status: 'ACTIVE' | 'FLAGGED' | 'REMOVED';
  declare User?: User;
  declare CommunityPost?: CommunityPost;
}
CommunityComment.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  parentId: { type: DataTypes.INTEGER, allowNull: true, field: 'parent_id' },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('ACTIVE', 'FLAGGED', 'REMOVED'), defaultValue: 'ACTIVE' },
}, { sequelize, tableName: 'community_comments' });

export class CommunityLike extends Model {
  declare id: number;
  declare postId: number;
  declare userId: number;
}
CommunityLike.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
}, { sequelize, tableName: 'community_likes', timestamps: false });

// ============================================================================
// MODULE G: Mentorship & Booking
// ============================================================================
export class Mentor extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare bio: string;
  declare avatarUrl: string;
  declare experienceYears: number;
  declare expertise: any;
  declare tradingStyle: string;
  declare hourlyRate: number;
  declare rating: number;
  declare reviewCount: number;
  declare isActive: boolean;
  declare User?: User;
}
Mentor.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING(150), allowNull: false },
  bio: { type: DataTypes.TEXT, allowNull: false },
  avatarUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'avatar_url' },
  experienceYears: { type: DataTypes.INTEGER, defaultValue: 5, field: 'experience_years' },
  expertise: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const raw = this.getDataValue('expertise');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : ['Options Scalping', 'Price Action'];
    }
  },
  tradingStyle: { type: DataTypes.STRING(100), defaultValue: 'Intraday & Scalping', field: 'trading_style' },
  hourlyRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 2499.00, field: 'hourly_rate' },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 5.00 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'review_count' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, { sequelize, tableName: 'mentors' });

export class MentorBooking extends Model {
  declare id: number;
  declare mentorId: number;
  declare userId: number;
  declare sessionType: '30_MIN' | '60_MIN' | 'GROUP' | 'WEEKLY' | 'MONTHLY';
  declare scheduledAt: Date;
  declare durationMins: number;
  declare amount: number;
  declare status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  declare meetingLink: string | null;
  declare notes: string | null;
  declare reviewRating: number | null;
  declare reviewComment: string | null;
  declare Mentor?: Mentor;
  declare User?: User;
}
MentorBooking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  mentorId: { type: DataTypes.INTEGER, allowNull: false, field: 'mentor_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  sessionType: { 
    type: DataTypes.ENUM('30_MIN', '60_MIN', 'GROUP', 'WEEKLY', 'MONTHLY'), 
    defaultValue: '60_MIN', 
    field: 'session_type' 
  },
  scheduledAt: { type: DataTypes.DATE, allowNull: false, field: 'scheduled_at' },
  durationMins: { type: DataTypes.INTEGER, defaultValue: 60, field: 'duration_mins' },
  amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  status: { 
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'), 
    defaultValue: 'PENDING' 
  },
  meetingLink: { type: DataTypes.STRING(1000), allowNull: true, field: 'meeting_link' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  reviewRating: { type: DataTypes.INTEGER, allowNull: true, field: 'review_rating' },
  reviewComment: { type: DataTypes.TEXT, allowNull: true, field: 'review_comment' },
}, { sequelize, tableName: 'mentor_bookings' });

// ============================================================================
// MODULE H: Strategy Lab & Backtesting Engine
// ============================================================================
export class TradingStrategy extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare description: string;
  declare market: string;
  declare instrument: string;
  declare timeframe: '1M' | '3M' | '5M' | '15M' | '1H' | '1D';
  declare entryRules: any;
  declare filterRules: any;
  declare riskRules: any;
  declare exitRules: any;
  declare status: 'DRAFT' | 'TESTING' | 'VALIDATED' | 'ARCHIVED';
  declare isPublic: boolean;
  declare version: string;
  declare User?: User;
  declare Backtests?: Backtest[];
}
TradingStrategy.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  market: { type: DataTypes.STRING(100), defaultValue: 'NSE' },
  instrument: { type: DataTypes.STRING(100), defaultValue: 'NIFTY' },
  timeframe: { 
    type: DataTypes.ENUM('1M', '3M', '5M', '15M', '1H', '1D'), 
    defaultValue: '5M' 
  },
  entryRules: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'entry_rules',
    get() {
      const raw = this.getDataValue('entryRules');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  filterRules: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'filter_rules',
    get() {
      const raw = this.getDataValue('filterRules');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  riskRules: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'risk_rules',
    get() {
      const raw = this.getDataValue('riskRules');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : { stopLossPercent: 1.0, riskRewardRatio: 2.0 };
    }
  },
  exitRules: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'exit_rules',
    get() {
      const raw = this.getDataValue('exitRules');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  status: { 
    type: DataTypes.ENUM('DRAFT', 'TESTING', 'VALIDATED', 'ARCHIVED'), 
    defaultValue: 'DRAFT' 
  },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_public' },
  version: { type: DataTypes.STRING(20), defaultValue: '1.0.0' },
}, { sequelize, tableName: 'trading_strategies' });

export class Backtest extends Model {
  declare id: number;
  declare strategyId: number;
  declare userId: number;
  declare instrument: string;
  declare timeframe: string;
  declare period: string;
  declare initialCapital: number;
  declare totalTrades: number;
  declare winningTrades: number;
  declare losingTrades: number;
  declare winRate: number;
  declare netPnl: number;
  declare profitFactor: number;
  declare maxDrawdown: number;
  declare sharpeRatio: number;
  declare tradesData: any;
  declare equityCurve: any;
  declare Strategy?: TradingStrategy;
  declare User?: User;
}
Backtest.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  strategyId: { type: DataTypes.INTEGER, allowNull: false, field: 'strategy_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  instrument: { type: DataTypes.STRING(100), allowNull: false },
  timeframe: { type: DataTypes.STRING(50), defaultValue: '5M' },
  period: { type: DataTypes.STRING(100), defaultValue: 'Last 90 Days' },
  initialCapital: { type: DataTypes.DECIMAL(12, 2), defaultValue: 100000.00, field: 'initial_capital' },
  totalTrades: { type: DataTypes.INTEGER, defaultValue: 0, field: 'total_trades' },
  winningTrades: { type: DataTypes.INTEGER, defaultValue: 0, field: 'winning_trades' },
  losingTrades: { type: DataTypes.INTEGER, defaultValue: 0, field: 'losing_trades' },
  winRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'win_rate' },
  netPnl: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00, field: 'net_pnl' },
  profitFactor: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0.00, field: 'profit_factor' },
  maxDrawdown: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'max_drawdown' },
  sharpeRatio: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'sharpe_ratio' },
  tradesData: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'trades_data',
    get() {
      const raw = this.getDataValue('tradesData');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  equityCurve: { 
    type: DataTypes.JSON, 
    allowNull: true,
    field: 'equity_curve',
    get() {
      const raw = this.getDataValue('equityCurve');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
}, { sequelize, tableName: 'backtests' });

// ============================================================================
// MODULE I: Digital Marketplace & Products
// ============================================================================
export class Product extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare type: 'COURSE' | 'EBOOK' | 'PLAYBOOK' | 'TEMPLATE' | 'MENTORSHIP' | 'INDICATOR_TOOL';
  declare price: number;
  declare discountPrice: number | null;
  declare description: string;
  declare features: any;
  declare thumbnailUrl: string;
  declare downloadUrl: string | null;
  declare rating: number;
  declare salesCount: number;
  declare isActive: boolean;
}
Product.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  type: { 
    type: DataTypes.ENUM('COURSE', 'EBOOK', 'PLAYBOOK', 'TEMPLATE', 'MENTORSHIP', 'INDICATOR_TOOL'), 
    defaultValue: 'EBOOK' 
  },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discountPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'discount_price' },
  description: { type: DataTypes.TEXT, allowNull: false },
  features: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const raw = this.getDataValue('features');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  thumbnailUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'thumbnail_url' },
  downloadUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'download_url' },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 5.00 },
  salesCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sales_count' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, { sequelize, tableName: 'products' });

// ============================================================================
// MODULE J: CRM Leads & Sales Pipeline
// ============================================================================
export class CrmLead extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare stage: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'FREE_USER' | 'TRIAL' | 'PAID' | 'PREMIUM' | 'VIP' | 'RENEWAL';
  declare source: string;
  declare notes: string | null;
  declare assignedTo: number | null;
  declare leadValue: number;
  declare lastContactDate: Date | null;
}
CrmLead.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  stage: { 
    type: DataTypes.ENUM('NEW', 'CONTACTED', 'INTERESTED', 'FREE_USER', 'TRIAL', 'PAID', 'PREMIUM', 'VIP', 'RENEWAL'), 
    defaultValue: 'NEW' 
  },
  source: { type: DataTypes.STRING(100), defaultValue: 'ORGANIC' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true, field: 'assigned_to' },
  leadValue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, field: 'lead_value' },
  lastContactDate: { type: DataTypes.DATE, allowNull: true, field: 'last_contact_date' },
}, { sequelize, tableName: 'crm_leads' });

// ============================================================================
// MODULE K: Blog, Knowledge Center & Articles
// ============================================================================
export class BlogPost extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare category: string;
  declare summary: string;
  declare content: string;
  declare author: string;
  declare thumbnailUrl: string;
  declare tags: any;
  declare readTimeMins: number;
  declare status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  declare publishedAt: Date;
}
BlogPost.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(100), defaultValue: 'Trading Education' },
  summary: { type: DataTypes.TEXT, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  author: { type: DataTypes.STRING(100), defaultValue: 'Scalper Akash' },
  thumbnailUrl: { type: DataTypes.STRING(1000), allowNull: false, field: 'thumbnail_url' },
  tags: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const raw = this.getDataValue('tags');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    }
  },
  readTimeMins: { type: DataTypes.INTEGER, defaultValue: 5, field: 'read_time_mins' },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'), defaultValue: 'PUBLISHED' },
  publishedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'published_at' },
}, { sequelize, tableName: 'blog_posts' });

// ============================================================================
// MODULE L: Saved Calculations
// ============================================================================
export class SavedCalculation extends Model {
  declare id: number;
  declare userId: number;
  declare calcType: string;
  declare inputs: any;
  declare results: any;
  declare notes: string | null;
}
SavedCalculation.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  calcType: { type: DataTypes.STRING(50), allowNull: false, field: 'calc_type' },
  inputs: { 
    type: DataTypes.JSON, 
    allowNull: false,
    get() {
      const raw = this.getDataValue('inputs');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    }
  },
  results: { 
    type: DataTypes.JSON, 
    allowNull: false,
    get() {
      const raw = this.getDataValue('results');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    }
  },
  notes: { type: DataTypes.STRING(255), allowNull: true },
}, { sequelize, tableName: 'saved_calculations' });

// ============================================================================
// MODEL ASSOCIATIONS
// ============================================================================

// Users & Roles
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id' });

// Roles & Permissions
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id' });

// Subscriptions
User.hasMany(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(User, { foreignKey: 'user_id' });
Plan.hasMany(Subscription, { foreignKey: 'plan_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_id' });

// Trades
Subscription.belongsToMany(Trade, { through: SubscriptionTrade, foreignKey: 'subscription_id', otherKey: 'trade_id' });
Trade.belongsToMany(Subscription, { through: SubscriptionTrade, foreignKey: 'trade_id', otherKey: 'subscription_id' });
Subscription.hasMany(SubscriptionTrade, { foreignKey: 'subscription_id' });
SubscriptionTrade.belongsTo(Subscription, { foreignKey: 'subscription_id' });
Trade.hasMany(SubscriptionTrade, { foreignKey: 'trade_id' });
SubscriptionTrade.belongsTo(Trade, { foreignKey: 'trade_id' });
Trade.hasMany(TradeUpdate, { foreignKey: 'trade_id' });
TradeUpdate.belongsTo(Trade, { foreignKey: 'trade_id' });

// Orders, Payments, Invoices, Coupons
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });
Plan.hasMany(Order, { foreignKey: 'plan_id' });
Order.belongsTo(Plan, { foreignKey: 'plan_id' });
Coupon.hasMany(Order, { foreignKey: 'coupon_id' });
Order.belongsTo(Coupon, { foreignKey: 'coupon_id' });
Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });
Payment.hasMany(Refund, { foreignKey: 'payment_id' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id' });
User.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(User, { foreignKey: 'user_id' });
Order.hasOne(Invoice, { foreignKey: 'order_id' });
Invoice.belongsTo(Order, { foreignKey: 'order_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// AI Assistant & Journal
User.hasMany(AiConversation, { foreignKey: 'user_id' });
AiConversation.belongsTo(User, { foreignKey: 'user_id' });
AiConversation.hasMany(AiMessage, { foreignKey: 'conversation_id', onDelete: 'CASCADE' });
AiMessage.belongsTo(AiConversation, { foreignKey: 'conversation_id' });
User.hasMany(AiUsageLog, { foreignKey: 'user_id' });
AiUsageLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TradingJournalEntry, { foreignKey: 'user_id' });
TradingJournalEntry.belongsTo(User, { foreignKey: 'user_id' });
Trade.hasMany(TradingJournalEntry, { foreignKey: 'trade_id' });
TradingJournalEntry.belongsTo(Trade, { foreignKey: 'trade_id' });

// Referrals
User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'ReferredClients' });
Referral.belongsTo(User, { foreignKey: 'referrer_id', as: 'Referrer' });
Referral.belongsTo(User, { foreignKey: 'referred_user_id', as: 'ReferredUser' });
User.hasMany(ReferralCommission, { foreignKey: 'referrer_id' });
ReferralCommission.belongsTo(User, { foreignKey: 'referrer_id', as: 'Referrer' });
ReferralCommission.belongsTo(Referral, { foreignKey: 'referral_id' });
ReferralCommission.belongsTo(Order, { foreignKey: 'order_id' });
User.hasMany(ReferralPayout, { foreignKey: 'referrer_id' });
ReferralPayout.belongsTo(User, { foreignKey: 'referrer_id', as: 'Referrer' });

// Courses
CourseCategory.hasMany(Course, { foreignKey: 'category_id' });
Course.belongsTo(CourseCategory, { foreignKey: 'category_id' });
Course.hasMany(CourseModule, { foreignKey: 'course_id', onDelete: 'CASCADE' });
CourseModule.belongsTo(Course, { foreignKey: 'course_id' });
CourseModule.hasMany(CourseLesson, { foreignKey: 'module_id', onDelete: 'CASCADE' });
CourseLesson.belongsTo(CourseModule, { foreignKey: 'module_id' });
User.hasMany(CourseEnrollment, { foreignKey: 'user_id' });
CourseEnrollment.belongsTo(User, { foreignKey: 'user_id' });
Course.hasMany(CourseEnrollment, { foreignKey: 'course_id' });
CourseEnrollment.belongsTo(Course, { foreignKey: 'course_id' });
User.hasMany(CourseLessonProgress, { foreignKey: 'user_id' });
CourseLessonProgress.belongsTo(User, { foreignKey: 'user_id' });
CourseLesson.hasMany(CourseLessonProgress, { foreignKey: 'lesson_id' });
CourseLessonProgress.belongsTo(CourseLesson, { foreignKey: 'lesson_id' });
User.hasMany(CourseCertificate, { foreignKey: 'user_id' });
CourseCertificate.belongsTo(User, { foreignKey: 'user_id' });
Course.hasMany(CourseCertificate, { foreignKey: 'course_id' });
CourseCertificate.belongsTo(Course, { foreignKey: 'course_id' });

// Webinars
User.hasMany(WebinarRegistration, { foreignKey: 'user_id' });
WebinarRegistration.belongsTo(User, { foreignKey: 'user_id' });
Webinar.hasMany(WebinarRegistration, { foreignKey: 'webinar_id', onDelete: 'CASCADE' });
WebinarRegistration.belongsTo(Webinar, { foreignKey: 'webinar_id' });

// Community
User.hasMany(CommunityPost, { foreignKey: 'user_id' });
CommunityPost.belongsTo(User, { foreignKey: 'user_id' });
CommunityPost.hasMany(CommunityComment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
CommunityComment.belongsTo(CommunityPost, { foreignKey: 'post_id' });
User.hasMany(CommunityComment, { foreignKey: 'user_id' });
CommunityComment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(CommunityLike, { foreignKey: 'user_id' });
CommunityLike.belongsTo(User, { foreignKey: 'user_id' });
CommunityPost.hasMany(CommunityLike, { foreignKey: 'post_id', onDelete: 'CASCADE' });
CommunityLike.belongsTo(CommunityPost, { foreignKey: 'post_id' });

// Mentorship
User.hasOne(Mentor, { foreignKey: 'user_id' });
Mentor.belongsTo(User, { foreignKey: 'user_id' });
Mentor.hasMany(MentorBooking, { foreignKey: 'mentor_id' });
MentorBooking.belongsTo(Mentor, { foreignKey: 'mentor_id' });
User.hasMany(MentorBooking, { foreignKey: 'user_id' });
MentorBooking.belongsTo(User, { foreignKey: 'user_id' });

// Strategy Lab & Backtests
User.hasMany(TradingStrategy, { foreignKey: 'user_id' });
TradingStrategy.belongsTo(User, { foreignKey: 'user_id' });
TradingStrategy.hasMany(Backtest, { foreignKey: 'strategy_id', onDelete: 'CASCADE' });
Backtest.belongsTo(TradingStrategy, { foreignKey: 'strategy_id' });
User.hasMany(Backtest, { foreignKey: 'user_id' });
Backtest.belongsTo(User, { foreignKey: 'user_id' });

// Saved Calculations
User.hasMany(SavedCalculation, { foreignKey: 'user_id' });
SavedCalculation.belongsTo(User, { foreignKey: 'user_id' });

// ============================================================================
// Telegram Post Model (Automated Public & Paid Channel Broadcasting)
// ============================================================================
export class TelegramPost extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare audience: 'PUBLIC' | 'PAID_MEMBERS';
  declare targetTier: 'ALL' | 'BASIC' | 'PREMIUM' | 'VIP';
  declare category: string;
  declare mediaUrl: string | null;
  declare buttonText: string | null;
  declare buttonUrl: string | null;
  declare telegramChannelId: string | null;
  declare telegramMessageId: string | null;
  declare status: 'SENT' | 'SIMULATED' | 'FAILED';
  declare responseLog: string | null;
  declare pinMessage: boolean;
  declare authorId: number | null;
  declare sentAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}
TelegramPost.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  audience: { type: DataTypes.ENUM('PUBLIC', 'PAID_MEMBERS'), defaultValue: 'PUBLIC' },
  targetTier: { type: DataTypes.ENUM('ALL', 'BASIC', 'PREMIUM', 'VIP'), defaultValue: 'ALL', field: 'target_tier' },
  category: { type: DataTypes.STRING(50), defaultValue: 'ANNOUNCEMENT' },
  mediaUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'media_url' },
  buttonText: { type: DataTypes.STRING(100), allowNull: true, field: 'button_text' },
  buttonUrl: { type: DataTypes.STRING(1000), allowNull: true, field: 'button_url' },
  telegramChannelId: { type: DataTypes.STRING(100), allowNull: true, field: 'telegram_channel_id' },
  telegramMessageId: { type: DataTypes.STRING(100), allowNull: true, field: 'telegram_message_id' },
  status: { type: DataTypes.ENUM('SENT', 'SIMULATED', 'FAILED'), defaultValue: 'SENT' },
  responseLog: { type: DataTypes.TEXT, allowNull: true, field: 'response_log' },
  pinMessage: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'pin_message' },
  authorId: { type: DataTypes.INTEGER, allowNull: true, field: 'author_id' },
  sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'sent_at' },
}, { sequelize, tableName: 'telegram_posts' });

User.hasMany(TelegramPost, { foreignKey: 'author_id' });
TelegramPost.belongsTo(User, { foreignKey: 'author_id', as: 'Author' });

// ============================================================================
// System Settings Model (Key-Value Dynamic Configuration e.g. Telegram Bot)
// ============================================================================
export class SystemSetting extends Model {
  declare id: number;
  declare key: string;
  declare value: string;
}
SystemSetting.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize, tableName: 'system_settings' });

