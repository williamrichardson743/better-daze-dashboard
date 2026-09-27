CREATE TYPE "public"."action_items_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."action_items_section" AS ENUM('immediate', 'short_term', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."action_items_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."admin_settings_cycle_frequency" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."admin_settings_default_view" AS ENUM('grid', 'list');--> statement-breakpoint
CREATE TYPE "public"."admin_settings_notification_frequency" AS ENUM('instant', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."admin_settings_theme" AS ENUM('light', 'dark', 'auto');--> statement-breakpoint
CREATE TYPE "public"."agent_assignments_status" AS ENUM('assigned', 'started', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."agent_messages_type" AS ENUM('status_update', 'question', 'result', 'error', 'broadcast', 'handoff');--> statement-breakpoint
CREATE TYPE "public"."agent_tasks_category" AS ENUM('immediate', 'short_term', 'deferred', '01_content_creation', '02_platform_presence', '03_email_dm_outreach');--> statement-breakpoint
CREATE TYPE "public"."agent_tasks_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."agent_tasks_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."agents_status" AS ENUM('idle', 'busy', 'offline', 'error');--> statement-breakpoint
CREATE TYPE "public"."api_credentials_status" AS ENUM('active', 'expiring', 'expired', 'needs_rotation', 'error', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."campaigns_post_frequency" AS ENUM('hourly', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."campaigns_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."customer_orders_fulfillment_status" AS ENUM('unfulfilled', 'pending', 'fulfilled', 'partial', 'returned');--> statement-breakpoint
CREATE TYPE "public"."customer_orders_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."customer_orders_status" AS ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."cycle_phase" AS ENUM('ideation', 'design', 'review', 'production', 'marketing', 'complete');--> statement-breakpoint
CREATE TYPE "public"."cycles_status" AS ENUM('draft', 'active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."integration_error_class" AS ENUM('transient', 'permanent', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('printify', 'shopify');--> statement-breakpoint
CREATE TYPE "public"."integration_run_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'cancelled', 'needs_attention');--> statement-breakpoint
CREATE TYPE "public"."integration_run_type" AS ENUM('pod_cycle', 'product_publish', 'reconciliation', 'webhook', 'manual');--> statement-breakpoint
CREATE TYPE "public"."integration_step" AS ENUM('upload_image', 'create_printify_product', 'publish_to_shopify', 'verify_shopify_product', 'reconcile', 'complete');--> statement-breakpoint
CREATE TYPE "public"."integration_step_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."login_history_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."orders_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."permissions_action" AS ENUM('create', 'read', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."permissions_resource" AS ENUM('products', 'orders', 'cycles', 'users', 'settings', 'analytics', 'social');--> statement-breakpoint
CREATE TYPE "public"."pipeline_phase_status" AS ENUM('pending', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."pipeline_runs_phase" AS ENUM('trend', 'design', 'printify', 'shopify', 'social', 'log', 'complete');--> statement-breakpoint
CREATE TYPE "public"."pipeline_runs_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."products_status" AS ENUM('draft', 'pending', 'approved', 'live', 'sold_out', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."products_type" AS ENUM('tshirt', 'hoodie', 'mug', 'poster', 'sticker', 'hat', 'tote', 'other');--> statement-breakpoint
CREATE TYPE "public"."provider_resource_type" AS ENUM('product', 'variant', 'image', 'order');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_check" AS ENUM('provider_mapping', 'shopify_product', 'shopify_variants', 'media', 'price', 'shipping', 'storefront_availability', 'checkout_handoff', 'fulfillment_routing');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_check_status" AS ENUM('pending', 'passed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('unverified', 'verified', 'mismatched', 'missing');--> statement-breakpoint
CREATE TYPE "public"."social_accounts_status" AS ENUM('active', 'expired', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'tiktok', 'twitter', 'facebook', 'pinterest', 'youtube', 'other');--> statement-breakpoint
CREATE TYPE "public"."social_posts_status" AS ENUM('scheduled', 'published', 'failed', 'draft');--> statement-breakpoint
CREATE TYPE "public"."social_templates_platform" AS ENUM('instagram', 'tiktok', 'twitter', 'facebook', 'pinterest');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_plan" AS ENUM('starter', 'growth', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_provider" AS ENUM('shopify', 'manual');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_status" AS ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."transmission_logs_type" AS ENUM('info', 'warning', 'error', 'success', 'debug');--> statement-breakpoint
CREATE TYPE "public"."users_role" AS ENUM('user', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."users_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "actionItems" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"section" "action_items_section" DEFAULT 'immediate' NOT NULL,
	"priority" "action_items_priority" DEFAULT 'medium' NOT NULL,
	"status" "action_items_status" DEFAULT 'open' NOT NULL,
	"dueDate" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"tags" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adminSettings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"theme" "admin_settings_theme" DEFAULT 'auto' NOT NULL,
	"emailNotifications" boolean DEFAULT true,
	"inAppNotifications" boolean DEFAULT true,
	"notificationFrequency" "admin_settings_notification_frequency" DEFAULT 'daily' NOT NULL,
	"itemsPerPage" integer DEFAULT 20,
	"defaultView" "admin_settings_default_view" DEFAULT 'grid' NOT NULL,
	"autoPublish" boolean DEFAULT false,
	"cycleFrequency" "admin_settings_cycle_frequency" DEFAULT 'weekly' NOT NULL,
	"companyName" varchar(255) DEFAULT 'Better Daze',
	"logoUrl" varchar(500),
	"primaryColor" varchar(7) DEFAULT '#6366f1',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentAssignments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"agentId" bigint NOT NULL,
	"taskId" bigint NOT NULL,
	"assignedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"startedAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"result" jsonb,
	"status" "agent_assignments_status" DEFAULT 'assigned' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentMessages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"fromAgentId" bigint NOT NULL,
	"toAgentId" bigint,
	"taskId" bigint,
	"messageType" "agent_messages_type" DEFAULT 'status_update' NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentTasks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"assignedAgentId" bigint,
	"createdBy" bigint NOT NULL,
	"status" "agent_tasks_status" DEFAULT 'pending' NOT NULL,
	"priority" "agent_tasks_priority" DEFAULT 'medium' NOT NULL,
	"dueDate" timestamp with time zone,
	"category" "agent_tasks_category" DEFAULT 'short_term' NOT NULL,
	"requiresApproval" boolean DEFAULT false,
	"approvedBy" bigint,
	"approvedAt" timestamp with time zone,
	"result" jsonb,
	"errorMessage" text,
	"metadata" jsonb,
	"contextStack" jsonb,
	"outputData" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"status" "agents_status" DEFAULT 'idle' NOT NULL,
	"lastActive" timestamp with time zone,
	"capabilities" jsonb,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apiCredentials" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"serviceName" varchar(255) NOT NULL,
	"displayName" varchar(255) NOT NULL,
	"status" "api_credentials_status" DEFAULT 'unknown' NOT NULL,
	"lastVerifiedAt" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"scope" text,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apiKeys" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"keyHash" varchar(255) NOT NULL,
	"permissions" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastUsed" timestamp with time zone,
	"expiresAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint,
	"action" varchar(100) NOT NULL,
	"resource" varchar(50) NOT NULL,
	"details" jsonb,
	"ipAddress" varchar(45),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cycleId" bigint,
	"status" "campaigns_status" DEFAULT 'draft' NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"platforms" jsonb,
	"autoPublishProducts" boolean DEFAULT false,
	"autoGenerateSocial" boolean DEFAULT false,
	"postFrequency" "campaigns_post_frequency" DEFAULT 'daily',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"imageUrl" varchar(500),
	"isActive" boolean DEFAULT true,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customerOrders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"email" varchar(320) NOT NULL,
	"customerName" varchar(255),
	"phone" varchar(30),
	"status" "customer_orders_status" DEFAULT 'pending' NOT NULL,
	"fulfillmentStatus" "customer_orders_fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
	"paymentStatus" "customer_orders_payment_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping" numeric(10, 2) DEFAULT '0.00',
	"tax" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"shippingAddress" jsonb,
	"billingAddress" jsonb,
	"paymentReference" varchar(255),
	"trackingNumber" varchar(100),
	"trackingUrl" varchar(500),
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customerOrders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"cycleNumber" integer NOT NULL,
	"name" varchar(255),
	"status" "cycles_status" DEFAULT 'draft' NOT NULL,
	"currentPhase" "cycle_phase" DEFAULT 'ideation' NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"targetRevenue" numeric(10, 2),
	"actualRevenue" numeric(10, 2) DEFAULT '0.00',
	"slogan" varchar(500),
	"theme" varchar(100),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrationRuns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"idempotencyKey" varchar(191) NOT NULL,
	"runType" "integration_run_type" NOT NULL,
	"status" "integration_run_status" DEFAULT 'pending' NOT NULL,
	"cycleId" bigint,
	"productId" bigint,
	"pipelineRunId" bigint,
	"attemptCount" integer DEFAULT 0 NOT NULL,
	"maxAttempts" integer DEFAULT 3 NOT NULL,
	"lockedAt" timestamp with time zone,
	"lockedBy" varchar(191),
	"startedAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"nextRetryAt" timestamp with time zone,
	"errorClass" "integration_error_class",
	"lastErrorCode" varchar(100),
	"lastErrorMessage" text,
	"reconciliationStatus" "reconciliation_status" DEFAULT 'unverified' NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrationSteps" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"runId" bigint NOT NULL,
	"step" "integration_step" NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"status" "integration_step_status" DEFAULT 'pending' NOT NULL,
	"provider" "integration_provider",
	"providerRequestRef" varchar(191),
	"providerResponseRef" varchar(191),
	"httpStatus" integer,
	"errorClass" "integration_error_class",
	"errorCode" varchar(100),
	"errorMessage" text,
	"retryable" boolean DEFAULT false NOT NULL,
	"startedAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"correlationId" varchar(191),
	"payload" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loginHistory" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"status" "login_history_status" NOT NULL,
	"failureReason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"orderId" bigint NOT NULL,
	"productId" bigint NOT NULL,
	"variantId" bigint,
	"productName" varchar(255) NOT NULL,
	"variantName" varchar(100),
	"sku" varchar(100),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"imageUrl" varchar(500),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"shopifyOrderId" varchar(100),
	"customerName" varchar(255),
	"customerEmail" varchar(320),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalRevenue" numeric(10, 2) NOT NULL,
	"status" "orders_status" DEFAULT 'pending' NOT NULL,
	"shippingAddress" jsonb,
	"trackingNumber" varchar(100),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"roleId" bigint NOT NULL,
	"resource" "permissions_resource" NOT NULL,
	"action" "permissions_action" NOT NULL,
	"granted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pipelineRuns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cycleId" bigint,
	"name" varchar(255) NOT NULL,
	"status" "pipeline_runs_status" DEFAULT 'pending' NOT NULL,
	"currentPhase" "pipeline_runs_phase" DEFAULT 'trend' NOT NULL,
	"trendPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"designPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"printifyPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"shopifyPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"socialPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"logPhaseStatus" "pipeline_phase_status" DEFAULT 'pending',
	"startedAt" timestamp with time zone DEFAULT now(),
	"completedAt" timestamp with time zone,
	"duration" integer,
	"result" jsonb,
	"errorMessage" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productCollections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"collectionId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productImages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"variantId" bigint,
	"url" varchar(500) NOT NULL,
	"alt" varchar(255),
	"isPrimary" boolean DEFAULT false,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productVariants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"sku" varchar(100),
	"size" varchar(20),
	"color" varchar(50),
	"colorHex" varchar(7),
	"price" numeric(10, 2) NOT NULL,
	"inventory" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cycleId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100),
	"description" text,
	"slogan" varchar(500),
	"designUrl" varchar(500),
	"mockupUrl" varchar(500),
	"productType" "products_type" DEFAULT 'tshirt' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2),
	"status" "products_status" DEFAULT 'draft' NOT NULL,
	"inventory" integer DEFAULT 0,
	"salesCount" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providerMappings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"resourceType" "provider_resource_type" NOT NULL,
	"providerResourceId" varchar(191) NOT NULL,
	"productId" bigint,
	"variantId" bigint,
	"runId" bigint,
	"reconciliationStatus" "reconciliation_status" DEFAULT 'unverified' NOT NULL,
	"lastVerifiedAt" timestamp with time zone,
	"details" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliationChecks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"runId" bigint,
	"check" "reconciliation_check" NOT NULL,
	"status" "reconciliation_check_status" DEFAULT 'pending' NOT NULL,
	"detail" jsonb,
	"failureReason" text,
	"checkedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"isCustom" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"userAgent" varchar(500),
	"ipAddress" varchar(45),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastActivity" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socialAccounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"platform" "social_platform" NOT NULL,
	"accountHandle" varchar(255),
	"accountId" varchar(255),
	"accessToken" text,
	"refreshToken" text,
	"followerCount" integer DEFAULT 0,
	"status" "social_accounts_status" DEFAULT 'active' NOT NULL,
	"lastSyncAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socialPosts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cycleId" bigint NOT NULL,
	"accountId" bigint NOT NULL,
	"platform" "social_platform" NOT NULL,
	"postId" varchar(255),
	"content" text,
	"mediaUrls" jsonb,
	"status" "social_posts_status" DEFAULT 'draft' NOT NULL,
	"scheduledAt" timestamp with time zone,
	"publishedAt" timestamp with time zone,
	"metrics" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socialTemplates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"platform" "social_templates_platform" NOT NULL,
	"captionTemplate" text,
	"hashtagSet" jsonb,
	"imagePrompt" text,
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"billingProvider" "subscriptions_provider" DEFAULT 'shopify' NOT NULL,
	"billingCustomerRef" varchar(255),
	"billingSubscriptionRef" varchar(255),
	"billingPlanRef" varchar(255),
	"plan" "subscriptions_plan" DEFAULT 'starter' NOT NULL,
	"status" "subscriptions_status" DEFAULT 'active' NOT NULL,
	"currentPeriodStart" timestamp with time zone,
	"currentPeriodEnd" timestamp with time zone,
	"cancelAtPeriodEnd" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "transmissionLogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cycleId" bigint NOT NULL,
	"message" text NOT NULL,
	"logType" "transmission_logs_type" DEFAULT 'info' NOT NULL,
	"phase" "cycle_phase" DEFAULT 'ideation' NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"unionId" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"avatar" text,
	"role" "users_role" DEFAULT 'user' NOT NULL,
	"status" "users_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
CREATE TABLE "waitlistSignups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"source" varchar(100),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlistSignups_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "actionItems" ADD CONSTRAINT "actionItems_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adminSettings" ADD CONSTRAINT "adminSettings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentAssignments" ADD CONSTRAINT "agentAssignments_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentAssignments" ADD CONSTRAINT "agentAssignments_taskId_agentTasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."agentTasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentMessages" ADD CONSTRAINT "agentMessages_fromAgentId_agents_id_fk" FOREIGN KEY ("fromAgentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentMessages" ADD CONSTRAINT "agentMessages_toAgentId_agents_id_fk" FOREIGN KEY ("toAgentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentMessages" ADD CONSTRAINT "agentMessages_taskId_agentTasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."agentTasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentTasks" ADD CONSTRAINT "agentTasks_assignedAgentId_agents_id_fk" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentTasks" ADD CONSTRAINT "agentTasks_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentTasks" ADD CONSTRAINT "agentTasks_approvedBy_users_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apiCredentials" ADD CONSTRAINT "apiCredentials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apiKeys" ADD CONSTRAINT "apiKeys_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditLogs" ADD CONSTRAINT "auditLogs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationRuns" ADD CONSTRAINT "integrationRuns_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationRuns" ADD CONSTRAINT "integrationRuns_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationRuns" ADD CONSTRAINT "integrationRuns_pipelineRunId_pipelineRuns_id_fk" FOREIGN KEY ("pipelineRunId") REFERENCES "public"."pipelineRuns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationSteps" ADD CONSTRAINT "integrationSteps_runId_integrationRuns_id_fk" FOREIGN KEY ("runId") REFERENCES "public"."integrationRuns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loginHistory" ADD CONSTRAINT "loginHistory_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_orderId_customerOrders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."customerOrders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_variantId_productVariants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."productVariants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipelineRuns" ADD CONSTRAINT "pipelineRuns_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCollections" ADD CONSTRAINT "productCollections_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCollections" ADD CONSTRAINT "productCollections_collectionId_collections_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productImages" ADD CONSTRAINT "productImages_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productImages" ADD CONSTRAINT "productImages_variantId_productVariants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."productVariants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providerMappings" ADD CONSTRAINT "providerMappings_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providerMappings" ADD CONSTRAINT "providerMappings_variantId_productVariants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providerMappings" ADD CONSTRAINT "providerMappings_runId_integrationRuns_id_fk" FOREIGN KEY ("runId") REFERENCES "public"."integrationRuns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliationChecks" ADD CONSTRAINT "reconciliationChecks_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliationChecks" ADD CONSTRAINT "reconciliationChecks_runId_integrationRuns_id_fk" FOREIGN KEY ("runId") REFERENCES "public"."integrationRuns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialAccounts" ADD CONSTRAINT "socialAccounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialPosts" ADD CONSTRAINT "socialPosts_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialPosts" ADD CONSTRAINT "socialPosts_accountId_socialAccounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."socialAccounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialTemplates" ADD CONSTRAINT "socialTemplates_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transmissionLogs" ADD CONSTRAINT "transmissionLogs_cycleId_cycles_id_fk" FOREIGN KEY ("cycleId") REFERENCES "public"."cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actionItems_userId_idx" ON "actionItems" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "actionItems_status_idx" ON "actionItems" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "adminSettings_userId_key" ON "adminSettings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "agentAssignments_agentId_idx" ON "agentAssignments" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "agentAssignments_taskId_idx" ON "agentAssignments" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "agentMessages_fromAgentId_idx" ON "agentMessages" USING btree ("fromAgentId");--> statement-breakpoint
CREATE INDEX "agentMessages_taskId_idx" ON "agentMessages" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "agentTasks_createdBy_idx" ON "agentTasks" USING btree ("createdBy");--> statement-breakpoint
CREATE INDEX "agentTasks_assignedAgentId_idx" ON "agentTasks" USING btree ("assignedAgentId");--> statement-breakpoint
CREATE INDEX "agentTasks_status_idx" ON "agentTasks" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "apiCredentials_userId_serviceName_key" ON "apiCredentials" USING btree ("userId","serviceName");--> statement-breakpoint
CREATE INDEX "apiKeys_userId_idx" ON "apiKeys" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "apiKeys_keyHash_key" ON "apiKeys" USING btree ("keyHash");--> statement-breakpoint
CREATE INDEX "auditLogs_userId_idx" ON "auditLogs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "auditLogs_timestamp_idx" ON "auditLogs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "campaigns_userId_idx" ON "campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "campaigns_cycleId_idx" ON "campaigns" USING btree ("cycleId");--> statement-breakpoint
CREATE INDEX "customerOrders_email_idx" ON "customerOrders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customerOrders_status_idx" ON "customerOrders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customerOrders_createdAt_idx" ON "customerOrders" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "cycles_userId_idx" ON "cycles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "cycles_status_idx" ON "cycles" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cycles_userId_cycleNumber_key" ON "cycles" USING btree ("userId","cycleNumber");--> statement-breakpoint
CREATE UNIQUE INDEX "integrationRuns_idempotencyKey_key" ON "integrationRuns" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE INDEX "integrationRuns_status_idx" ON "integrationRuns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "integrationRuns_productId_idx" ON "integrationRuns" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "integrationRuns_nextRetryAt_idx" ON "integrationRuns" USING btree ("nextRetryAt");--> statement-breakpoint
CREATE UNIQUE INDEX "integrationSteps_runId_step_attempt_key" ON "integrationSteps" USING btree ("runId","step","attempt");--> statement-breakpoint
CREATE INDEX "integrationSteps_runId_idx" ON "integrationSteps" USING btree ("runId");--> statement-breakpoint
CREATE INDEX "integrationSteps_status_idx" ON "integrationSteps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "integrationSteps_correlationId_idx" ON "integrationSteps" USING btree ("correlationId");--> statement-breakpoint
CREATE INDEX "loginHistory_userId_idx" ON "loginHistory" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "loginHistory_timestamp_idx" ON "loginHistory" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "orderItems_orderId_idx" ON "orderItems" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "orderItems_productId_idx" ON "orderItems" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "orders_productId_idx" ON "orders" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "orders_createdAt_idx" ON "orders" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_shopifyOrderId_key" ON "orders" USING btree ("shopifyOrderId");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_roleId_resource_action_key" ON "permissions" USING btree ("roleId","resource","action");--> statement-breakpoint
CREATE INDEX "pipelineRuns_cycleId_idx" ON "pipelineRuns" USING btree ("cycleId");--> statement-breakpoint
CREATE INDEX "pipelineRuns_status_idx" ON "pipelineRuns" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "productCollections_productId_collectionId_key" ON "productCollections" USING btree ("productId","collectionId");--> statement-breakpoint
CREATE INDEX "productCollections_collectionId_idx" ON "productCollections" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "productImages_productId_idx" ON "productImages" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "productImages_variantId_idx" ON "productImages" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "productVariants_productId_idx" ON "productVariants" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "productVariants_sku_key" ON "productVariants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "products_cycleId_idx" ON "products" USING btree ("cycleId");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_key" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "providerMappings_provider_resource_key" ON "providerMappings" USING btree ("provider","resourceType","providerResourceId");--> statement-breakpoint
CREATE INDEX "providerMappings_productId_idx" ON "providerMappings" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "providerMappings_variantId_idx" ON "providerMappings" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "providerMappings_reconciliationStatus_idx" ON "providerMappings" USING btree ("reconciliationStatus");--> statement-breakpoint
CREATE UNIQUE INDEX "reconciliationChecks_productId_check_key" ON "reconciliationChecks" USING btree ("productId","check");--> statement-breakpoint
CREATE INDEX "reconciliationChecks_status_idx" ON "reconciliationChecks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "socialAccounts_userId_idx" ON "socialAccounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "socialPosts_cycleId_idx" ON "socialPosts" USING btree ("cycleId");--> statement-breakpoint
CREATE INDEX "socialPosts_accountId_idx" ON "socialPosts" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "socialPosts_status_idx" ON "socialPosts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "socialTemplates_userId_idx" ON "socialTemplates" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "transmissionLogs_cycleId_idx" ON "transmissionLogs" USING btree ("cycleId");--> statement-breakpoint
CREATE INDEX "transmissionLogs_createdAt_idx" ON "transmissionLogs" USING btree ("createdAt");