#!/usr/bin/env node

/**
 * IQBase Verification Script
 * 
 * Checks if the installation is complete and working correctly.
 * Run with: node scripts/verify.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(success) {
  return success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
}

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(description, test, required = true) {
  const success = test();
  const icon = success ? checkMark(true) : checkMark(false);
  const type = required ? 'required' : 'optional';
  
  log(`${icon} [${type}] ${description}`, success ? 'reset' : (required ? 'red' : 'yellow'));
  
  if (success) {
    checks.passed++;
  } else if (required) {
    checks.failed++;
  } else {
    checks.warnings++;
  }
  
  return success;
}

async function verifyInstallation() {
  log('\n');
  log('  IQBase Installation Verification', 'bright');
  log('  ' + '='.repeat(50), 'cyan');
  log('\n');
  
  // Check Node.js version
  check('Node.js 18+ installed', () => {
    try {
      const version = execSync('node --version', { encoding: 'utf8' }).trim();
      const major = parseInt(version.slice(1).split('.')[0]);
      return major >= 18;
    } catch {
      return false;
    }
  });
  
  // Check npm
  check('npm installed', () => {
    try {
      execSync('npm --version', { encoding: 'utf8' });
      return true;
    } catch {
      return false;
    }
  });
  
  // Check Git
  check('Git installed', () => {
    try {
      execSync('git --version', { encoding: 'utf8' });
      return true;
    } catch {
      return false;
    }
  }, false);
  
  log('\n' + '-'.repeat(50), 'cyan');
  log('Project Structure', 'bright');
  log('-'.repeat(50), 'cyan');
  
  // Check project structure
  check('package.json exists', () => fs.existsSync('package.json'));
  check('next.config.js exists', () => fs.existsSync('next.config.js'));
  check('tsconfig.json exists', () => fs.existsSync('tsconfig.json'));
  check('tailwind.config.js exists', () => fs.existsSync('tailwind.config.js'));
  check('src/ directory exists', () => fs.existsSync('src'));
  check('prisma/ directory exists', () => fs.existsSync('prisma'));
  check('prisma/schema.prisma exists', () => fs.existsSync('prisma/schema.prisma'));
  
  log('\n' + '-'.repeat(50), 'cyan');
  log('Dependencies', 'bright');
  log('-'.repeat(50), 'cyan');
  
  // Check node_modules
  check('node_modules installed', () => fs.existsSync('node_modules'));
  
  // Check key packages
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  check('Next.js installed', () => 'next' in deps);
  check('React installed', () => 'react' in deps);
  check('TypeScript installed', () => 'typescript' in deps);
  check('Prisma installed', () => 'prisma' in deps);
  check('Stripe SDK installed', () => 'stripe' in deps);
  check('pdf-lib installed', () => 'pdf-lib' in deps);
  check('Framer Motion installed', () => 'framer-motion' in deps);
  
  log('\n' + '-'.repeat(50), 'cyan');
  log('Environment Configuration', 'bright');
  log('-'.repeat(50), 'cyan');
  
  // Check .env.local
  const envExists = fs.existsSync('.env.local');
  check('.env.local exists', () => envExists);
  
  if (envExists) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    
    check('DATABASE_URL configured', () => envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=""'));
    check('STRIPE_SECRET_KEY configured', () => envContent.includes('STRIPE_SECRET_KEY=') && !envContent.includes('STRIPE_SECRET_KEY=""'));
    check('STRIPE_PUBLISHABLE_KEY configured', () => envContent.includes('STRIPE_PUBLISHABLE_KEY=') && !envContent.includes('STRIPE_PUBLISHABLE_KEY=""'));
    check('NEXT_PUBLIC_APP_URL configured', () => envContent.includes('NEXT_PUBLIC_APP_URL='), false);
    check('STRIPE_PRICE_BASIC configured', () => envContent.includes('STRIPE_PRICE_BASIC='), false);
    check('STRIPE_PRICE_PREMIUM configured', () => envContent.includes('STRIPE_PRICE_PREMIUM='), false);
  }
  
  log('\n' + '-'.repeat(50), 'cyan');
  log('Database', 'bright');
  log('-'.repeat(50), 'cyan');
  
  // Check Prisma client
  check('Prisma client generated', () => {
    return fs.existsSync('node_modules/.prisma/client') || 
           fs.existsSync('node_modules/@prisma/client');
  });
  
  // Try to connect to database
  check('Database connection (requires valid DATABASE_URL)', () => {
    try {
      execSync('npx prisma db pull --print > /dev/null 2>&1', { 
        encoding: 'utf8',
        timeout: 10000
      });
      return true;
    } catch {
      return false;
    }
  }, false);
  
  log('\n' + '-'.repeat(50), 'cyan');
  log('Build Status', 'bright');
  log('-'.repeat(50), 'cyan');
  
  // Check if build is possible
  check('Can build project (may take a moment)', () => {
    try {
      log('    Attempting build...', 'blue');
      execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 120000,
        stdio: 'pipe'
      });
      return true;
    } catch {
      return false;
    }
  }, false);
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Summary', 'bright');
  log('='.repeat(50), 'cyan');
  
  log(`\n${checkMark(true)} Passed: ${checks.passed}`, 'green');
  
  if (checks.failed > 0) {
    log(`${checkMark(false)} Failed: ${checks.failed}`, 'red');
  }
  
  if (checks.warnings > 0) {
    log(`⚠ Warnings: ${checks.warnings}`, 'yellow');
  }
  
  log('\n');
  
  if (checks.failed === 0) {
    log('✓ Installation looks good!', 'green');
    log('\nTo start the development server:', 'cyan');
    log('  npm run dev', 'yellow');
    log('\nThen open http://localhost:3000', 'cyan');
  } else {
    log('✗ Some checks failed. Please review the errors above.', 'red');
    log('\nFor help, see:', 'cyan');
    log('  - INSTALLATION_GUIDE.md', 'yellow');
    log('  - README.md', 'yellow');
  }
  
  log('\n');
  
  process.exit(checks.failed > 0 ? 1 : 0);
}

verifyInstallation().catch(error => {
  log(`\n✗ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
