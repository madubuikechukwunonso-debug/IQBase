#!/usr/bin/env node

/**
 * IQBase Setup Script
 * 
 * This script helps automate the initial setup process.
 * Run with: node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

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

function logSection(title) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
  console.log('');
}

async function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  const checks = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '9.0.0' },
    { name: 'Git', command: 'git --version', minVersion: '2.0.0' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const version = execSync(check.command, { encoding: 'utf8' }).trim();
      log(`✓ ${check.name}: ${version}`, 'green');
    } catch (error) {
      log(`✗ ${check.name}: Not found`, 'red');
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    log('\nPlease install missing prerequisites:', 'yellow');
    log('- Node.js: https://nodejs.org/', 'cyan');
    log('- Git: https://git-scm.com/', 'cyan');
    process.exit(1);
  }
}

async function installDependencies() {
  logSection('Installing Dependencies');
  
  try {
    log('Running npm install...', 'blue');
    execSync('npm install', { stdio: 'inherit' });
    log('\n✓ Dependencies installed successfully', 'green');
  } catch (error) {
    log('\n✗ Failed to install dependencies', 'red');
    throw error;
  }
}

async function setupEnvironment() {
  logSection('Environment Configuration');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Skipping environment setup', 'yellow');
      return;
    }
  }
  
  log('Setting up environment variables...', 'blue');
  
  // Database
  log('\n--- Database Configuration ---', 'cyan');
  log('You need a PostgreSQL database. Options:', 'yellow');
  log('1. Local PostgreSQL', 'cyan');
  log('2. Vercel Postgres', 'cyan');
  log('3. Supabase', 'cyan');
  log('4. Railway', 'cyan');
  
  const dbChoice = await question('\nWhich option? (1-4): ');
  
  let databaseUrl = '';
  
  switch (dbChoice) {
    case '1':
      log('\nLocal PostgreSQL setup:', 'yellow');
      const localUser = await question('Database username (default: postgres): ') || 'postgres';
      const localPass = await question('Database password: ');
      const localDb = await question('Database name (default: iqbase): ') || 'iqbase';
      databaseUrl = `postgresql://${localUser}:${localPass}@localhost:5432/${localDb}`;
      break;
      
    case '2':
    case '3':
    case '4':
      log('\nPlease get your connection string from your provider.', 'yellow');
      databaseUrl = await question('Paste your DATABASE_URL: ');
      break;
      
    default:
      log('Invalid choice. Using placeholder.', 'yellow');
      databaseUrl = 'postgresql://USER:PASSWORD@HOST:5432/iqbase';
  }
  
  // Stripe
  log('\n--- Stripe Configuration ---', 'cyan');
  log('Get your API keys from https://dashboard.stripe.com/apikeys', 'yellow');
  
  const stripeSecret = await question('Stripe Secret Key (sk_test_...): ');
  const stripePublishable = await question('Stripe Publishable Key (pk_test_...): ');
  
  log('\nCreate products in Stripe Dashboard and get price IDs:', 'yellow');
  const priceBasic = await question('Basic Access Price ID (price_...): ');
  const pricePremium = await question('Premium Report Price ID (price_...): ');
  
  // Generate env file
  const envContent = `# Database
DATABASE_URL="${databaseUrl}"

# Stripe
STRIPE_SECRET_KEY="${stripeSecret}"
STRIPE_PUBLISHABLE_KEY="${stripePublishable}"
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BASIC="${priceBasic}"
STRIPE_PRICE_PREMIUM="${pricePremium}"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;
  
  fs.writeFileSync(envPath, envContent);
  log('\n✓ .env.local created successfully', 'green');
}

async function setupDatabase() {
  logSection('Database Setup');
  
  try {
    log('Generating Prisma client...', 'blue');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    log('\nPushing schema to database...', 'blue');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    log('\n✓ Database setup complete', 'green');
  } catch (error) {
    log('\n✗ Database setup failed', 'red');
    log('Please check your DATABASE_URL and ensure PostgreSQL is running', 'yellow');
    throw error;
  }
}

async function displayNextSteps() {
  logSection('Setup Complete!');
  
  log('Next steps:', 'bright');
  log('');
  log('1. Start the development server:', 'cyan');
  log('   npm run dev', 'yellow');
  log('');
  log('2. Open http://localhost:3000 in your browser', 'cyan');
  log('');
  log('3. For Stripe webhooks (local development):', 'cyan');
  log('   stripe login', 'yellow');
  log('   stripe listen --forward-to localhost:3000/api/stripe/webhook', 'yellow');
  log('');
  log('4. Read the full documentation:', 'cyan');
  log('   - INSTALLATION_GUIDE.md', 'yellow');
  log('   - README.md', 'yellow');
  log('   - DEPLOYMENT.md', 'yellow');
  log('');
  log('Happy testing! 🧠', 'green');
}

async function main() {
  log('\n');
  log('  ██████╗ ██╗  ██╗██████╗  █████╗ ███████╗███████╗', 'cyan');
  log('  ██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝', 'cyan');
  log('  ██████╔╝███████║██████╔╝███████║███████╗█████╗  ', 'cyan');
  log('  ██╔═══╝ ██╔══██║██╔══██╗██╔══██║╚════██║██╔══╝  ', 'cyan');
  log('  ██║     ██║  ██║██████╔╝██║  ██║███████║███████╗', 'cyan');
  log('  ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝', 'cyan');
  log('\n');
  log('  Setup Script', 'bright');
  log('\n');
  
  try {
    await checkPrerequisites();
    await installDependencies();
    await setupEnvironment();
    await setupDatabase();
    await displayNextSteps();
  } catch (error) {
    log(`\n✗ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
