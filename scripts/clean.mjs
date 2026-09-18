import {rm} from 'node:fs/promises';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/clean.mjs [--all]');
  console.log('Removes node_modules, dist, and test-results. --all also removes .media-staging.');
  process.exit(0);
}

const unknownArgs = args.filter((arg) => arg !== '--all');
if (unknownArgs.length > 0) {
  console.error(`Unknown option: ${unknownArgs.join(', ')}`);
  process.exit(1);
}

const cleanAll = args.includes('--all');
const targets = ['node_modules', 'dist', 'test-results'];

if (cleanAll) {
  targets.push('.media-staging');
}

await Promise.all(
  targets.map(async (target) => {
    await rm(target, {force: true, recursive: true, maxRetries: 3, retryDelay: 200});
    console.log(`Removed ${target}`);
  }),
);

if (!cleanAll) {
  console.log('Preserved .media-staging. Use `npm run clean:all` to remove it.');
}
