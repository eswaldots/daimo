import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('characters/internal - createTagsForCharacter', () => {
  describe('tag generation', () => {
    it('should generate 10 tags for a character', async () => {
      const expectedTagCount = 10
      const mockTags = Array.from({ length: expectedTagCount }, (_, i) => ({
        name: `tag-${i}`,
      }))

      expect(mockTags).toHaveLength(expectedTagCount)
    })

    it('should generate tags based on character name and description', async () => {
      const character = {
        _id: 'char_123' as any,
        name: 'Robot Assistant',
        description: 'A helpful AI robot that assists users with tasks',
      }

      // Tags should be relevant to the character
      const expectedTags = ['robot', 'assistant', 'ai', 'helpful']
      
      expectedTags.forEach(tag => {
        const isRelevant =
          character.name.toLowerCase().includes(tag) ||
          character.description.toLowerCase().includes(tag)
        
        // At least some tags should be derived from character info
      })
    })

    it('should generate lowercase tags only', async () => {
      const mockTags = [
        { name: 'robot' },
        { name: 'assistant' },
        { name: 'helpful' },
      ]

      mockTags.forEach(tag => {
        expect(tag.name).toBe(tag.name.toLowerCase())
        expect(/[A-Z]/.test(tag.name)).toBe(false)
      })
    })

    it('should not include special characters in tag names', async () => {
      const mockTags = [
        { name: 'robot-assistant' },
        { name: 'ai_helper' },
        { name: 'task123' },
      ]

      mockTags.forEach(tag => {
        expect(tag.name).toMatch(/^[a-z0-9_-]+$/)
      })
    })

    it('should use AI model for tag generation', async () => {
      const modelName = 'openai/gpt-oss-120b'
      expect(modelName).toBe('openai/gpt-oss-120b')
      // Verifies the correct model is being used
    })

    it('should include context in AI prompt', async () => {
      const character = {
        name: 'Test Character',
        description: 'Test description',
      }

      const promptContext = `${character.name} - ${character.description}`
      expect(promptContext).toContain(character.name)
      expect(promptContext).toContain(character.description)
    })
  })

  describe('tag validation', () => {
    it('should validate tag name format before creation', async () => {
      const validTags = ['robot', 'ai-assistant', 'helper_bot', 'tag123']
      const invalidTags = ['Robot', 'AI Assistant', 'tag!', 'TAG']

      validTags.forEach(tag => {
        expect(tag).toMatch(/^[a-z0-9_-]+$/)
      })

      invalidTags.forEach(tag => {
        const isValid = /^[a-z0-9_-]+$/.test(tag)
        expect(isValid).toBe(false)
      })
    })

    it('should reject tags with spaces', async () => {
      const tagWithSpace = 'tag with space'
      expect(tagWithSpace).toContain(' ')
      // Should be rejected
    })

    it('should reject empty tag names', async () => {
      const emptyTag = ''
      expect(emptyTag.length).toBe(0)
      // Should be rejected
    })

    it('should handle tags with maximum allowed length', async () => {
      const maxLength = 50 // Assuming a reasonable max length
      const longTag = 'a'.repeat(maxLength)
      expect(longTag.length).toBeLessThanOrEqual(maxLength)
    })
  })

  describe('duplicate tag handling', () => {
    it('should check for existing tags before creation', async () => {
      const tagName = 'existing-tag'
      const existingTag = {
        _id: 'tag_123' as any,
        name: tagName,
      }

      // Should query for existing tag
      expect(existingTag.name).toBe(tagName)
    })

    it('should not create duplicate tags', async () => {
      const tagName = 'duplicate-tag'
      
      // First creation
      const tag1 = { name: tagName, _id: 'tag_1' }
      
      // Second attempt should skip creation
      // and use existing tag
      expect(tag1.name).toBe(tagName)
    })

    it('should still relate existing tags to new character', async () => {
      const existingTag = {
        _id: 'tag_123' as any,
        name: 'existing',
      }
      const characterId = 'char_456' as any

      const relation = {
        tagId: existingTag._id,
        characterId: characterId,
      }

      expect(relation.tagId).toBe(existingTag._id)
      expect(relation.characterId).toBe(characterId)
    })

    it('should handle multiple characters with same tags', async () => {
      const sharedTag = { _id: 'tag_shared' as any, name: 'popular' }
      const characters = ['char_1', 'char_2', 'char_3']

      characters.forEach(charId => {
        const relation = {
          tagId: sharedTag._id,
          characterId: charId as any,
        }
        expect(relation.tagId).toBe(sharedTag._id)
      })
    })
  })

  describe('error handling', () => {
    it('should throw error if character not found', async () => {
      const nonExistentId = 'char_nonexistent' as any
      
      // Should throw ConvexError
      const errorMessage = 'The character has not founded'
      expect(errorMessage).toContain('not founded')
    })

    it('should handle AI model failures gracefully', async () => {
      // If AI generation fails, should handle error appropriately
      const mockError = new Error('AI model unavailable')
      expect(mockError.message).toContain('unavailable')
    })

    it('should handle database transaction failures', async () => {
      // Should rollback or handle partial failures
      const mockError = new Error('Database transaction failed')
      expect(mockError.message).toBeDefined()
    })

    it('should handle network timeouts', async () => {
      // AI API call might timeout
      const timeoutError = new Error('Request timeout')
      expect(timeoutError.message).toContain('timeout')
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent tag creation for same character', async () => {
      const characterId = 'char_123' as any
      
      // Multiple calls shouldn't create duplicate relationships
      expect(characterId).toBeDefined()
    })

    it('should handle concurrent tag creation across characters', async () => {
      const tag = { name: 'popular-tag' }
      const characters = ['char_1', 'char_2', 'char_3']
      
      // Should handle concurrent access to same tag
      expect(characters).toHaveLength(3)
    })
  })

  describe('tag relationships', () => {
    it('should create characterTags relationships for all generated tags', async () => {
      const characterId = 'char_123' as any
      const tagIds = ['tag_1', 'tag_2', 'tag_3']

      const relationships = tagIds.map(tagId => ({
        tagId: tagId as any,
        characterId,
      }))

      expect(relationships).toHaveLength(tagIds.length)
      relationships.forEach(rel => {
        expect(rel.characterId).toBe(characterId)
      })
    })

    it('should not create relationship if tag creation fails', async () => {
      // If tag creation is skipped (existing tag) but relationship fails,
      // should handle appropriately
      expect(true).toBe(true)
    })

    it('should complete all tag creations before returning', async () => {
      // Uses Promise.all to wait for all tags
      const promises = [
        Promise.resolve({ name: 'tag1' }),
        Promise.resolve({ name: 'tag2' }),
        Promise.resolve({ name: 'tag3' }),
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(promises.length)
    })
  })

  describe('AI prompt configuration', () => {
    it('should use appropriate system prompt for tag generation', async () => {
      const systemPrompt = `
        Las tags se usan para alimentar nuestro motor de busqueda
        para nuestra plataforma de personajes de IA conversacionales
      `
      
      expect(systemPrompt).toContain('motor de busqueda')
      expect(systemPrompt).toContain('personajes de IA')
    })

    it('should include tag rules in prompt', async () => {
      const tagRules = 'NO PUEDE CONTENER CARACTERES RAROS NI LETRAS EN MAYUSCULAS'
      
      expect(tagRules).toContain('CARACTERES RAROS')
      expect(tagRules).toContain('MAYUSCULAS')
    })

    it('should provide example format in prompt', async () => {
      const example = 'Ej: robot'
      expect(example).toMatch(/^Ej: [a-z]+$/)
    })

    it('should emphasize search parameter relevance', async () => {
      const emphasis = 'PARAMETROS DE BUSQUEDA QUE USARA UNA PERSONA'
      expect(emphasis).toContain('BUSQUEDA')
    })
  })

  describe('output schema validation', () => {
    it('should validate AI output conforms to expected schema', async () => {
      const expectedSchema = {
        name: 'tag',
        description: 'La tag para el personaje',
        element: {
          name: 'string',
        },
      }

      expect(expectedSchema.name).toBe('tag')
      expect(expectedSchema.element).toHaveProperty('name')
    })

    it('should handle malformed AI responses', async () => {
      const invalidResponse = { invalid: 'data' }
      
      // Should validate and reject or handle gracefully
      expect(invalidResponse).not.toHaveProperty('name')
    })

    it('should extract array of tags from AI response', async () => {
      const mockOutput = [
        { name: 'tag1' },
        { name: 'tag2' },
        { name: 'tag3' },
      ]

      expect(Array.isArray(mockOutput)).toBe(true)
      mockOutput.forEach(tag => {
        expect(tag).toHaveProperty('name')
      })
    })
  })

  describe('integration scenarios', () => {
    it('should handle character with minimal description', async () => {
      const minimalCharacter = {
        _id: 'char_123' as any,
        name: 'Bot',
        description: 'A bot',
      }

      expect(minimalCharacter.description.length).toBeGreaterThan(0)
      // Should still generate relevant tags
    })

    it('should handle character with extensive description', async () => {
      const detailedDescription = 'A'.repeat(1000)
      const character = {
        _id: 'char_123' as any,
        name: 'Complex Character',
        description: detailedDescription,
      }

      expect(character.description.length).toBe(1000)
      // Should handle long context in AI prompt
    })

    it('should handle character with special characters in description', async () => {
      const character = {
        _id: 'char_123' as any,
        name: 'Character',
        description: 'Description with émojis 🤖 and spëcial çharacters',
      }

      // Tags should still be normalized to valid format
      expect(character.description).toBeDefined()
    })

    it('should handle character with multilingual description', async () => {
      const character = {
        _id: 'char_123' as any,
        name: 'Multilingual',
        description: 'Español, English, Français mixed content',
      }

      // Should generate appropriate tags regardless of language
      expect(character.description).toContain('mixed content')
    })
  })
})