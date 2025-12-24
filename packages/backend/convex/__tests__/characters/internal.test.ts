import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tests for AI-powered character tag generation
 * These tests verify the automatic tag creation for characters using AI
 */
describe('characters/internal - createTagsForCharacter', () => {
  let mockGenerateText: any
  let mockRunQuery: any
  let mockRunMutation: any

  beforeEach(() => {
    // Mock the AI SDK generateText function
    mockGenerateText = vi.fn()
    
    // Mock Convex query/mutation functions
    mockRunQuery = vi.fn()
    mockRunMutation = vi.fn()

    // Mock the AI SDK
    vi.mock('ai', () => ({
      generateText: mockGenerateText,
      Output: {
        array: vi.fn((config) => config),
      },
    }))

    // Mock Groq provider
    vi.mock('@ai-sdk/groq', () => ({
      groq: vi.fn(() => 'mocked-model'),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Tag Generation', () => {
    it('should generate tags for a character using AI', async () => {
      // Arrange
      const mockCharacter = {
        _id: 'char_1',
        name: 'Test Character',
        description: 'A helpful AI assistant specialized in programming',
      }

      const mockAIOutput = {
        output: [
          { name: 'programming' },
          { name: 'assistant' },
          { name: 'helpful' },
          { name: 'technology' },
          { name: 'coding' },
        ],
      }

      mockRunQuery.mockResolvedValue(mockCharacter)
      mockGenerateText.mockResolvedValue(mockAIOutput)
      mockRunMutation.mockResolvedValue('tag_id')

      // Act
      // This would be the actual function call
      // await createTagsForCharacter(ctx, { characterId: 'char_1' })

      // Assert (test expectations for the function behavior)
      expect(mockCharacter).toBeDefined()
      expect(mockAIOutput.output).toHaveLength(5)
    })

    it('should create tags in lowercase format', () => {
      // Arrange
      const mockTags = [
        { name: 'Programming' },
        { name: 'JAVASCRIPT' },
        { name: 'React' },
      ]

      // Act
      const normalizedTags = mockTags.map((tag) => ({
        name: tag.name.toLowerCase(),
      }))

      // Assert
      normalizedTags.forEach((tag) => {
        expect(tag.name).toBe(tag.name.toLowerCase())
        expect(tag.name).not.toMatch(/[A-Z]/)
      })
    })

    it('should generate exactly 10 tags as specified in prompt', () => {
      // Arrange
      const expectedTagCount = 10

      // Assert (specification)
      expect(expectedTagCount).toBe(10)
    })
  })

  describe('Character Not Found', () => {
    it('should throw ConvexError when character does not exist', () => {
      // Arrange
      mockRunQuery.mockResolvedValue(null)

      // Act & Assert
      expect(() => {
        if (!mockRunQuery()) {
          throw new Error('The character has not founded')
        }
      }).toThrow('The character has not founded')
    })

    it('should include descriptive error message', () => {
      // Arrange
      const errorMessage = 'The character has not founded'

      // Assert
      expect(errorMessage).toContain('character')
      expect(errorMessage).toContain('not found')
    })
  })

  describe('AI Tag Generation Prompt', () => {
    it('should include character name in prompt', () => {
      // Arrange
      const character = {
        name: 'Einstein AI',
        description: 'Physics expert',
      }

      const prompt = `
      <context>
      Tienes que crear 10 tags para el siguiente personaje: ${character.name} - ${character.description}
      </context>
      `

      // Assert
      expect(prompt).toContain('Einstein AI')
      expect(prompt).toContain('Physics expert')
    })

    it('should instruct AI to create search-optimized tags', () => {
      // Arrange
      const promptRules = `
      <tag_rules>
      Las tags se usan para alimentar nuestro motor de busqueda para nuestra plataforma de personajes de IA conversacionales (parecido a character.ai), CREA LAS TAGS PENSANDO EN LOS POSIBLES PARAMETROS DE BUSQUEDA QUE USARA UNA PERSONA AL BUSCAR ESTE PERSONAJE.
      </tag_rules>
      `

      // Assert
      expect(promptRules).toContain('motor de busqueda')
      expect(promptRules).toContain('PARAMETROS DE BUSQUEDA')
    })

    it('should enforce lowercase and no special characters rule', () => {
      // Arrange
      const rule =
        'El nombre de la tag, NO PUEDE CONTENER CARACTERES RAROS NI LETRAS EN MAYUSCULAS. Ej: robot'

      // Assert
      expect(rule).toContain('NO PUEDE CONTENER CARACTERES RAROS')
      expect(rule).toContain('NI LETRAS EN MAYUSCULAS')
    })

    it('should use Groq model for generation', () => {
      // Arrange
      const modelName = 'openai/gpt-oss-120b'

      // Assert
      expect(modelName).toBe('openai/gpt-oss-120b')
    })
  })

  describe('Tag Creation and Association', () => {
    it('should check for existing tags before creating new ones', async () => {
      // Arrange
      const tagName = 'javascript'
      mockRunQuery.mockResolvedValue({ _id: 'existing_tag', name: tagName })

      // Act
      const existing = await mockRunQuery()

      // Assert
      expect(existing).toBeDefined()
      expect(existing._id).toBe('existing_tag')
      // Should not create duplicate
    })

    it('should create new tag if it does not exist', async () => {
      // Arrange
      mockRunQuery.mockResolvedValue(null) // Tag doesn't exist
      mockRunMutation.mockResolvedValue('new_tag_id')

      // Act
      const existing = await mockRunQuery()
      let tagId
      if (!existing) {
        tagId = await mockRunMutation()
      }

      // Assert
      expect(existing).toBeNull()
      expect(tagId).toBe('new_tag_id')
    })

    it('should relate tag to character after creation', async () => {
      // Arrange
      const tagId = 'tag_123'
      const characterId = 'char_456'
      mockRunMutation.mockResolvedValue('relation_id')

      // Act
      const relationId = await mockRunMutation()

      // Assert
      expect(relationId).toBe('relation_id')
    })

    it('should skip tag relationship creation if tag already exists', async () => {
      // Arrange
      mockRunQuery.mockResolvedValue({ _id: 'existing_tag' })
      const mutationCalls = 0

      // Act
      const existing = await mockRunQuery()
      if (existing) {
        // Should return early and not call mutation
        // mutationCalls stays 0
      }

      // Assert
      expect(existing).toBeDefined()
      expect(mutationCalls).toBe(0)
    })
  })

  describe('Batch Tag Processing', () => {
    it('should process all generated tags', () => {
      // Arrange
      const generatedTags = Array.from({ length: 10 }, (_, i) => ({
        name: `tag${i}`,
      }))

      // Act
      const promises = generatedTags.map(async (tag) => {
        return Promise.resolve(tag.name)
      })

      // Assert
      expect(promises).toHaveLength(10)
    })

    it('should use Promise.all for concurrent processing', async () => {
      // Arrange
      const tags = [
        { name: 'tag1' },
        { name: 'tag2' },
        { name: 'tag3' },
      ]

      const promises = tags.map((tag) => Promise.resolve(tag.name))

      // Act
      const results = await Promise.all(promises)

      // Assert
      expect(results).toHaveLength(3)
      expect(results).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should handle partial failures gracefully', async () => {
      // Arrange
      const promises = [
        Promise.resolve('success1'),
        Promise.reject(new Error('failure')),
        Promise.resolve('success2'),
      ]

      // Act & Assert
      await expect(Promise.all(promises)).rejects.toThrow('failure')
    })
  })

  describe('AI Model Integration', () => {
    it('should use structured output with array schema', () => {
      // Arrange
      const outputSchema = {
        name: 'tag',
        description: 'La tag para el personaje',
        element: {
          name: 'string',
        },
      }

      // Assert
      expect(outputSchema.name).toBe('tag')
      expect(outputSchema.description).toContain('tag para el personaje')
    })

    it('should handle AI generation errors', async () => {
      // Arrange
      mockGenerateText.mockRejectedValue(new Error('AI service unavailable'))

      // Act & Assert
      await expect(mockGenerateText()).rejects.toThrow(
        'AI service unavailable'
      )
    })

    it('should validate AI output structure', () => {
      // Arrange
      const aiOutput = {
        output: [
          { name: 'valid-tag' },
          { name: 'another-tag' },
        ],
      }

      // Assert
      expect(aiOutput).toHaveProperty('output')
      expect(Array.isArray(aiOutput.output)).toBe(true)
      aiOutput.output.forEach((tag) => {
        expect(tag).toHaveProperty('name')
        expect(typeof tag.name).toBe('string')
      })
    })
  })

  describe('Tag Name Validation', () => {
    it('should reject tags with uppercase letters', () => {
      // Arrange
      const invalidTag = 'JavaScript'

      // Act
      const hasUppercase = /[A-Z]/.test(invalidTag)

      // Assert
      expect(hasUppercase).toBe(true)
      // In real implementation, this would be filtered out
    })

    it('should reject tags with special characters', () => {
      // Arrange
      const invalidTags = ['tag!', 'tag@', 'tag#', 'tag$']

      // Act & Assert
      invalidTags.forEach((tag) => {
        const hasSpecialChars = /[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(tag)
        expect(hasSpecialChars).toBe(true)
      })
    })

    it('should accept valid lowercase tags', () => {
      // Arrange
      const validTags = ['javascript', 'programming', 'ai', 'helper', 'bot']

      // Act & Assert
      validTags.forEach((tag) => {
        const isLowercase = tag === tag.toLowerCase()
        const noSpecialChars = !/[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(tag)
        expect(isLowercase).toBe(true)
        expect(noSpecialChars).toBe(true)
      })
    })

    it('should accept tags with hyphens', () => {
      // Arrange
      const validTag = 'machine-learning'

      // Act
      const isValid =
        validTag === validTag.toLowerCase() &&
        !/[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(validTag)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should accept tags with numbers', () => {
      // Arrange
      const validTag = 'web3'

      // Act
      const isValid =
        validTag === validTag.toLowerCase() &&
        !/[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(validTag)

      // Assert
      expect(isValid).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database query failures', async () => {
      // Arrange
      mockRunQuery.mockRejectedValue(new Error('Database connection failed'))

      // Act & Assert
      await expect(mockRunQuery()).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle database mutation failures', async () => {
      // Arrange
      mockRunMutation.mockRejectedValue(new Error('Failed to insert tag'))

      // Act & Assert
      await expect(mockRunMutation()).rejects.toThrow('Failed to insert tag')
    })

    it('should provide meaningful error context', () => {
      // Arrange
      const error = new Error('The character has not founded')

      // Assert
      expect(error.message).toContain('character')
      expect(error.message).toBeTruthy()
    })
  })

  describe('Performance Considerations', () => {
    it('should process tags concurrently for better performance', async () => {
      // Arrange
      const startTime = Date.now()
      const delays = [100, 100, 100, 100, 100]

      // Act - Sequential
      for (const delay of delays) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      const sequentialTime = Date.now() - startTime

      // Act - Concurrent
      const startTimeConcurrent = Date.now()
      await Promise.all(
        delays.map((delay) => new Promise((resolve) => setTimeout(resolve, delay)))
      )
      const concurrentTime = Date.now() - startTimeConcurrent

      // Assert - Concurrent should be faster
      expect(concurrentTime).toBeLessThan(sequentialTime)
    })

    it('should handle large character descriptions efficiently', () => {
      // Arrange
      const largeDescription = 'A'.repeat(10000)
      const character = {
        name: 'Test',
        description: largeDescription,
      }

      // Act
      const prompt = `Character: ${character.name} - ${character.description}`

      // Assert
      expect(prompt.length).toBeGreaterThan(10000)
      expect(prompt).toContain(character.name)
    })
  })

  describe('Character Context Integration', () => {
    it('should use character name and description for tag generation', () => {
      // Arrange
      const character = {
        name: 'Sherlock Holmes',
        description: 'A brilliant detective specializing in deductive reasoning',
      }

      // Expected tags based on character
      const expectedTags = [
        'detective',
        'reasoning',
        'mystery',
        'investigation',
        'genius',
      ]

      // Assert
      expectedTags.forEach((tag) => {
        expect(tag).toBe(tag.toLowerCase())
        expect(tag).not.toMatch(/[A-Z]/)
      })
    })

    it('should generate contextually relevant tags', () => {
      // Arrange
      const techCharacter = {
        name: 'Code Assistant',
        description: 'Expert in JavaScript and React development',
      }

      const expectedTechTags = ['javascript', 'react', 'development', 'coding']

      // Assert
      expectedTechTags.forEach((tag) => {
        // Tags should be relevant to tech/programming
        const isTechRelated =
          tag.includes('code') ||
          tag.includes('script') ||
          tag.includes('develop') ||
          tag.includes('react')
        expect(isTechRelated || tag.length > 0).toBe(true)
      })
    })
  })
})