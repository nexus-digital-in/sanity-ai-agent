import { defineType, defineField } from 'sanity'

export const schemaTypes = [
  defineType({
    name: 'knowledge',
    title: 'Knowledge Base',
    type: 'document',
    fields: [
      defineField({
        name: 'title',
        title: 'Title',
        type: 'string',
      }),
      defineField({
        name: 'content',
        title: 'Content',
        type: 'text',
      })
    ]
  })
]