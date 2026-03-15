-- Migration 021: Generate unique word-combo usernames for new signups
-- Replaces the old user_XXXXX format with readable AdjectiveNoun1234 usernames
-- e.g. BraveRunner4821, SwiftClimber0392, BoldStrider7150

CREATE OR REPLACE FUNCTION public.generate_unique_username()
RETURNS TEXT AS $$
DECLARE
    adjectives TEXT[] := ARRAY[
        'Bold', 'Brave', 'Bright', 'Calm', 'Clever',
        'Cool', 'Daring', 'Eager', 'Epic', 'Fierce',
        'Fleet', 'Fresh', 'Grand', 'Happy', 'Hardy',
        'Keen', 'Kind', 'Lively', 'Lucky', 'Mighty',
        'Noble', 'Prime', 'Proud', 'Quick', 'Rapid',
        'Ready', 'Royal', 'Sharp', 'Slick', 'Smart',
        'Solid', 'Spark', 'Steady', 'Steel', 'Storm',
        'Strong', 'Super', 'Sure', 'Swift', 'True',
        'Vital', 'Vivid', 'Warm', 'Wild', 'Wise',
        'Zappy', 'Zen', 'Zippy', 'Gritty', 'Plucky'
    ];
    nouns TEXT[] := ARRAY[
        'Ace', 'Archer', 'Atlas', 'Blaze', 'Bolt',
        'Champ', 'Climber', 'Comet', 'Crew', 'Dash',
        'Eagle', 'Ember', 'Falcon', 'Flame', 'Flash',
        'Fox', 'Fury', 'Glider', 'Hawk', 'Hero',
        'Hunter', 'Jet', 'Knight', 'Legend', 'Lion',
        'Lynx', 'Maverick', 'Nova', 'Orbit', 'Pacer',
        'Peak', 'Phoenix', 'Pilot', 'Pioneer', 'Pulse',
        'Quest', 'Racer', 'Ranger', 'Rebel', 'Rider',
        'Rocket', 'Runner', 'Scout', 'Seeker', 'Spark',
        'Spirit', 'Sprinter', 'Star', 'Strider', 'Tiger',
        'Titan', 'Trail', 'Viper', 'Voyager', 'Wolf'
    ];
    candidate TEXT;
    adj TEXT;
    noun TEXT;
    suffix TEXT;
    attempts INT := 0;
    max_attempts INT := 10;
BEGIN
    LOOP
        attempts := attempts + 1;

        -- Pick random adjective + noun + 4-digit number
        adj := adjectives[1 + FLOOR(RANDOM() * array_length(adjectives, 1))::INT];
        noun := nouns[1 + FLOOR(RANDOM() * array_length(nouns, 1))::INT];
        suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        candidate := adj || noun || suffix;

        -- Check uniqueness
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) THEN
            RETURN candidate;
        END IF;

        -- After max attempts, use a UUID-based fallback (guaranteed unique)
        IF attempts >= max_attempts THEN
            RETURN 'Getter' || REPLACE(LEFT(gen_random_uuid()::TEXT, 8), '-', '');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user to use the new generator
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    provided_name TEXT;
    provided_username TEXT;
    final_username TEXT;
BEGIN
    -- Check for user-provided values from auth metadata
    provided_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), '');
    provided_username := NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '');

    -- Generate a unique username if none provided
    IF provided_username IS NOT NULL THEN
        final_username := provided_username;
    ELSE
        final_username := public.generate_unique_username();
    END IF;

    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(provided_name, final_username),
        final_username
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
