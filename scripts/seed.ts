import { seedDatabase } from '../src/lib/seed'

async function main() {
  try {
    await seedDatabase()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()