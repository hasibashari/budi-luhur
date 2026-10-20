CREATE TABLE IF NOT EXISTS daily_health_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mood VARCHAR(50) NOT NULL CHECK(mood IN ('sedih', 'murung', 'biasa_saja', 'bahagia')),
    pain VARCHAR(50) NOT NULL CHECK(pain IN ('tidak_ada', 'ringan', 'sedang', 'berat')),
    bleeding VARCHAR(50) NOT NULL CHECK(bleeding IN ('haid_normal', 'haid_banyak', 'flek', 'tidak_ada')),
    side_effects TEXT[] NOT NULL DEFAULT ARRAY['tidak_ada'],
    weight_status VARCHAR(50) NOT NULL CHECK(weight_status IN ('stabil', 'naik', 'turun')),
    weight_kg NUMERIC(5, 1),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_health_log_user_date UNIQUE(user_id, log_date)
);
