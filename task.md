# Task List

- [/] Backend Changes
    - [ ] Add `ttsProvider` to `packages/backend/convex/schema.ts`
    - [ ] Update `create` and `editCharacter` in `packages/backend/convex/characters.ts`
- [ ] Frontend Changes
    - [ ] Update `create-character.tsx` to send `ttsProvider`
- [ ] Agent Changes
    - [ ] Update `agent.py` to route based on `ttsProvider`
- [ ] Verification
    - [ ] Verify character creation saves `ttsProvider`
    - [ ] Verify agent uses correct provider
