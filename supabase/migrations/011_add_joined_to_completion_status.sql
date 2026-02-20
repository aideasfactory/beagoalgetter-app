-- Migration: Add 'joined' to completion_status enum
-- Allows posts with type 'joined' for when a user joins a challenge

ALTER TYPE completion_status ADD VALUE 'joined';
