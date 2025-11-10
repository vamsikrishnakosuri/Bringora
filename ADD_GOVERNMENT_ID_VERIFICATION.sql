-- Add Government ID Verification fields to helper_applications table
-- This enables verification using Indian Government ID APIs

-- Add ID type and number fields
DO $$ 
BEGIN
  -- Add id_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'id_type') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN id_type TEXT CHECK (id_type IN ('aadhaar', 'pan', 'driving_license', 'passport', 'voter_id', 'ration_card'));
  END IF;
  
  -- Add id_number (stored encrypted/masked - only last 4 digits visible)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'id_number') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN id_number TEXT; -- Will be encrypted/masked in application
  END IF;
  
  -- Add id_number_masked (for display - shows only last 4 digits)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'id_number_masked') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN id_number_masked TEXT; -- Format: XXXX XXXX 1234
  END IF;
  
  -- Add verification status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'id_verified') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN id_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add verification API response (JSON)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'verification_api_response') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN verification_api_response JSONB;
  END IF;
  
  -- Add verification confidence score (0-100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'verification_confidence') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN verification_confidence DECIMAL(5, 2) CHECK (verification_confidence >= 0 AND verification_confidence <= 100);
  END IF;
  
  -- Add verification method used
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'verification_method') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN verification_method TEXT CHECK (verification_method IN ('ai_parichay', 'veri5digital', 'surepass', 'idfy', 'manual', 'format_only'));
  END IF;
  
  -- Add verification timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'helper_applications' AND column_name = 'verified_at') THEN
    ALTER TABLE helper_applications 
    ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_helper_applications_id_verified 
ON helper_applications(id_verified, status);

CREATE INDEX IF NOT EXISTS idx_helper_applications_id_type 
ON helper_applications(id_type);

-- Add comment for documentation
COMMENT ON COLUMN helper_applications.id_type IS 'Type of government ID: aadhaar, pan, driving_license, passport, voter_id, ration_card';
COMMENT ON COLUMN helper_applications.id_number IS 'Full ID number (encrypted/masked in application layer)';
COMMENT ON COLUMN helper_applications.id_number_masked IS 'Masked ID number for display (e.g., XXXX XXXX 1234)';
COMMENT ON COLUMN helper_applications.id_verified IS 'Whether ID was verified via government API';
COMMENT ON COLUMN helper_applications.verification_api_response IS 'Full API response from verification service (JSON)';
COMMENT ON COLUMN helper_applications.verification_confidence IS 'Confidence score from verification (0-100%)';
COMMENT ON COLUMN helper_applications.verification_method IS 'Method used for verification: ai_parichay, veri5digital, surepass, idfy, manual, format_only';


