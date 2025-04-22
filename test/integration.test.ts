import { createClient, RealtimeChannel, SupabaseClient } from '../src/index'

// These tests assume that a local Supabase server is already running
// Start a local Supabase instance with 'supabase start' before running these tests
describe('Supabase Integration Tests', () => {
  // Default local dev credentials from Supabase CLI
  const SUPABASE_URL = 'http://localhost:54321'
  const ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  const supabase = createClient(SUPABASE_URL, ANON_KEY)

  test('should connect to Supabase instance', async () => {
    expect(supabase).toBeDefined()
    expect(supabase).toBeInstanceOf(SupabaseClient)
  })

  describe('PostgREST', () => {
    test('should query data from public schema', async () => {
      const { data, error } = await supabase.from('todos').select('*').limit(5)

      // The default schema includes a 'todos' table, but it might be empty
      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    // Test creating and deleting data
    test('should create and delete a todo', async () => {
      // Create a new todo
      const { data: createdTodo, error: createError } = await supabase
        .from('todos')
        .insert({ task: 'Integration Test Todo', is_complete: false })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createdTodo).toBeDefined()
      expect(createdTodo!.task).toBe('Integration Test Todo')
      expect(createdTodo!.is_complete).toBe(false)

      // Delete the created todo
      const { error: deleteError } = await supabase.from('todos').delete().eq('id', createdTodo!.id)

      expect(deleteError).toBeNull()

      // Verify the todo was deleted
      const { data: fetchedTodo, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('id', createdTodo!.id)
        .single()

      expect(fetchError).not.toBeNull()
      expect(fetchedTodo).toBeNull()
    })
  })

  describe('Authentication', () => {
    test('should sign up a user', async () => {
      const email = `test-${Date.now()}@example.com`
      const password = 'password123'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user!.email).toBe(email)
    })
  })

  describe('Realtime', () => {
    const channelName = `channel-${crypto.randomUUID()}`
    let channel: RealtimeChannel

    beforeEach(() => {
      channel = supabase.channel(channelName, { config: { broadcast: { self: true } } })
    })

    afterEach(() => {
      supabase.removeChannel(channel)
    })

    test('should handle channel broadcast messages', async () => {
      const testMessage = { message: 'test' }
      let receivedMessage: any

      channel.on('broadcast', { event: '*' }, (payload) => (receivedMessage = payload)).subscribe()

      // Wait a bit for the subscription to establish
      await new Promise((resolve) => setTimeout(resolve, 1000))

      channel.send({ type: 'broadcast', event: 'test-event', payload: testMessage })

      // Await on message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      expect(receivedMessage).toBeDefined()
    })
  })
})
