import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const eventName = github.context.eventName;
    const action = github.context.payload.action;

    core.info(`Event: ${eventName}, Action: ${action}`);

    switch (eventName) {
      case 'pull_request':
        if (action === 'opened' || action === 'synchronize') {
          core.info('PR opened or updated — running review');
          // TODO: implement in #5/#6
        }
        break;

      case 'issue_comment':
        if (action === 'created' && isClaudeReviewRequest()) {
          core.info('@claude review requested — running review');
          // TODO: implement in #6
        }
        break;

      case 'pull_request_review_comment':
        if (action === 'created') {
          core.info('Review comment created — checking for interaction');
          // TODO: implement in #8
        }
        break;

      default:
        core.info(`Unhandled event: ${eventName}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

function isClaudeReviewRequest(): boolean {
  const comment = github.context.payload.comment;
  if (!comment) return false;

  const body = comment.body?.toLowerCase() ?? '';
  return body.includes('@claude') && body.includes('review');
}

run();
