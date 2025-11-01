/**
 * Analyze workflow configuration to extract required credentials
 */

export interface RequiredCredential {
  platform: string;
  type: 'oauth' | 'api_key';
  variable: string; // e.g., "user.twitter", "user.openai"
}

/**
 * Extract all credential references from workflow config
 */
export function analyzeWorkflowCredentials(config: {
  steps: Array<{
    id: string;
    module?: string;
    inputs?: Record<string, unknown>;
    type?: string;
    then?: unknown[];
    else?: unknown[];
    steps?: unknown[];
  }>;
}): RequiredCredential[] {
  const credentials = new Set<string>();

  function extractFromValue(value: unknown) {
    if (typeof value === 'string') {
      // Match {{user.platform}} patterns
      const matches = value.matchAll(/\{\{user\.([a-zA-Z0-9_-]+)\}\}/g);
      for (const match of matches) {
        credentials.add(match[1]);
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(extractFromValue);
    }
  }

  function processSteps(steps: unknown[]) {
    for (const step of steps) {
      if (!step || typeof step !== 'object') continue;

      const s = step as Record<string, unknown>;

      // Check inputs
      if (s.inputs) {
        extractFromValue(s.inputs);
      }

      // Recursively check nested steps (conditions, loops)
      if (s.then) {
        processSteps(s.then as unknown[]);
      }
      if (s.else) {
        processSteps(s.else as unknown[]);
      }
      if (s.steps) {
        processSteps(s.steps as unknown[]);
      }
    }
  }

  processSteps(config.steps);

  // Map platform names to credential types
  const oauthPlatforms = ['twitter', 'youtube', 'instagram', 'discord', 'telegram', 'github'];

  return Array.from(credentials).map((platform) => ({
    platform,
    type: oauthPlatforms.includes(platform) ? 'oauth' : 'api_key',
    variable: `user.${platform}`,
  }));
}

/**
 * Get user-friendly platform names
 */
export function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    twitter: 'Twitter',
    youtube: 'YouTube',
    instagram: 'Instagram',
    discord: 'Discord',
    telegram: 'Telegram',
    github: 'GitHub',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    rapidapi: 'RapidAPI',
    stripe: 'Stripe',
    airtable: 'Airtable',
    sendgrid: 'SendGrid',
    slack: 'Slack',
  };

  return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Get platform icon name (for lucide-react icons)
 */
export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: 'Twitter',
    youtube: 'Youtube',
    instagram: 'Instagram',
    discord: 'MessageSquare',
    telegram: 'Send',
    github: 'Github',
    openai: 'Sparkles',
    anthropic: 'Zap',
    rapidapi: 'Code',
    stripe: 'CreditCard',
    airtable: 'Database',
    sendgrid: 'Mail',
    slack: 'MessageCircle',
  };

  return icons[platform] || 'Key';
}
