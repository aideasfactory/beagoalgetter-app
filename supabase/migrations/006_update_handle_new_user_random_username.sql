-- Migration 006: Update handle_new_user to generate random username
-- When a user signs up without a display_name, generate one like 'user_65576'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    generated_name TEXT;
BEGIN
    -- Use provided display_name or generate a random one (e.g. user_04821)
    generated_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
        'user_' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')
    );

    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        generated_name,
        COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
            generated_name
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
