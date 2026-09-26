// lib/sanity.js
import { createClient } from '@sanity/client'

console.log('sanity config', {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
})

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID, // 9m8pdh3h
  dataset: process.env.SANITY_DATASET,       // production
  apiVersion: '2024-01-01',
  useCdn: false,
})