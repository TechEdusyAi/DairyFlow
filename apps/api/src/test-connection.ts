import { db } from './db'
import { products } from '@shared/schema'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    const allProducts = await db.select().from(products)
    
    console.log('✅ Connection successful!')
    console.log(`Found ${allProducts.length} products:`)
    allProducts.forEach(p => console.log(`  - ${p.name}`))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testConnection()