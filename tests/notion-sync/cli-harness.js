const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptsDir = path.join(repoRoot, 'productivity/notion-sync/scripts');

function createCliHarness(scriptName, { forbiddenFailureOutput = [] } = {}) {
  const scriptPath = path.join(scriptsDir, scriptName);

  function run(args) {
    return spawnSync(process.execPath, [scriptPath, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        NOTION_API_KEY: 'ntn_dummy_token_for_tests',
      },
    });
  }

  function expectResult(args, expectedSubstring, expectedStatus, forbiddenSubstring) {
    const result = run(args);
    const output = (result.stdout || '') + (result.stderr || '');
    const expectedExit = expectedStatus === 0 ? 'zero' : 'non-zero';

    if (expectedStatus === 0) {
      assert.strictEqual(
        result.status,
        0,
        `Expected ${expectedExit} exit for: ${args.join(' ')}. Got:\n${output}`
      );
    } else {
      assert.notStrictEqual(result.status, 0, `Expected ${expectedExit} exit for: ${args.join(' ')}`);
    }

    assert(
      output.includes(expectedSubstring),
      `Expected output to include "${expectedSubstring}". Got:\n${output}`
    );

    const forbidden = expectedStatus === 0 ? [] : forbiddenFailureOutput;
    for (const text of [...forbidden, forbiddenSubstring].filter(Boolean)) {
      assert(!output.includes(text), `Expected output not to include "${text}". Got:\n${output}`);
    }
  }

  return {
    expectFailure(args, expectedSubstring, forbiddenSubstring = null) {
      expectResult(args, expectedSubstring, 1, forbiddenSubstring);
    },
    expectSuccess(args, expectedSubstring, forbiddenSubstring = null) {
      expectResult(args, expectedSubstring, 0, forbiddenSubstring);
    },
    run,
  };
}

module.exports = { createCliHarness };
