CREATE TABLE "accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"account_name" varchar(255),
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "job_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"details" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" varchar(255) NOT NULL,
	"code_verifier" text NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_state_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"organization_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"settings" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posted_news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_url" varchar(1024) NOT NULL,
	"article_title" text NOT NULL,
	"article_source" varchar(255),
	"article_date" varchar(100),
	"news_topic" varchar(100),
	"thread_tweet_ids" text,
	"posted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posted_news_articles_article_url_unique" UNIQUE("article_url")
);
--> statement-breakpoint
CREATE TABLE "tweet_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_tweet_id" varchar(255) NOT NULL,
	"original_tweet_text" text NOT NULL,
	"original_tweet_author" varchar(255) NOT NULL,
	"original_tweet_author_name" varchar(255),
	"original_tweet_likes" integer DEFAULT 0,
	"original_tweet_retweets" integer DEFAULT 0,
	"original_tweet_replies" integer DEFAULT 0,
	"original_tweet_views" integer DEFAULT 0,
	"our_reply_text" text NOT NULL,
	"our_reply_tweet_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"replied_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tweets" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"tweet_id" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"posted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "twitter_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"window_type" varchar(50) NOT NULL,
	"posts_count" integer DEFAULT 0 NOT NULL,
	"reads_count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "twitter_usage_window_type_unique" UNIQUE("window_type")
);
--> statement-breakpoint
CREATE TABLE "user_credentials" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"platform" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"encrypted_value" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp
);
--> statement-breakpoint
CREATE TABLE "wordpress_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"url" varchar(1024),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"topic" varchar(255),
	"featured_image" varchar(1024),
	"categories" text,
	"tags" text,
	"posted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wordpress_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"site_url" varchar(1024) NOT NULL,
	"username" varchar(255) NOT NULL,
	"application_password" text NOT NULL,
	"default_category" varchar(255),
	"default_tags" text,
	"enabled_topics" text,
	"post_frequency" varchar(100),
	"auto_publish" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wordpress_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_runs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workflow_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"trigger_type" varchar(50) NOT NULL,
	"trigger_data" text,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"output" text,
	"error" text,
	"error_step" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"config" text NOT NULL,
	"trigger" text NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_run" timestamp,
	"last_run_status" varchar(50),
	"last_run_error" text,
	"run_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "youtube_comment_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_comment_id" varchar(255) NOT NULL,
	"original_comment_text" text NOT NULL,
	"original_comment_author" varchar(255) NOT NULL,
	"original_comment_likes" integer DEFAULT 0,
	"video_id" varchar(255) NOT NULL,
	"video_title" text,
	"our_reply_text" text NOT NULL,
	"our_reply_comment_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"replied_at" timestamp,
	CONSTRAINT "youtube_comment_replies_original_comment_id_unique" UNIQUE("original_comment_id")
);
--> statement-breakpoint
CREATE TABLE "youtube_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" varchar(255) NOT NULL,
	"video_id" varchar(255) NOT NULL,
	"parent_id" varchar(255),
	"text" text NOT NULL,
	"author_display_name" varchar(255),
	"author_channel_id" varchar(255),
	"reply_text" text,
	"replied_at" timestamp,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_comments_comment_id_unique" UNIQUE("comment_id")
);
--> statement-breakpoint
CREATE TABLE "youtube_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"window_type" varchar(50) NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"videos_count" integer DEFAULT 0 NOT NULL,
	"quota_units" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_usage_window_type_unique" UNIQUE("window_type")
);
--> statement-breakpoint
CREATE TABLE "youtube_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" varchar(255) NOT NULL,
	"title" text,
	"channel_id" varchar(255),
	"channel_title" varchar(255),
	"description" text,
	"published_at" timestamp,
	"last_checked" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_videos_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "accounts_user_provider_idx" ON "accounts" USING btree ("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "app_settings_key_idx" ON "app_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "job_logs_job_name_idx" ON "job_logs" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX "job_logs_status_idx" ON "job_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_logs_created_at_idx" ON "job_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oauth_state_user_id_idx" ON "oauth_state" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_state_created_at_idx" ON "oauth_state" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_members_org_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_org_user_idx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organizations_owner_id_idx" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "posted_news_articles_url_idx" ON "posted_news_articles" USING btree ("article_url");--> statement-breakpoint
CREATE INDEX "posted_news_articles_topic_idx" ON "posted_news_articles" USING btree ("news_topic");--> statement-breakpoint
CREATE INDEX "posted_news_articles_posted_at_idx" ON "posted_news_articles" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "tweet_replies_original_tweet_id_idx" ON "tweet_replies" USING btree ("original_tweet_id");--> statement-breakpoint
CREATE INDEX "tweet_replies_status_idx" ON "tweet_replies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tweet_replies_created_at_idx" ON "tweet_replies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tweet_replies_replied_at_idx" ON "tweet_replies" USING btree ("replied_at");--> statement-breakpoint
CREATE INDEX "tweet_replies_original_tweet_status_idx" ON "tweet_replies" USING btree ("original_tweet_id","status");--> statement-breakpoint
CREATE INDEX "tweets_status_idx" ON "tweets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tweets_created_at_idx" ON "tweets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tweets_status_created_at_idx" ON "tweets" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "twitter_usage_window_type_idx" ON "twitter_usage" USING btree ("window_type");--> statement-breakpoint
CREATE INDEX "twitter_usage_window_start_idx" ON "twitter_usage" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "user_credentials_user_id_idx" ON "user_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_credentials_organization_id_idx" ON "user_credentials" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "user_credentials_platform_idx" ON "user_credentials" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "user_credentials_user_platform_idx" ON "user_credentials" USING btree ("user_id","platform");--> statement-breakpoint
CREATE INDEX "wordpress_posts_user_id_idx" ON "wordpress_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wordpress_posts_status_idx" ON "wordpress_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wordpress_posts_topic_idx" ON "wordpress_posts" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "wordpress_posts_posted_at_idx" ON "wordpress_posts" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "wordpress_posts_post_id_idx" ON "wordpress_posts" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wordpress_settings_user_id_idx" ON "wordpress_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_runs_workflow_id_idx" ON "workflow_runs" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_runs_user_id_idx" ON "workflow_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_runs_organization_id_idx" ON "workflow_runs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflow_runs_status_idx" ON "workflow_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_runs_started_at_idx" ON "workflow_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "workflows_user_id_idx" ON "workflows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflows_organization_id_idx" ON "workflows" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflows_status_idx" ON "workflows" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "youtube_comment_replies_original_comment_id_idx" ON "youtube_comment_replies" USING btree ("original_comment_id");--> statement-breakpoint
CREATE INDEX "youtube_comment_replies_status_idx" ON "youtube_comment_replies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "youtube_comment_replies_created_at_idx" ON "youtube_comment_replies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "youtube_comment_replies_video_id_idx" ON "youtube_comment_replies" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "youtube_comment_replies_video_status_idx" ON "youtube_comment_replies" USING btree ("video_id","status");--> statement-breakpoint
CREATE INDEX "youtube_comments_video_id_idx" ON "youtube_comments" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "youtube_comments_status_idx" ON "youtube_comments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "youtube_comments_video_status_idx" ON "youtube_comments" USING btree ("video_id","status");--> statement-breakpoint
CREATE INDEX "youtube_comments_status_created_idx" ON "youtube_comments" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "youtube_usage_window_type_idx" ON "youtube_usage" USING btree ("window_type");--> statement-breakpoint
CREATE INDEX "youtube_usage_window_start_idx" ON "youtube_usage" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "youtube_videos_channel_id_idx" ON "youtube_videos" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "youtube_videos_last_checked_idx" ON "youtube_videos" USING btree ("last_checked");