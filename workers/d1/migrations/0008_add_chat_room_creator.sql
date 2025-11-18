-- 0008_add_chat_room_creator.sql
-- Add created_by field to chat_room table to track room creator

PRAGMA foreign_keys = ON;

-- Step 1: Add created_by column to chat_room table
ALTER TABLE chat_room ADD COLUMN created_by TEXT;

-- Step 2: Migrate existing data
-- Set created_by to the user who joined first (earliest joined_at)
UPDATE chat_room
SET created_by = (
  SELECT user_id
  FROM chat_room_participant
  WHERE chat_room_participant.room_id = chat_room.room_id
  ORDER BY joined_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 3: Add foreign key constraint check (SQLite doesn't enforce FK on ALTER, but we document it)
-- Future migrations can recreate the table with proper FK if needed
-- CONSTRAINT fk_chat_room_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_room_creator ON chat_room(created_by);

-- Verification: Check that all rooms now have a creator
-- SELECT COUNT(*) as rooms_without_creator FROM chat_room WHERE created_by IS NULL;
-- Expected result: 0
