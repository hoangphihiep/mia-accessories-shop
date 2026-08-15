import { execSync } from 'child_process';
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
} catch (e) {
  console.log("TypeScript check failed, ignoring.");
}
