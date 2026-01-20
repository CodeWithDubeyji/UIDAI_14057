from pathlib import Path
import duckdb

def load_data():
    BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
    DATA_DIR = BASE_DIR / "data"  # backend/data/
    
    con = duckdb.connect("uidai.duckdb")
    
    # ---- Enrollment (all parts) ----
    enrollment_pattern = str(DATA_DIR / "api_data_aadhar_enrolment_*.csv")
    con.execute(f"""
        CREATE OR REPLACE TABLE enrollment AS
        SELECT * FROM read_csv_auto('{enrollment_pattern}')
    """)
    
    # ---- Biometric (all parts) ----
    biometric_pattern = str(DATA_DIR / "api_data_aadhar_biometric_*.csv")
    con.execute(f"""
        CREATE OR REPLACE TABLE biometric AS
        SELECT * FROM read_csv_auto('{biometric_pattern}')
    """)
    
    # ---- Demographic (all parts) ----
    demographic_pattern = str(DATA_DIR / "api_data_aadhar_demographic_*.csv")
    con.execute(f"""
        CREATE OR REPLACE TABLE demographic AS
        SELECT * FROM read_csv_auto('{demographic_pattern}')
    """)
    
    print("✅ DuckDB tables created successfully")
    return con

def get_connection():
    return duckdb.connect("uidai.duckdb")