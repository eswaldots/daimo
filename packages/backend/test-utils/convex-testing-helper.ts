/**
 * Convex Testing Helper
 * 
 * This utility provides a testing framework for Convex functions.
 * It mocks database operations, search indexes, and provides utilities
 * for testing queries, mutations, and actions.
 * 
 * Note: In a production environment, you would use Convex's official
 * testing utilities or a more robust mocking framework.
 */

export class ConvexTestingHelper {
  private mocks: Map<string, any> = new Map()
  private spies: Map<string, any> = new Map()

  /**
   * Mock a database query result
   */
  mockQuery(table: string, data: any[]) {
    this.mocks.set(`query:${table}`, data)
  }

  /**
   * Mock a search index query result
   */
  mockSearchIndex(
    table: string,
    indexName: string,
    searchTerm: string,
    data: any[]
  ) {
    this.mocks.set(`searchIndex:${table}:${indexName}:${searchTerm}`, data)
  }

  /**
   * Spy on search index calls
   */
  spyOnSearchIndex(table: string, indexName: string, spy: any) {
    this.spies.set(`searchIndex:${table}:${indexName}`, spy)
  }

  /**
   * Run a query with mocked data
   */
  async runQuery(queryName: string, args: any): Promise<any> {
    if (queryName === 'tags.list') {
      return this.executeTagsList(args)
    }
    throw new Error(`Query ${queryName} not mocked`)
  }

  /**
   * Run a mutation with mocked data
   */
  async runMutation(mutationName: string, args: any): Promise<any> {
    if (mutationName === 'tags.internal.createTag') {
      return this.executeCreateTag(args)
    }
    if (mutationName === 'tags.internal.relateTag') {
      return this.executeRelateTag(args)
    }
    throw new Error(`Mutation ${mutationName} not mocked`)
  }

  /**
   * Run an internal query with mocked data
   */
  async runInternalQuery(queryName: string, args: any): Promise<any> {
    if (queryName === 'tags.internal.getTagByName') {
      return this.executeGetTagByName(args)
    }
    throw new Error(`Internal query ${queryName} not mocked`)
  }

  /**
   * Run an action with mocked data
   */
  async runAction(actionName: string, args: any): Promise<any> {
    if (actionName === 'characters.internal.createTagsForCharacter') {
      return this.executeCreateTagsForCharacter(args)
    }
    throw new Error(`Action ${actionName} not mocked`)
  }

  // Private implementation methods

  private executeTagsList(args: any): any[] {
    if (args.searchTerm) {
      const spy = this.spies.get('searchIndex:tags:search_by_name')
      if (spy) {
        spy('name', args.searchTerm)
      }

      const key = `searchIndex:tags:search_by_name:${args.searchTerm}`
      return this.mocks.get(key) || []
    } else {
      const data = this.mocks.get('query:tags') || []
      return data.slice(0, 10)
    }
  }

  private executeGetTagByName(args: { name: string }): any | null {
    const allTags = this.mocks.get('query:tags') || []
    return allTags.find((tag: any) => tag.name === args.name) || null
  }

  private executeCreateTag(args: { name: string }): string {
    const newId = `tag_${Date.now()}`
    const newTag = {
      _id: newId,
      name: args.name,
      _creationTime: Date.now(),
    }

    const existing = this.mocks.get('query:tags') || []
    this.mocks.set('query:tags', [...existing, newTag])

    return newId
  }

  private executeRelateTag(args: { tagId: string; characterId: string }): string {
    const newId = `relation_${Date.now()}`
    const existing = this.mocks.get('query:characterTags') || []
    this.mocks.set('query:characterTags', [
      ...existing,
      { _id: newId, ...args, _creationTime: Date.now() },
    ])
    return newId
  }

  private async executeCreateTagsForCharacter(args: { characterId: string }): Promise<void> {
    // Mock implementation would call the character query and tag creation
    // This is a simplified version
    return Promise.resolve()
  }

  /**
   * Clear all mocks and spies
   */
  clear() {
    this.mocks.clear()
    this.spies.clear()
  }
}