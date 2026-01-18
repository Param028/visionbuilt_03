
import { createClient } from '@supabase/supabase-js';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Try loading .env files
const envPath = join(rootDir, '.env');
const envLocalPath = join(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

let SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
let SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getCredentials() {
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) return;

  console.log('\n\x1b[33m%s\x1b[0m', '⚠️  Missing Credentials in .env file.');
  console.log('   You can enter them now to continue temporarily.\n');

  if (!SUPABASE_URL) {
    const { url } = await inquirer.prompt([{
      type: 'input',
      name: 'url',
      message: 'Enter Supabase Project URL:',
      validate: input => input.startsWith('http') || 'Invalid URL (must start with http/https)'
    }]);
    SUPABASE_URL = url;
  }

  if (!SUPABASE_SERVICE_KEY) {
    const { key } = await inquirer.prompt([{
      type: 'password',
      name: 'key',
      message: 'Enter Supabase Service Role Key (Project Settings > API > Service Role):',
      validate: input => input.length > 20 || 'Key seems too short'
    }]);
    SUPABASE_SERVICE_KEY = key;
  }
}

async function start() {
  await getCredentials();

  // Initialize Supabase with Service Role (Bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  await mainMenu(supabase);
}

async function mainMenu(supabase) {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', '╔══════════════════════════════════════╗');
  console.log('\x1b[36m%s\x1b[0m', '║     VISION BUILT ADMIN CLI v1.1      ║');
  console.log('\x1b[36m%s\x1b[0m', '╚══════════════════════════════════════╝');
  console.log('');

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select Operation:',
      choices: [
        { name: '➕ Create Custom Order', value: 'create_order' },
        { name: '🗑️  Delete Developer/User', value: 'delete_user' },
        { name: '❌ Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'create_order') await createCustomOrder(supabase);
  if (action === 'delete_user') await deleteUser(supabase);
  if (action === 'exit') process.exit(0);

  // Loop back to menu
  console.log('\n');
  const { continue: cont } = await inquirer.prompt([{ type: 'confirm', name: 'continue', message: 'Perform another action?', default: true }]);
  if (cont) mainMenu(supabase);
  else process.exit(0);
}

async function createCustomOrder(supabase) {
  console.log('\n--- CREATE CUSTOM ORDER ---');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Client Email Address:',
      validate: input => input.includes('@') || 'Invalid email'
    },
    {
      type: 'input',
      name: 'title',
      message: 'Project Title:',
      default: 'Custom Web Application'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project Requirements:',
      default: 'Custom development as discussed.'
    },
    {
      type: 'number',
      name: 'total_amount',
      message: 'Total Agreed Price ($):',
      default: 0
    },
    {
      type: 'number',
      name: 'deposit_amount',
      message: 'Deposit Required ($):',
      default: 0
    }
  ]);

  // 1. Find User ID
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('email', answers.email)
    .single();

  if (profileError || !profiles) {
    console.log('\x1b[31m%s\x1b[0m', `User not found: ${answers.email}`);
    return;
  }

  const userId = profiles.id;
  console.log(`User Found: ${profiles.name} (${userId})`);

  // 2. Create Order Payload
  const orderPayload = {
    user_id: userId,
    type: 'service',
    service_title: answers.title,
    status: 'pending',
    total_amount: answers.total_amount,
    deposit_amount: answers.deposit_amount,
    amount_paid: 0,
    domain_requested: false,
    business_email_requested: false,
    requirements: {
      client_email: answers.email,
      client_name: profiles.name,
      requirements_text: answers.description,
      business_name: 'Custom Order',
      business_category: 'Tech'
    }
  };

  // 3. Insert
  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (insertError) {
    console.error('\x1b[31m%s\x1b[0m', 'Failed to create order:', insertError.message);
  } else {
    console.log('\x1b[32m%s\x1b[0m', `✅ Order Created Successfully! ID: ${order.id}`);
  }
}

async function deleteUser(supabase) {
  console.log('\n--- DELETE USER/DEVELOPER ---');
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: This will permanently delete the user from Authentication and Profiles.');

  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter Email of User to DELETE:',
    }
  ]);

  // 1. Find User
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .single();

  if (!profiles) {
    console.log('\x1b[31m%s\x1b[0m', 'User not found in database.');
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete ${email} (Role: ${profiles.role})?`,
      default: false
    }
  ]);

  if (!confirm) return;

  const userId = profiles.id;

  try {
    // 2. Clean up Foreign Keys
    console.log('Cleaning up references...');
    
    // Unassign tasks
    await supabase.from('tasks').update({ assigned_to_id: null }).eq('assigned_to_id', userId);
    await supabase.from('tasks').update({ created_by_id: null }).eq('created_by_id', userId);
    
    // Detach marketplace items
    await supabase.from('marketplace_items').update({ developer_id: null }).eq('developer_id', userId);

    // 3. Delete from Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) throw deleteError;

    console.log('\x1b[32m%s\x1b[0m', `✅ User ${email} successfully deleted.`);

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Deletion Failed:', err.message);
  }
}

// Start
start();
