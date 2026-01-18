import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDeveloper(email, name, password) {
  try {
    console.log(`\nSetting up developer: ${name} (${email})`)
    
    // 1. Create user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: 'developer'
      }
    })

    if (createError) {
      console.error('❌ Failed to create user:', createError.message)
      return false
    }

    console.log('✓ User created:', userData.user.id)

    // 2. Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: email,
        name: name,
        role: 'developer',
        country: 'USA'
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      return false
    }

    console.log('✓ Profile created')
    console.log(`✅ Successfully set up ${name} as developer!`)
    console.log(`   Login: ${email}`)
    console.log(`   Password: ${password}`)
    
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

// Set up developers
const developers = [
  { email: 'shreyajadhav6600@gmail.com', name: 'Shreya Jadhav', password: 'sj6600' },
  { email: 'atharvamangutkar07@gmail.com', name: 'Atharva Mangutkar', password: 'am0077' },
]

console.log(`Setting up ${developers.length} developer(s) for the new project...\n`)

for (const dev of developers) {
  await setupDeveloper(dev.email, dev.name, dev.password)
}

console.log('\n✅ Done!')