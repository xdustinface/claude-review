import { ClaudeClient } from './claude';

describe('ClaudeClient', () => {
  it('throws without either token', () => {
    expect(() => new ClaudeClient({ model: 'claude-opus-4-6' })).toThrow(
      'Either claude_code_oauth_token or anthropic_api_key must be provided'
    );
  });

  it('accepts oauthToken only', () => {
    const client = new ClaudeClient({ oauthToken: 'test-token', model: 'claude-opus-4-6' });
    expect(client).toBeDefined();
  });

  it('accepts apiKey only', () => {
    const client = new ClaudeClient({ apiKey: 'sk-test-key', model: 'claude-opus-4-6' });
    expect(client).toBeDefined();
  });

  it('accepts both oauthToken and apiKey', () => {
    const client = new ClaudeClient({
      oauthToken: 'test-token',
      apiKey: 'sk-test-key',
      model: 'claude-opus-4-6',
    });
    expect(client).toBeDefined();
  });

  // Spawn behavior (stdin drain handling, timeout, output limits) is tested via
  // integration in the GitHub Action workflow rather than unit tests. Mocking
  // child_process.spawn deeply enough to exercise those paths reliably would
  // couple tests to implementation details without catching real regressions.
});
